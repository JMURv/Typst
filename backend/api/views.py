from django.contrib.auth import get_user_model, authenticate
from django.contrib.auth.hashers import make_password
from django.core.cache import cache
from django.shortcuts import get_object_or_404
from django.utils.http import urlsafe_base64_decode
from rest_framework import status, permissions
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.token_blacklist.models import (
    BlacklistedToken,
    OutstandingToken
)
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
from rest_framework_simplejwt.views import TokenObtainPairView

from services.utils import check_recaptcha
from users.serializers import UserSerializer, PasswordResetSerializer

from typst.tasks import (
    send_login_email_message_task,
    send_password_reset_message_task, send_activate_email_code_task,
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


class ActivationCodeView(APIView):
    user_model = get_user_model()
    permission_classes = (permissions.AllowAny, )

    def get(self, request, *args, **kwargs):
        is_captcha_valid = check_recaptcha(request.GET.get('captcha'))
        if is_captcha_valid:
            send_activate_email_code_task.delay(
                request.GET.get("email"),
                request.GET.get("key")
            )
            return Response(
                status=status.HTTP_200_OK
            )
        return Response(
            status=status.HTTP_400_BAD_REQUEST
        )

    def post(self, request, *args, **kwargs):
        code = request.data.get("code")
        stored_code = cache.get(
            f'activation_code_{request.data.get("key")}'
        )
        if stored_code is not None and stored_code == code:
            return Response(status=status.HTTP_200_OK)
        return Response(status=status.HTTP_400_BAD_REQUEST)


class UserLoginAPIView(TokenObtainPairView):
    user_model = get_user_model()
    permission_classes = (AllowAny,)

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == status.HTTP_200_OK:
            access_token_obj = AccessToken(response.data['access'])
            user = get_object_or_404(
                klass=self.user_model,
                id=access_token_obj['user_id']
            )

            user_avatar = user.media.first()
            response.data |= {
                'id': user.id,
                'username': user.username,
                'avatar': user_avatar.file.url if user_avatar else None,
                'email': user.email,
            }
        return response


class LoginCodeHandle(APIView):
    user_model = get_user_model()
    serializer_class = UserSerializer
    permission_classes = (permissions.AllowAny,)

    def get(self, request: Request, *args, **kwargs) -> Response:
        is_captcha_valid = check_recaptcha(
            request.GET.get('captcha')
        )
        user = authenticate(
            request,
            email=request.GET.get('email', None),
            password=request.GET.get('password', None)
        )
        if user is not None and is_captcha_valid:
            send_login_email_message_task.delay(user.id)
            return Response(status=status.HTTP_200_OK)
        return Response(status=status.HTTP_400_BAD_REQUEST)

    def post(self, request: Request) -> Response:
        user = get_object_or_404(
            klass=self.user_model,
            email=request.data.get('email', None)
        )

        stored_code = cache.get(f'login_code_{user.id}')
        if request.data.get('code', None) == stored_code:
            return Response(
                status=status.HTTP_200_OK
            )
        else:
            return Response(
                status=status.HTTP_400_BAD_REQUEST,
                data={
                    'error': 'Invalid code'
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
        uidb64 = request.data.get('uidb64', False)
        token = request.data.get('token', False)
        new_password = request.data.get('newPassword', False)

        if not all([uidb64, token, new_password]):
            return Response(
                status=status.HTTP_400_BAD_REQUEST
            )

        user = get_object_or_404(
            klass=self.user_model,
            id=urlsafe_base64_decode(uidb64).decode('utf-8')
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


class DeleteAllTokens(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request, *args, **kwargs):
        for token in OutstandingToken.objects.filter(user=request.user):
            _, _ = BlacklistedToken.objects.get_or_create(token=token)
        return Response(
            status=status.HTTP_200_OK,
        )


class LogoutView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request, *args, **kwargs):
        if self.request.data.get('all'):
            for token in OutstandingToken.objects.filter(user=request.user):
                _, _ = BlacklistedToken.objects.get_or_create(token=token)
            return Response(status=status.HTTP_200_OK)
        refresh_token = self.request.data.get('refresh_token')
        token = RefreshToken(token=refresh_token)
        token.blacklist()
        return Response(
            status=status.HTTP_200_OK
        )
