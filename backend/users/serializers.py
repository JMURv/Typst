import os
import base64

from django.contrib.auth import get_user_model
from django.core.files.base import ContentFile
from rest_framework import serializers
from users.models import UserMedia


class UserRecommendSystemSerializer(serializers.ModelSerializer):

    class Meta:
        model = get_user_model()
        fields = [
            "id",
            "username",
            "about",
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
        elif file_ext in ('mp4'):
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


class MediaFileBytesSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserMedia
        fields = [
            'file',
        ]

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['file'] = self.get_media_file_bytes(instance.file)
        return data

    def get_media_file_bytes(self, media_file):
        with open(media_file.path, 'rb') as file:
            bytes_data = file.read()
            return base64.b64encode(bytes_data).decode('utf-8')


class UserSerializer(serializers.ModelSerializer):
    media = MediaFileSerializer(many=True, required=False)

    def create(self, validated_data):
        user_model = get_user_model()
        request = self.context.get('request')

        validated_data.pop('media', None)
        validated_data.pop('liked', None)
        validated_data.pop('liked_by', None)
        validated_data.pop('disliked', None)
        validated_data.pop('disliked_by', None)

        instance = user_model.objects.create_user(**validated_data)
        instance.new_like_notification = True
        instance.new_match_notification = True
        instance.new_message_notification = True

        files = [
            request.FILES.get(f'media-{i}')
            for i in range(0, len(request.FILES))
            if request.FILES.get(f'media-{i}') is not None
        ]

        if files:
            for media in files:
                data = media.read()
                new_file = UserMedia(author=instance)
                new_file.file.save(media.name, ContentFile(data))
                new_file.save()
        return instance

    class Meta:
        model = get_user_model()
        fields = [
            "id",
            "username",
            "password",
            "email",
            "about",
            "age",
            "sex",
            "orientation",
            "relation_type",
            "height",
            "weight",
            "preferred_age",
            "preferred_height",
            "preferred_weight",
            "media",
            "liked",
            "liked_by",
            "disliked",
            "disliked_by",
            "country",
            "preferred_country",
            "city",
            "new_like_notification",
            "new_match_notification",
            "new_message_notification",
        ]
        extra_kwargs = {
            'about': {'required': False},
        }


class BlackListedUserSerializer(serializers.ModelSerializer):
    media = MediaFileSerializer(many=True, required=False)

    class Meta:
        model = get_user_model()
        fields = [
            "id",
            "username",
            "media",
        ]


class LightUserSerializer(serializers.ModelSerializer):
    media = MediaFileSerializer(many=True, required=False)

    def update(self, instance, validated_data):
        request = self.context.get('request')
        validated_data.pop('media', None)
        validated_data.pop('liked', None)
        validated_data.pop('liked_by', None)
        validated_data.pop('disliked', None)
        validated_data.pop('disliked_by', None)
        validated_data.pop('blacklist', None)
        validated_data.pop('blacklisted_by', None)
        validated_data.pop('new_like_notification', None)
        validated_data.pop('new_match_notification', None)
        validated_data.pop('new_message_notification', None)
        super().update(instance, validated_data)

        files = [
            request.FILES.get(f'media-{i}')
            for i in range(0, len(request.FILES))
            if request.FILES.get(f'media-{i}') is not None
        ]
        if files:
            for media in files:
                data = media.read()
                new_file = UserMedia(author=instance)
                new_file.file.save(media.name, ContentFile(data))
                new_file.save()
        instance.save()
        return instance

    class Meta:
        model = get_user_model()
        fields = [
            "id",
            "username",
            "about",
            "age",
            "sex",
            "orientation",
            "relation_type",
            "height",
            "weight",
            "preferred_age",
            "preferred_height",
            "preferred_weight",
            "media",
            "liked",
            "liked_by",
            "disliked",
            "disliked_by",
            "blacklist",
            "blacklisted_by",
            "country",
            "preferred_country",
            "city",
            "new_like_notification",
            "new_match_notification",
            "new_message_notification",
        ]
        extra_kwargs = {
            'about': {'required': False},
        }


class SettingsSerializer(serializers.ModelSerializer):
    blacklist = BlackListedUserSerializer(many=True, required=False)

    class Meta:
        model = get_user_model()
        fields = [
            "id",
            "country",
            "preferred_country",
            "city",
            "new_like_notification",
            "new_match_notification",
            "new_message_notification",
            "blacklist"
        ]


class PasswordResetSerializer(serializers.ModelSerializer):
    class Meta:
        model = get_user_model()
        fields = [
            "email",
        ]
