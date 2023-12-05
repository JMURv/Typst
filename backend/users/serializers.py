from django.contrib.auth import get_user_model
from rest_framework import serializers

from mediafiles.serializers import MediaFileSerializer
from services.models import ZodiacSign
from .utils import (
    save_or_update_user_media,
    calculate_compatibility,
    save_or_update_user_tags,
    calculate_geo_proximity
)
from services.serializers import (
    ZodiacSignSerializer,
    TagSerializer
)


class UserSerializer(serializers.ModelSerializer):
    media = MediaFileSerializer(many=True, required=False)
    stories = MediaFileSerializer(many=True, required=False)
    zodiac_sign = ZodiacSignSerializer(required=False)
    tags = TagSerializer(many=True, required=False)
    compatibility_percentage = serializers.SerializerMethodField()
    geo_prox = serializers.SerializerMethodField()

    def create(self, validated_data):
        user_model = get_user_model()
        request = self.context.get('request')

        validated_data.pop('media', None)
        validated_data.pop('stories', None)
        validated_data.pop('liked', None)
        validated_data.pop('liked_by', None)
        validated_data.pop('disliked', None)
        validated_data.pop('disliked_by', None)
        validated_data.pop('blacklist', None)
        validated_data.pop('blacklisted_by', None)
        validated_data.pop('new_like_notification', None)
        validated_data.pop('new_match_notification', None)
        validated_data.pop('new_message_notification', None)

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

    def update(self, instance, validated_data):
        request = self.context.get('request')
        validated_data.pop('media', None)
        validated_data.pop('stories', None)
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
        if all([
            request.user.last_loc_latitude,
            request.user.last_loc_longitude,
            instance.last_loc_latitude,
            instance.last_loc_longitude
        ]):
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
            "height",
            "weight",
            "max_preferred_age",
            "min_preferred_age",
            "max_preferred_height",
            "min_preferred_height",
            "max_preferred_weight",
            "min_preferred_weight",
            "media",
            "stories",
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
            "compatibility_percentage",
            "zodiac_sign",
            "tags",
            "is_verified",
            "geo_prox",
            "is_verified",
        ]
        extra_kwargs = {
            'about': {"required": False},
            "email": {
                "write_only": True,
                "required": False
            },
            'password': {
                "write_only": True,
                "required": False
            },
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
            "tags",
            "is_verified"
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
