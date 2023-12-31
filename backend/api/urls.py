from django.urls import path, include
from .views import (
    LogoutView,
    UserLoginAPIView,
    DeleteAllTokens,
    LoginCodeHandle,
    CheckUsername,
    CheckEmail,
    ForgotPassword,
    ActivationCodeView,
)
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView
)

urlpatterns = [
    path('login/', UserLoginAPIView.as_view(), name='login'),
    path('login-code/', LoginCodeHandle.as_view()),
    path('forgot-password/', ForgotPassword.as_view(), name="forgot_password"),
    path('email-activation/', ActivationCodeView.as_view()),

    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    path('token/delete-all/', DeleteAllTokens.as_view(), name='token_delete'),

    path('logout/', LogoutView.as_view(), name='logout_token'),

    path('check-username/', CheckUsername.as_view(), name="check-username"),
    path('check-email/', CheckEmail.as_view(), name="check-email"),

    path('users/', include('users.urls')),
    path('subscriptions/', include('subscriptions.urls')),
    path('chat/', include('chat.urls')),
    path('services/', include('services.urls')),
]
