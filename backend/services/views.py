from rest_framework import status, permissions
from rest_framework.generics import (
    ListAPIView,
    get_object_or_404
)
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView
from django.core.cache import cache

from .models import (
    Notification,
    Tag
)
from .serializers import (
    NotificationSerializer,
    TagSerializer
)
from geopy.geocoders import Nominatim


class TagsView(APIView):
    model = Tag
    serializer_class = TagSerializer
    permission_classes = (permissions.IsAuthenticated, )

    def get(self, request: Request, *args, **kwargs):
        return Response(
            status=status.HTTP_200_OK,
            data=self.serializer_class(
                self.model.objects.all(),
                many=True
            ).data
        )


class GeolocationView(APIView):
    permission_classes = (permissions.IsAuthenticated, )

    def post(self, request: Request, *args, **kwargs) -> Response:
        latitude = request.data.get('latitude')
        longitude = request.data.get('longitude')
        geolocator = Nominatim(user_agent="typst")
        location = geolocator.reverse(
            (latitude, longitude),
            exactly_one=True
        )
        if location:
            address = location.raw.get('address', {})
            country = address.get('country', '')
            city = address.get('city', '')

            cache.set(
                f'geolocation:{request.user.id}',
                {'country': country, 'city': city},
                timeout=1800
            )
            return Response(
                status=status.HTTP_200_OK
            )
        return Response(
            status=status.HTTP_400_BAD_REQUEST
        )


class NotificationsListReadDelete(ListAPIView):
    model = Notification
    serializer_class = NotificationSerializer

    def post(self, request: Request, *args, **kwargs) -> Response:
        for notification in self.model.objects.filter(recipient=request.user):
            notification.is_read = True
            notification.save()
        return Response(status=status.HTTP_200_OK)

    def delete(self, request: Request, *args, **kwargs) -> Response:
        param = request.data.get("param")
        if param == "all":
            self.model.objects.filter(recipient=request.user).delete()
        else:
            get_object_or_404(self.model, id=param).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    def get_queryset(self):
        notifications_qs = self.model.objects.filter(
            recipient=self.request.user
        ).order_by('-created_at').select_related('recipient', 'actor')
        return notifications_qs
