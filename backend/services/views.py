from rest_framework import status, permissions
from rest_framework.generics import ListAPIView, DestroyAPIView, get_object_or_404
from rest_framework.response import Response
from rest_framework.views import APIView
from django.core.cache import cache

from .models import Notification
from .serializers import NotificationSerializer
from geopy.geocoders import Nominatim


class GeolocationView(APIView):
    permission_classes = (permissions.IsAuthenticated, )

    def post(self, request, *args, **kwargs):
        latitude = request.data.get('latitude')
        longitude = request.data.get('longitude')
        geolocator = Nominatim(user_agent="typst")
        location = geolocator.reverse((latitude, longitude), exactly_one=True)
        if location:
            address = location.raw.get('address', {})
            country = address.get('country', '')
            city = address.get('city', '')

            cache_key = f'geolocation:{request.user.id}'
            cache_data = {'country': country, 'city': city}
            cache.set(cache_key, cache_data, timeout=1800)
            return Response(status=status.HTTP_200_OK)
        return Response(status=status.HTTP_400_BAD_REQUEST)


class NotificationsListReadDelete(ListAPIView):
    model = Notification
    serializer_class = NotificationSerializer

    def post(self, request, *args, **kwargs):
        for notification in self.model.objects.filter(recipient=request.user):
            notification.is_read = True
            notification.save()
        return Response(status=status.HTTP_200_OK)

    def delete(self, request, *args, **kwargs):
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
