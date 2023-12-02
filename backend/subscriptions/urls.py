from django.urls import path
from .views import (
    SubscriptionList,
    UserSubscriptionCreateDelete,
)


urlpatterns = [
    path('', SubscriptionList.as_view()),
    path('<int:sub_id>/', UserSubscriptionCreateDelete.as_view()),
]
