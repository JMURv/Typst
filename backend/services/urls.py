from django.urls import path
from . import views


urlpatterns = [
    path('notifications/', views.NotificationsListReadDelete.as_view()),
    path('geolocation/', views.GeolocationView.as_view()),
]
