from django.contrib.auth import get_user_model
from django.urls import reverse_lazy
from rest_framework import serializers

from users.serializers import LightUserSerializer
from .models import Room, Message, MessageMediaFile
import os


class RoomSerializer(serializers.ModelSerializer):
    members = LightUserSerializer(many=True)

    def get_messages(self, instance):
        messages = Message.objects.filter(
            room=instance
        ).order_by('-timestamp')[:19:-1]
        messages_serializer = MessageSerializer(messages, many=True).data

        try:
            last_message = messages_serializer[-1]
        except IndexError:
            last_message = ""

        return messages_serializer, last_message

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        next_url = reverse_lazy('load-more-messages')
        messages, last_message = self.get_messages(instance)
        representation.update({
            'messages': messages,
            'last_message': last_message,
            'next': f"{next_url}?page=2&room={instance.id}"
        })
        return representation

    class Meta:
        model = Room
        fields = [
            'id',
            'members',
        ]


class UserMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = get_user_model()
        fields = [
            'id',
            'username',
            'media',
        ]


class MediaFileSerializer(serializers.ModelSerializer):
    type = serializers.SerializerMethodField()
    relative_path = serializers.SerializerMethodField()
    file_name = serializers.SerializerMethodField()

    def get_type(self, instance):
        file_name, file_ext = os.path.splitext(instance.file.name)
        file_ext = file_ext.strip('.')
        if file_ext in ('png', 'jpg', 'jpeg'):
            return f"image/{file_ext}"
        elif file_ext in ('mp4', 'avi'):
            return f"video/{file_ext}"
        else:
            return f"file/{file_ext}"

    def get_relative_path(self, instance):
        file_path = instance.file.url
        return file_path

    def get_file_name(self, instance):
        file_name = instance.file.name
        file_name = file_name.split('/')[-1]
        return file_name

    class Meta:
        model = MessageMediaFile
        fields = [
            'id',
            "type",
            "relative_path",
            "file_name",
        ]


class InnerMessageSerializer(serializers.ModelSerializer):
    user = UserMessageSerializer()
    media_files = MediaFileSerializer(many=True)

    class Meta:
        model = Message
        fields = [
            'id',
            'user',
            'content',
            'media_files',
        ]


class MessageSerializer(serializers.ModelSerializer):
    room = serializers.PrimaryKeyRelatedField(queryset=Room.objects.all())
    user = UserMessageSerializer()
    media_files = MediaFileSerializer(many=True)
    reply = InnerMessageSerializer()

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['timestamp'] = instance.timestamp.strftime("%H:%M")
        return representation

    def get_is_media(self, instance):
        return instance.is_media

    def get_type(self, instance):
        return

    class Meta:
        model = Message
        fields = [
            'id',
            'room',
            'user',
            'content',
            'seen',
            'timestamp',
            'media_files',
            'edited',
            'reply',
        ]
