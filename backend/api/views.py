from django.contrib.auth import get_user_model, authenticate
from django.core.cache import cache
from django.shortcuts import get_object_or_404
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
from users.serializers import UserSerializer

from typst.tasks import (
    send_login_email_message_task,
)


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
