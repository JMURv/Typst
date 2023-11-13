from django.contrib.auth import get_user_model
from rest_framework import status, permissions
from rest_framework.generics import (
    ListAPIView,
    get_object_or_404
)
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView
from django.core.cache import cache
from typst.tasks import (
    send_activate_email_code_task
)
from .models import (
    Notification,
    Tag
)
from .serializers import (
    NotificationSerializer,
    TagSerializer
)
from geopy.geocoders import Nominatim

from .utils import check_recaptcha


class ActivationCodeView(APIView):
    user_model = get_user_model()
    permission_classes = (permissions.AllowAny, )

    def get(self, request, *args, **kwargs):
        is_captcha_valid = check_recaptcha(request.GET.get('captcha'))
        if is_captcha_valid:
            send_activate_email_code_task.delay(
                request.GET.get("email"),
                request.GET.get("key")
            )
            return Response(
                status=status.HTTP_200_OK
            )
        return Response(
            status=status.HTTP_400_BAD_REQUEST
        )

    def post(self, request, *args, **kwargs):
        code = request.data.get("code")
        stored_code = cache.get(
            f'activation_code_{request.data.get("key")}'
        )
        if stored_code is not None and stored_code == code:
            return Response(status=status.HTTP_200_OK)
        return Response(status=status.HTTP_400_BAD_REQUEST)


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
        request.user.latest_location = {
            'latitude': request.data.get('latitude'),
            'longitude': request.data.get('longitude')
        }
        request.user.save()
        return Response(
            status=status.HTTP_200_OK
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
