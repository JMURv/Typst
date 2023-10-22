from django.urls import path
from . import views

urlpatterns = [
    path('', views.RoomListCreateDelete.as_view()),
    path('search/rooms/', views.RoomSearch.as_view()),
    path('load/', views.ChatLoadMore.as_view(), name="load-more-messages"),
    path('<int:room_id>/media/', views.ChatMedia.as_view()),
    path('message/<int:pk>/', views.MessageRetrieveUpdateDestroy.as_view()),
]
