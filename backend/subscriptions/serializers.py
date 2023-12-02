from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import Subscription, UserSubscription, UserDailyLikes


class SubscriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subscription
        fields = [
            "id",
            "name",
            "description",
            "price",
            "likes_limit",
        ]


class UserSubscriptionSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(
        queryset=get_user_model().objects.all()
    )
    subscription = serializers.PrimaryKeyRelatedField(
        queryset=Subscription.objects.all()
    )

    class Meta:
        model = UserSubscription
        fields = [
            "user",
            "subscription",
            "expiration_date",
        ]


class UserDailyLikesSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserDailyLikes
        fields = [
            "user_subscription",
            "date",
            "likes_used",
        ]
