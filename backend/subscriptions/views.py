from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import status
from rest_framework.generics import (
    ListAPIView,
    CreateAPIView,
    DestroyAPIView,
)
from rest_framework.response import Response

from .models import (
    Subscription,
    UserSubscription,
)
from .serializers import (
    SubscriptionSerializer,
    UserSubscriptionSerializer,
)


class SubscriptionList(ListAPIView):
    queryset = Subscription.objects.all()
    serializer_class = SubscriptionSerializer


class UserSubscriptionCreateDelete(CreateAPIView, DestroyAPIView):
    model = UserSubscription
    queryset = UserSubscription.objects.all()
    serializer_class = UserSubscriptionSerializer

    def create(self, request, *args, **kwargs):
        is_active = UserSubscription.objects.filter(
            user_id=request.user.id,
            expiration_date__gte=timezone.now()
        ).exists()
        if is_active:
            return Response(status=status.HTTP_409_CONFLICT)
        return super().create(request, *args, **kwargs)

    def get_object(self):
        return get_object_or_404(
            klass=self.model,
            id=self.kwargs.get("sub_id")
        )
