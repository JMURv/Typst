import os
from django.contrib.auth import get_user_model
from rest_framework import serializers
from users.models import UserMedia
from .models import Notification, ZodiacSign, Tag


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
        model = UserMedia
        fields = [
            'id',
            "type",
            "relative_path",
            "file_name",
            "created_at",
        ]


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


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = [
            "title",
        ]


class ZodiacSignSerializer(serializers.ModelSerializer):
    class Meta:
        model = ZodiacSign
        fields = [
            "title",
            "icon",
        ]
