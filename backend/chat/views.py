from django.contrib.auth import get_user_model
from django.db.models import Q
from rest_framework import status, permissions
from rest_framework.generics import ListAPIView, RetrieveUpdateDestroyAPIView, get_object_or_404
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Room, Message, MessageMediaFile
from .serializers import RoomSerializer, MessageSerializer, MediaFileSerializer


User = get_user_model()


class RoomListCreateDelete(APIView):
    roomModel = Room
    roomSerializer = RoomSerializer
    permission_classes = (permissions.IsAuthenticated, )

    def get(self, request, *args, **kwargs):
        rooms_qs = self.roomModel.objects.filter(members=request.user)
        serialized_rooms = self.roomSerializer(rooms_qs, many=True).data
        return Response(serialized_rooms)

    def post(self, request, *args, **kwargs):
        recipient = User.objects.get(id=request.data.get('recipient'))
        if not Room.objects.filter(members=request.user).filter(members=recipient).exists():
            obj = self.roomModel.objects.create()
            obj.members.add(request.user, recipient)
        else:
            obj = self.roomModel.objects.filter(members=request.user).filter(members=recipient).first()
        response = {'room_id': obj.id}
        return Response(response)

    def delete(self, request, *args, **kwargs):
        room = get_object_or_404(self.roomModel, id=request.data.get('roomId'))
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
        return f"api/chat/load?page={self.page.next_page_number()}&room={query_params}"


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
        room_id = request.GET.get('room')
        if room_id:
            qs = Message.objects.filter(room_id=room_id)
        else:
            qs = Message.objects.filter(user=self.request.user)
        return qs.order_by('-timestamp')


class RoomSearch(APIView):
    roomModel = Room
    roomSerializer = RoomSerializer

    def post(self, request, *args, **kwargs):
        recipient_username = request.data.get('room_search', None)
        pre_qs = self.roomModel.objects.filter(members=request.user)
        rooms_qs = pre_qs.filter(members__username__icontains=recipient_username)
        serialized_rooms = self.roomSerializer(rooms_qs, many=True).data
        return Response(serialized_rooms, status=status.HTTP_200_OK)


class ChatMedia(ListAPIView):
    serializer_class = MediaFileSerializer

    def get_queryset(self):
        qs = MessageMediaFile.objects.filter(message__room_id=self.kwargs.get('room_id'))
        return qs

    def get_object(self):
        return Room.objects.get(id=self.kwargs.get('room_id'))


