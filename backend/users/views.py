import base64

from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password
from django.contrib.auth.tokens import default_token_generator
from django.core.files.base import ContentFile
from django.db.models import QuerySet
from django.shortcuts import get_object_or_404
from django.utils.http import urlsafe_base64_decode
from rest_framework import permissions, status

from rest_framework.generics import (
    ListCreateAPIView,
    RetrieveUpdateDestroyAPIView
)
from rest_framework.pagination import PageNumberPagination
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from rest_framework_simplejwt.token_blacklist.models import (
    OutstandingToken,
    BlacklistedToken
)

from services.models import Notification
from services.utils import check_recaptcha
from typst.tasks import (
    send_password_reset_message_task,
    compute_user_text_recommends_task,
    send_verification_submission_email_task,
)

from django.core.cache import cache

from .serializers import (
    UserSerializer,
    LightUserSerializer,
    SettingsSerializer,
    MediaFileSerializer,
    PasswordResetSerializer,
    MediaFileBytesSerializer
)
from .models import UserMedia
from .utils import (
    calculate_preferences_and_order,
    exclude_curr_user_and_disliked, send_ws_notification
)


class GetCurrentUser(APIView):
    user_model = get_user_model()

    def get(self, request: Request, *args, **kwargs) -> Response:
        return Response(
            status=status.HTTP_200_OK,
            data=LightUserSerializer(
                get_object_or_404(
                    klass=self.user_model,
                    id=request.user.id
                )
            ).data
        )


class GetCurrentUserSettings(APIView):
    user_model = get_user_model()

    def get(self, request: Request, *args, **kwargs) -> Response:
        return Response(
            status=status.HTTP_200_OK,
            data=SettingsSerializer(
                get_object_or_404(
                    klass=self.user_model,
                    id=request.user.id
                )
            ).data
        )


class CheckUsername(APIView):
    user_model = get_user_model()
    permission_classes = (permissions.AllowAny,)

    def post(self, request: Request, *args, **kwargs) -> Response:
        return Response(
            status=status.HTTP_200_OK,
            data={
                'username_exists': self.user_model.objects.filter(
                    username__iexact=request.data.get('username')
                ).exists()
            },
        )


class CheckEmail(APIView):
    user_model = get_user_model()
    permission_classes = (permissions.AllowAny,)

    def post(self, request: Request, *args, **kwargs) -> Response:
        return Response(
            status=status.HTTP_200_OK,
            data={
                'email_exists': self.user_model.objects.filter(
                    email__iexact=request.data.get('email')
                ).exists()
            },
        )


class ForgotPassword(APIView):
    user_model = get_user_model()
    serializer_class = PasswordResetSerializer
    permission_classes = (permissions.AllowAny,)

    def get(self, request: Request, *args, **kwargs) -> Response:
        email = request.GET.get('email')
        try:
            user = self.user_model.objects.filter(email=email).first()
        except self.user_model.DoesNotExist:
            return Response(
                status=status.HTTP_400_BAD_REQUEST
            )
        else:
            send_password_reset_message_task.delay(user.id)
            return Response(
                status=status.HTTP_200_OK
            )

    def post(self, request: Request, *args, **kwargs) -> Response:
        uidb64 = request.data.get('uidb64', None)
        token = request.data.get('token', None)
        new_password = request.data.get('newPassword', None)

        if not uidb64 or not token or not new_password:
            return Response(
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = self.user_model.objects.get(
                id=urlsafe_base64_decode(uidb64).decode('utf-8')
            )
        except self.user_model.DoesNotExist:
            return Response(
                status=status.HTTP_400_BAD_REQUEST
            )
        stored_token = cache.get(f'password_reset_code_{user.id}')
        if stored_token is not None and stored_token == token:
            for token in OutstandingToken.objects.filter(user=user):
                _, _ = BlacklistedToken.objects.get_or_create(token=token)
            user.password = make_password(new_password)
            user.save()
            return Response(
                status=status.HTTP_200_OK
            )
        return Response(
            status=status.HTTP_400_BAD_REQUEST
        )


class UsersPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 1000

    def get_next_link(self):
        if not self.page.has_next():
            return None
        return f"users/?page={self.page.next_page_number()}"


class UserListCreate(ListCreateAPIView):
    user_model = get_user_model()
    serializer_class = UserSerializer
    permission_classes = (permissions.AllowAny,)
    pagination_class = UsersPagination

    def get_queryset(self) -> QuerySet:
        qs = self.user_model.objects.all()
        if self.request.user.orientation != "bi":
            qs = qs.filter(
                sex=self.request.user.orientation
            )
        ordered_qs = calculate_preferences_and_order(
            user=self.request.user,
            qs=qs
        )
        excluded_qs = exclude_curr_user_and_disliked(
            user=self.request.user,
            qs=ordered_qs
        )
        return excluded_qs

    def get(self, request: Request, *args, **kwargs) -> Response:
        if not request.user.is_authenticated:
            return Response(
                status=status.HTTP_401_UNAUTHORIZED
            )
        return super().get(request, *args, **kwargs)

    def post(self, request: Request, *args, **kwargs) -> Response:
        password = request.data.get('password')
        email = request.data.get('email')
        is_captcha_valid = check_recaptcha(request.data.get('captcha'))

        if not is_captcha_valid:
            return Response(
                status=status.HTTP_400_BAD_REQUEST,
                data={
                    'error': 'reCAPTCHA failed'
                }
            )

        if not password or not email:
            return Response(
                status=status.HTTP_400_BAD_REQUEST,
                data={
                    'error': 'Please provide password and email.'
                },
            )
        try:
            serializer = UserSerializer(
                data=request.data,
                context={
                    'request': request
                }
            )
            if serializer.is_valid():
                new_user = serializer.save()
                return Response(
                    status=status.HTTP_201_CREATED,
                    data={
                        'user_id': new_user.id
                    },
                )
            else:
                print(serializer.errors)
                return Response(
                    data=serializer.errors,
                    status=status.HTTP_400_BAD_REQUEST
                )
        except Exception as e:
            print(e)
            return Response(
                status=status.HTTP_400_BAD_REQUEST,
                data={
                    'error': 'Username already exists.'
                },
            )


class ConfirmEmail(APIView):
    user_model = get_user_model()
    permission_classes = (permissions.AllowAny,)

    def get(self, request: Request, uidb64: str, token: str) -> Response:
        try:
            uid = urlsafe_base64_decode(uidb64)
            user = self.user_model.objects.get(pk=uid)
        except (
                TypeError,
                ValueError,
                OverflowError,
                self.user_model.DoesNotExist
        ):
            user = None
        if default_token_generator.check_token(user, token):
            user.is_active = True
            user.save()
            return Response(
                status=status.HTTP_200_OK
            )
        else:
            return Response(
                status=status.HTTP_400_BAD_REQUEST
            )


class UserRetrieveUpdateDestroy(RetrieveUpdateDestroyAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    queryset = get_user_model().objects.all()
    serializer_class = LightUserSerializer

    def update(self, request: Request, *args, **kwargs) -> Response:
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data)
        if not serializer.is_valid():
            print(serializer.errors)
        if request.user != instance:
            return Response(
                status=status.HTTP_403_FORBIDDEN
            )
        return super().update(request, *args, **kwargs)

    def destroy(self, request: Request, *args, **kwargs) -> Response:
        instance = self.get_object()
        if request.user != instance:
            return Response(
                status=status.HTTP_403_FORBIDDEN
            )
        return super().destroy(request, *args, **kwargs)


class UserBlackList(APIView):
    user_model = get_user_model()
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request: Request, *args, **kwargs):
        blacklisted_user = get_object_or_404(
            klass=self.user_model,
            id=self.kwargs.get('pk')
        )
        if request.user.blacklist.contains(blacklisted_user):
            request.user.blacklist.remove(blacklisted_user.id)
        else:
            request.user.blacklist.add(blacklisted_user.id)
        request.user.save()
        return Response(
            status=status.HTTP_200_OK
        )


class UserLike(APIView):
    user_model = get_user_model()

    def post(self, request: Request, *args, **kwargs) -> Response:
        user_profile = self.get_object()
        if request.user.liked.contains(user_profile):
            request.user.liked.remove(user_profile.id)
        else:
            request.user.liked.add(user_profile.id)

        if request.user.disliked.contains(user_profile):
            request.user.disliked.remove(user_profile.id)

        request.user.save()

        liked_count = request.user.liked.count()
        if liked_count > 1 and liked_count % 30 == 0:
            compute_user_text_recommends_task(
                user_id=request.user.id
            )
        return Response(
            status=status.HTTP_200_OK
        )

    def get_object(self):
        obj = get_object_or_404(
            klass=self.user_model,
            id=self.kwargs.get('pk')
        )
        return obj


class UserDislike(APIView):
    user_model = get_user_model()

    def post(self, request: Request, *args, **kwargs) -> Response:
        user_profile = self.get_object()
        if request.user.disliked.contains(user_profile):
            request.user.disliked.remove(user_profile.id)
        else:
            request.user.disliked.add(user_profile.id)

        if request.user.liked.contains(user_profile):
            request.user.liked.remove(user_profile.id)
        request.user.save()
        return Response(
            status=status.HTTP_200_OK
        )

    def get_object(self):
        obj = get_object_or_404(
            klass=self.user_model,
            id=self.kwargs.get('pk')
        )
        return obj


class MediaRetrieveCreateDestroy(APIView):
    user_model = get_user_model()
    user_media_model = UserMedia
    user_media_serializer = MediaFileSerializer
    user_media_bytes_serializer = MediaFileBytesSerializer
    permission_classes = (permissions.AllowAny,)

    def get(self, request: Request, *args, **kwargs):
        return Response(
            status=status.HTTP_200_OK,
            data=self.user_media_bytes_serializer(
                self.user_media_model.objects.filter(
                    author_id=kwargs.get("pk")
                ),
                many=True
            ).data
        )

    def post(self, request: Request, *args, **kwargs) -> Response:
        user = request.user
        if user.is_authenticated and user.id == kwargs.get('pk'):
            file = request.data.get('file')
            data = file.read()
            new_file = self.user_media_model(author=user)
            new_file.file.save(
                name=file.name,
                content=ContentFile(data)
            )
            new_file.save()

            return Response(
                status=status.HTTP_200_OK,
                data=self.user_media_serializer(new_file).data
            )
        return Response(
            status=status.HTTP_403_FORBIDDEN
        )

    def delete(self, request: Request, *args, **kwargs) -> Response:
        user = request.user
        if user.is_authenticated and user.id == kwargs.get('pk'):
            media_object = get_object_or_404(
                self.user_media_model,
                id=request.data.get('mediaId')
            )
            media_object.file.delete(save=False)
            media_object.delete()
            return Response(
                status=status.HTTP_204_NO_CONTENT
            )
        return Response(
            status=status.HTTP_403_FORBIDDEN
        )


class UserSettingsUpdate(RetrieveUpdateDestroyAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    queryset = get_user_model().objects.all()
    serializer_class = SettingsSerializer

    def post(self, request: Request, *args, **kwargs) -> Response:
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data)
        # print(request.data)
        if not serializer.is_valid():
            print(serializer.errors)
        if request.user != instance:
            return Response(
                status=status.HTTP_403_FORBIDDEN
            )
        return super().update(request, *args, **kwargs)


class VerifyUser(APIView):
    def post(self, request, *args, **kwargs):
        is_photo = request.data.get('file', None)
        if is_photo:
            data, name = is_photo.read(), is_photo.name
            photo_data_base64 = base64.b64encode(data).decode()
            send_verification_submission_email_task.delay(
                user_id=request.user.id,
                photo_name=name,
                photo_data=photo_data_base64,
            )
            return Response(status=status.HTTP_200_OK)
        return Response(status=status.HTTP_400_BAD_REQUEST)


def approve_verification(request, user_id):
    if request.user.is_staff:
        user_profile = get_object_or_404(get_user_model(), id=user_id)
        user_profile.is_verified = True
        user_profile.save()

        new_notification = Notification.objects.create(
            recipient=user_profile,
            message="Your profile has been verified",
            action="verified_submission"
        )
        send_ws_notification(user_id, new_notification)
        return Response(status=status.HTTP_200_OK)
    return Response(status=status.HTTP_403_FORBIDDEN)


def decline_verification(request, user_id):
    if request.user.is_staff:
        user_profile = get_object_or_404(get_user_model(), id=user_id)
        new_notification = Notification.objects.create(
            recipient=user_profile,
            message="Your profile has not been verified",
            action="declined_submission"
        )
        send_ws_notification(user_id, new_notification)
        return Response(status=status.HTTP_200_OK)
    return Response(status=status.HTTP_403_FORBIDDEN)
