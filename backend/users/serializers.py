import os
import base64
from django.contrib.auth import get_user_model
from rest_framework import serializers

from services.models import ZodiacSign
from .models import UserMedia
from .utils import save_or_update_user_media, calculate_compatibility, \
    save_or_update_user_tags, calculate_geo_proximity
from services.serializers import (
    ZodiacSignSerializer,
    TagSerializer
)


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
    zodiac_sign = ZodiacSignSerializer(required=False)
    tags = TagSerializer(many=True, required=False)
    compatibility_percentage = serializers.SerializerMethodField()
    geo_prox = serializers.SerializerMethodField()

    def create(self, validated_data):
        user_model = get_user_model()
        request = self.context.get('request')

        validated_data.pop('media', None)
        validated_data.pop('liked', None)
        validated_data.pop('liked_by', None)
        validated_data.pop('disliked', None)
        validated_data.pop('disliked_by', None)

        instance = user_model.objects.create_user(**validated_data)
        instance.is_verified = False
        instance.new_like_notification = True
        instance.new_match_notification = True
        instance.new_message_notification = True

        zodiac_sign = request.data.get('zodiac_sign', None)
        if zodiac_sign:
            try:
                instance.zodiac_sign = ZodiacSign.objects.get(
                    title=zodiac_sign
                )
            except ZodiacSign.DoesNotExist:
                instance.zodiac_sign = ZodiacSign.objects.first()

        save_or_update_user_tags(
            request=request,
            instance=instance
        )
        save_or_update_user_media(
            request=request,
            instance=instance
        )
        instance.save()
        return instance

    def get_geo_prox(self, instance):
        request = self.context.get('request')
        if not request:
            return None
        if request.user.id == instance.id:
            return None
        return calculate_geo_proximity(
            request_user=request.user,
            inspected_user=instance
        )

    def get_compatibility_percentage(self, instance) -> int:
        request = self.context.get('request')
        if not request:
            return 0
        if request.user.id == instance.id:
            return 0
        return calculate_compatibility(
            request_user=request.user,
            inspected_user=instance
        )

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
            "compatibility_percentage",
            "zodiac_sign",
            "tags",
            "is_verified",
            "geo_prox",
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
    zodiac_sign = ZodiacSignSerializer(required=False)
    tags = TagSerializer(many=True, required=False)
    compatibility_percentage = serializers.SerializerMethodField()
    geo_prox = serializers.SerializerMethodField()

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

        zodiac_sign = request.data.get('zodiac_sign', None)
        if zodiac_sign:
            try:
                instance.zodiac_sign = ZodiacSign.objects.get(
                    title=zodiac_sign
                )
            except ZodiacSign.DoesNotExist:
                instance.zodiac_sign = ZodiacSign.objects.first()

        save_or_update_user_tags(
            request=request,
            instance=instance
        )
        save_or_update_user_media(
            request=request,
            instance=instance
        )
        instance.save()
        return instance

    def get_geo_prox(self, instance):
        request = self.context.get('request')
        if not request:
            return None
        if request.user.id == instance.id:
            return None
        return calculate_geo_proximity(
            request_user=request.user,
            inspected_user=instance
        )

    def get_compatibility_percentage(self, instance) -> int:
        request = self.context.get('request')
        if not request:
            return 0
        if request.user.id == instance.id:
            return 0
        return calculate_compatibility(
            request_user=request.user,
            inspected_user=instance
        )

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
            "zodiac_sign",
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
            "tags",
            "compatibility_percentage",
            "geo_prox",
        ]
        extra_kwargs = {
            'about': {'required': False},
        }


class SettingsSerializer(serializers.ModelSerializer):
    tags = TagSerializer(many=True, required=False)
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
            "blacklist",
            "tags"
        ]


class PasswordResetSerializer(serializers.ModelSerializer):
    class Meta:
        model = get_user_model()
        fields = [
            "email",
        ]


class UserRecommendSystemSerializer(serializers.ModelSerializer):
    class Meta:
        model = get_user_model()
        fields = [
            "id",
            "username",
            "about",
        ]
