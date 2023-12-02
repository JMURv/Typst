import base64

from django.contrib.auth import get_user_model
from django.db.models import QuerySet
from django.shortcuts import get_object_or_404

from rest_framework.pagination import PageNumberPagination
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import permissions, status
from rest_framework.generics import (
    ListCreateAPIView,
    RetrieveUpdateDestroyAPIView
)

from services.models import Notification
from services.utils import check_recaptcha
from typst.tasks import (
    compute_user_text_recommends_task,
    send_verification_submission_email_task,
)
from .serializers import (
    UserSerializer,
    SettingsSerializer,
)
from .utils import (
    calculate_preferences_and_order,
    exclude_curr_user_and_disliked, send_ws_notification
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


class UserRetrieveUpdateDestroy(RetrieveUpdateDestroyAPIView):
    user_model = get_user_model()
    permission_classes = (permissions.IsAuthenticated,)
    queryset = user_model.objects.all()
    serializer_class = UserSerializer

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

    def get_object(self):
        return get_object_or_404(
            klass=self.user_model,
            id=self.kwargs.get("user_id")
        )


class UserBlackList(APIView):
    user_model = get_user_model()
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request: Request, *args, **kwargs):
        blacklisted_user = get_object_or_404(
            klass=self.user_model,
            id=self.kwargs.get('user_id')
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
        liked_user = get_object_or_404(
            klass=self.user_model,
            id=self.kwargs.get('user_id')
        )
        if request.user.liked.contains(liked_user):
            request.user.liked.remove(liked_user.id)
        else:
            request.user.liked.add(liked_user.id)

        if request.user.disliked.contains(liked_user):
            request.user.disliked.remove(liked_user.id)

        request.user.save()

        liked_count = request.user.liked.count()
        if liked_count > 1 and liked_count % 30 == 0:
            compute_user_text_recommends_task(
                user_id=request.user.id
            )
        return Response(
            status=status.HTTP_200_OK
        )


class UserDislike(APIView):
    user_model = get_user_model()

    def post(self, request: Request, *args, **kwargs) -> Response:
        disliked_user = get_object_or_404(
            klass=self.user_model,
            id=self.kwargs.get('user_id')
        )
        if request.user.disliked.contains(disliked_user):
            request.user.disliked.remove(disliked_user.id)
        else:
            request.user.disliked.add(disliked_user.id)

        if request.user.liked.contains(disliked_user):
            request.user.liked.remove(disliked_user.id)
        request.user.save()
        return Response(
            status=status.HTTP_200_OK
        )


class UserSettingsRetrieveUpdate(RetrieveUpdateDestroyAPIView):
    user_model = get_user_model()
    permission_classes = (permissions.IsAuthenticated,)
    queryset = user_model.objects.all()
    serializer_class = SettingsSerializer

    def get(self, request: Request, *args, **kwargs) -> Response:
        if request.user.id != kwargs.get("user_id"):
            return Response(
                status=status.HTTP_403_FORBIDDEN
            )
        return Response(
            status=status.HTTP_200_OK,
            data=self.serializer_class(
                get_object_or_404(
                    klass=self.user_model,
                    id=request.user.id
                )
            ).data
        )

    def post(self, request: Request, *args, **kwargs) -> Response:
        if request.user.id != kwargs.get("user_id"):
            return Response(
                status=status.HTTP_403_FORBIDDEN
            )
        return super().update(request, *args, **kwargs)

    def get_object(self):
        return get_object_or_404(
            klass=self.user_model,
            id=self.kwargs.get("user_id")
        )


class VerifyUser(APIView):
    def post(self, request, *args, **kwargs):
        if request.user.is_verified == "true":
            return Response(status=status.HTTP_400_BAD_REQUEST)
        is_photo = request.data.get('file', None)
        if is_photo:
            data, name = is_photo.read(), is_photo.name
            photo_data_base64 = base64.b64encode(data).decode()
            request.user.is_verified = "in progress"
            request.user.save()
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
        user_profile.is_verified = "true"
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
        user_profile.is_verified = "false"
        user_profile.save()
        new_notification = Notification.objects.create(
            recipient=user_profile,
            message="Your profile has not been verified",
            action="declined_submission"
        )
        send_ws_notification(user_id, new_notification)
        return Response(status=status.HTTP_200_OK)
    return Response(status=status.HTTP_403_FORBIDDEN)
