from django.urls import path

from mediafiles.views import MediaRetrieveCreateDestroy
from . import views

urlpatterns = [
    path('', views.UserListCreate.as_view(), name='user-list-create'),
    path('verify/', views.VerifyUser.as_view()),
    path('<int:user_id>/blacklist/', views.UserBlackList.as_view(), name='user-blacklist'),
    path('<int:user_id>/like/', views.UserLike.as_view(), name='user-like'),
    path('<int:user_id>/dislike/', views.UserDislike.as_view(), name='user-dislike'),

    path('<int:user_id>/media/', MediaRetrieveCreateDestroy.as_view(), name='media-create-destroy'),
    path('<int:user_id>/settings/', views.UserSettingsRetrieveUpdate.as_view(), name='user-settings-retrieve-update'),
    path('<int:user_id>/', views.UserRetrieveUpdateDestroy.as_view(), name='user-retrieve-update-destroy'),
]
