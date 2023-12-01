from django.contrib.auth import get_user_model
from django.core.files.base import ContentFile
from rest_framework import permissions, status
from rest_framework.generics import get_object_or_404
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from users.models import UserMedia, UserStories
from .serializers import (
    MediaFileSerializer,
    MediaFileBytesSerializer
)


class MediaRetrieveCreateDestroy(APIView):
    user_model = get_user_model()
    user_media_model = UserMedia
    user_stories_model = UserStories
    media_serializer = MediaFileSerializer
    media_bytes_serializer = MediaFileBytesSerializer
    permission_classes = (permissions.AllowAny,)

    def get(self, request: Request, *args, **kwargs):
        return Response(
            status=status.HTTP_200_OK,
            data=self.media_bytes_serializer(
                self.user_media_model.objects.filter(
                    author_id=kwargs.get("user_id")
                ),
                many=True
            ).data
        )

    def post(self, request: Request, *args, **kwargs) -> Response:
        user = request.user
        if user.is_authenticated and user.id == kwargs.get('user_id'):
            curr_model = self.user_media_model
            if request.data.get("type", None) == "stories":
                curr_model = self.user_stories_model
            file = request.data.get('file')
            data = file.read()
            new_file = curr_model(author=user)
            new_file.file.save(
                name=file.name,
                content=ContentFile(data)
            )
            new_file.save()

            return Response(
                status=status.HTTP_200_OK,
                data=self.media_serializer(new_file).data
            )
        return Response(
            status=status.HTTP_403_FORBIDDEN
        )

    def delete(self, request: Request, *args, **kwargs) -> Response:
        user = request.user
        if user.is_authenticated and user.id == kwargs.get('user_id'):
            curr_model = self.user_media_model
            if request.data.get("type", None) == "stories":
                curr_model = self.user_stories_model
            media_object = get_object_or_404(
                curr_model,
                id=request.data.get('mediaId')
            )
            media_object.file.delete(save=False)
            media_object.delete()
            return Response(
                status=status.HTTP_204_NO_CONTENT
            )
        return Response(
            status=status.HTTP_403_FORBIDDEN
        )
