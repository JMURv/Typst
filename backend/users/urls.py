from django.urls import path
from . import views

urlpatterns = [
    path('', views.UserListCreate.as_view(), name='user-list-create'),
    path('me/', views.GetCurrentUser.as_view(), name='me'),
    path('me/settings/', views.GetCurrentUserSettings.as_view(), name='me-settings'),
    path('check-username/', views.CheckUsername.as_view(), name="check-username"),
    path('check-email/', views.CheckEmail.as_view(), name="check-email"),
    path('forgot-password/', views.ForgotPassword.as_view(), name="forgot_password"),
    path('<int:pk>/verify/', views.VerifyUser.as_view()),
    path('<int:pk>/blacklist/', views.UserBlackList.as_view(), name='user-blacklist'),
    path('<int:pk>/like/', views.UserLike.as_view(), name='user-like'),
    path('<int:pk>/dislike/', views.UserDislike.as_view(), name='user-dislike'),
    path('<int:pk>/media/', views.MediaRetrieveCreateDestroy.as_view(), name='media-create-destroy'),
    path('<int:pk>/settings/', views.UserSettingsUpdate.as_view(), name='user-settings-update'),
    path('<int:pk>/', views.UserRetrieveUpdateDestroy.as_view(), name='user-retrieve-update-destroy'),
]
