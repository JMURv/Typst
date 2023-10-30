from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import Notification, ZodiacSign
from users.serializers import MediaFileSerializer


class NotificationUserSerializer(serializers.ModelSerializer):
    media = MediaFileSerializer(many=True, required=False)

    class Meta:
        model = get_user_model()
        fields = [
            "id",
            "username",
            "media",
        ]


class NotificationSerializer(serializers.ModelSerializer):
    recipient = NotificationUserSerializer(read_only=True)
    actor = NotificationUserSerializer(read_only=True)

    class Meta:
        model = Notification
        fields = [
            "id",
            "recipient",
            "actor",
            "message",
            "action",
            "is_read",
            "created_at",
        ]


class ZodiacSignSerializer(serializers.ModelSerializer):
    class Meta:
        model = ZodiacSign
        fields = [
            "title",
            "icon",
        ]
