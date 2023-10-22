from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView, TokenVerifyView
from .views import LogoutView, UserLoginAPIView, DeleteAllTokens

urlpatterns = [
    path('login/', UserLoginAPIView.as_view(), name='login'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    path('token/delete-all/', DeleteAllTokens.as_view(), name='token_delete'),
    path('logout/', LogoutView.as_view(), name='logout_token'),
    path('users/', include('users.urls')),
    path('chat/', include('chat.urls')),
    path('services/', include('services.urls')),
]
