import json
from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from django.contrib.auth import get_user_model
from django.core.files.storage import default_storage
from django.shortcuts import get_object_or_404
import base64

from .serializers import MessageSerializer
from .models import Message, MessageMediaFile, Room
from services.models import Notification

from users.utils import send_ws_notification

User = get_user_model()


class ChatConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        self.user_id = self.scope["url_route"]["kwargs"]["user_id"]
        self.rooms = await self.get_user_chat_rooms()

        for room_id in self.rooms:
            room_group_name = f"chat_{room_id}"
            await self.channel_layer.group_add(
                room_group_name,
                self.channel_name
            )
        await self.accept()

    async def disconnect(self, close_code):
        for room_id in self.rooms:
            room_group_name = f"chat_{room_id}"
            await self.channel_layer.group_discard(
                room_group_name,
                self.channel_name
            )

    async def receive(self, text_data):
        data = json.loads(text_data)
        room_group_name = f"chat_{data.get('room')}"
        received_type = data.get('type')

        if received_type == 'edit':
            message_data = await self.edit_message(data)
            message_data |= {'type': 'edit'}
            return await self.channel_layer.group_send(
                room_group_name, message_data
            )
        elif received_type == 'remove':
            await self.delete_message(data)
            return await self.channel_layer.group_send(
                room_group_name, data
            )
        elif received_type == "seen":
            await self.seen_message(data)
            return await self.channel_layer.group_send(
                room_group_name, data
            )
        else:
            message_data = await self.create_message(data)
            if message_data is not False:
                message_data |= {'type': 'chat_message'}
                return await self.channel_layer.group_send(
                    room_group_name, message_data
                )

    async def seen(self, event):
        await self.send(text_data=json.dumps(event))

    async def remove(self, event):
        await self.send(text_data=json.dumps(event))

    async def edit(self, event):
        await self.send(text_data=json.dumps(event))

    async def chat_message(self, event):
        await self.send(text_data=json.dumps(event))

    @database_sync_to_async
    def get_user_chat_rooms(self):
        qs = Room.objects.filter(members__in=[self.user_id])
        return list(qs.values_list('id', flat=True))

    @database_sync_to_async
    def create_message(self, data):
        user_id = data.get('user')
        media_files = data.get('media_files')
        content = data.get('message')
        room_id = data.get('room')
        reply = data.get('reply')

        user = get_object_or_404(User, id=user_id)
        room = get_object_or_404(Room, id=room_id)
        member = room.members.all().exclude(id=user_id).first()

        if member.blacklist.contains(user):
            return False

        if member.new_message_notification:
            message = f'{user.username}: {content}'
            notification = Notification.objects.create(
                recipient_id=member.id,
                actor_id=user_id,
                action="message",
                message=message
            )
            send_ws_notification(
                user_id=member.id,
                notification=notification
            )

        new_message = Message.objects.create(
            room_id=room_id,
            user_id=user_id,
            content=content,
            reply_id=reply if reply else None
        )
        if media_files:
            for file_data in media_files:
                file_name = file_data.get("name")
                file_content = base64.b64decode(file_data.get('data'))
                file_path = f"messages/media/{file_name}"
                with default_storage.open(file_path, 'wb+') as destination:
                    destination.write(file_content)

                MessageMediaFile.objects.create(
                    message=new_message,
                    file=file_path
                )
        return MessageSerializer(new_message).data

    @database_sync_to_async
    def seen_message(self, data):
        message_obj = get_object_or_404(
            Message,
            id=data.get("message"),
            room__id=data.get("room")
        )
        message_obj.seen = True
        message_obj.save()
        return MessageSerializer(message_obj).data

    @database_sync_to_async
    def edit_message(self, data):
        message = data.get("message")
        room_obj = get_object_or_404(Room, id=data.get("room"))
        message_obj = get_object_or_404(Message, room=room_obj, id=message.get("id"))
        message_obj.content = message.get("content")
        message_obj.edited = True
        message_obj.save()
        return MessageSerializer(message_obj).data

    @database_sync_to_async
    def delete_message(self, data):
        room_obj = get_object_or_404(Room, id=data.get("room"))
        message_obj = get_object_or_404(Message, room=room_obj, id=data.get("message"))
        message_obj.delete()


class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user_id = self.scope["url_route"]["kwargs"]["user_id"]
        await self.channel_layer.group_add(f"user_{self.user_id}", self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(f"user_{self.user_id}", self.channel_name)

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)

    async def send_notification(self, event):
        await self.send(text_data=json.dumps(event))

