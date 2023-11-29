from django.contrib.auth import get_user_model
from django.urls import reverse_lazy
from rest_framework import serializers

from mediafiles.serializers import MediaFileSerializer
from users.serializers import UserSerializer
from .models import Room, Message


class RoomSerializer(serializers.ModelSerializer):
    members = UserSerializer(many=True)

    def get_messages(self, instance):
        messages = Message.objects.filter(
            room=instance
        ).order_by('-timestamp')[:50:-1]
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
