from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.token_blacklist.models import (
    BlacklistedToken,
    OutstandingToken
)
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
from rest_framework_simplejwt.views import TokenObtainPairView


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
