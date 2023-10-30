from django.contrib.auth import get_user_model
from rest_framework import status, permissions
from rest_framework.generics import (
    ListAPIView,
    RetrieveUpdateDestroyAPIView,
    get_object_or_404
)
from rest_framework.pagination import PageNumberPagination
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Room, Message, MessageMediaFile
from .serializers import RoomSerializer, MessageSerializer, MediaFileSerializer


class RoomListCreateDelete(APIView):
    user_model = get_user_model()
    room_model = Room
    room_serializer = RoomSerializer
    permission_classes = (permissions.IsAuthenticated, )

    def get(self, request: Request, *args, **kwargs) -> Response:
        rooms_qs = self.room_model.objects.filter(members=request.user)
        serialized_rooms = self.room_serializer(rooms_qs, many=True).data
        return Response(serialized_rooms)

    def post(self, request: Request, *args, **kwargs) -> Response:
        recipient = self.user_model.objects.get(
            id=request.data.get('recipient')
        )
        if not Room.objects.filter(
                members=request.user
        ).filter(members=recipient).exists():
            obj = self.room_model.objects.create()
            obj.members.add(request.user, recipient)
        else:
            obj = self.room_model.objects.filter(
                members=request.user
            ).filter(members=recipient).first()
        response = {'room_id': obj.id}
        return Response(response)

    def delete(self, request, *args, **kwargs):
        room = get_object_or_404(
            queryset=self.room_model,
            id=request.data.get('roomId')
        )
        room.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class MessagesPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 1000

    def get_next_link(self):
        if not self.page.has_next():
            return None
        query_params = self.request.query_params.copy().get("room")
        next_page_number = self.page.next_page_number()

        return f"api/chat/load?page={next_page_number}&room={query_params}"


class MessageRetrieveUpdateDestroy(RetrieveUpdateDestroyAPIView):
    model = Message
    serializer_class = MessageSerializer

    def get_queryset(self):
        qs = self.model.objects.filter(user=self.request.user)
        return qs


class ChatLoadMore(ListAPIView):
    serializer_class = MessageSerializer
    pagination_class = MessagesPagination

    def get_queryset(self):
        request = self.request
        room_id = request.GET.get('room', None)
        if room_id:
            qs = Message.objects.filter(room_id=room_id)
        else:
            qs = Message.objects.filter(user=self.request.user)
        return qs.order_by('-timestamp')


class RoomSearch(APIView):
    roomModel = Room
    roomSerializer = RoomSerializer

    def post(self, request: Request, *args, **kwargs) -> Response:
        recipient_username = request.data.get('room_search', None)
        pre_qs = self.roomModel.objects.filter(members=request.user)
        rooms_qs = pre_qs.filter(
            members__username__icontains=recipient_username
        )
        serialized_rooms = self.roomSerializer(
            rooms_qs,
            many=True
        ).data
        return Response(serialized_rooms, status=status.HTTP_200_OK)


class ChatMedia(ListAPIView):
    serializer_class = MediaFileSerializer

    def get_queryset(self):
        qs = MessageMediaFile.objects.filter(
            message__room_id=self.kwargs.get('room_id')
        )
        return qs

    def get_object(self):
        return Room.objects.get(id=self.kwargs.get('room_id'))
