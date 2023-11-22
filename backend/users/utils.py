from django.core.files.base import ContentFile
from django.db.models import (
    Case,
    When,
    Value,
    PositiveIntegerField,
    QuerySet
)
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from rest_framework.request import Request

from services.models import Tag
from users.models import UserMedia, User
from geopy.distance import geodesic

AGE_MAPPING = {
    "sm": [18, 25],
    "md": [25, 35],
    "lg": [35, 45],
    "xl": [45, 100],
}

HEIGHT_MAPPING = {
    "sm": [0, 160],
    "md": [160, 175],
    "lg": [175, 185],
    "xl": [185, 200],
}

WEIGHT_MAPPING = {
    "sm": [0, 50],
    "md": [50, 65],
    "lg": [65, 75],
    "xl": [75, 100],
}


def calculate_geo_proximity(request_user: User, inspected_user: User) -> float:
    request_user_geo = request_user.latest_location
    inspected_user_geo = inspected_user.latest_location
    if request_user_geo and inspected_user_geo:
        request_user_geo = (
            request_user_geo.get("latitude"),
            request_user_geo.get("longitude")
        )
        inspected_user_geo = (
            inspected_user_geo.get("latitude"),
            inspected_user_geo.get("longitude")
        )
        distance = geodesic(request_user_geo, inspected_user_geo).km
        return int(distance)
    return None


def calculate_compatibility(request_user: User, inspected_user: User) -> int:

    def calculate_score(value, preference_range):
        min_value, max_value = preference_range
        if min_value <= value <= max_value:
            return 100
        else:
            distance = min(abs(value - min_value), abs(value - max_value))
            max_distance = max_value - min_value
            score = max(0, 100 - (100 * distance / max_distance))
            return score

    pref_age_range = [
        request_user.min_preferred_age,
        request_user.max_preferred_age
    ]
    pref_height_range = [
        request_user.min_preferred_height,
        request_user.max_preferred_height
    ]
    pref_weight_range = [
        request_user.min_preferred_weight,
        request_user.max_preferred_weight
    ]

    if not all([pref_age_range, pref_height_range, pref_weight_range]):
        return 0

    age_score = calculate_score(inspected_user.age, pref_age_range)
    height_score = calculate_score(inspected_user.height, pref_height_range)
    weight_score = calculate_score(inspected_user.weight, pref_weight_range)

    total_score = (age_score + height_score + weight_score) / 3

    return int(total_score)


def calculate_preferences_and_order(user: User, qs: QuerySet) -> QuerySet:
    available_prefs = {'age': False, 'height': False, 'weight': False}
    pref_age_range = [user.min_preferred_age, user.max_preferred_age]
    pref_height_range = [user.min_preferred_height, user.max_preferred_height]
    pref_weight_range = [user.min_preferred_weight, user.max_preferred_weight]

    if pref_age_range:
        available_prefs['age'] = True
        qs = qs.annotate(
            age_rank=Case(
                When(
                    age__in=[
                        value for value in range(
                            pref_age_range[0], pref_age_range[-1]
                        )
                    ], then=Value(1)
                ),
                default=Value(2),
                output_field=PositiveIntegerField(),
            )
        ).order_by('age_rank')
    if pref_height_range:
        available_prefs['height'] = True
        qs = qs.annotate(
            height_rank=Case(
                When(
                    height__in=[
                        value for value in range(
                            pref_height_range[0], pref_height_range[-1]
                        )
                    ], then=Value(1)
                ),
                default=Value(2),
                output_field=PositiveIntegerField(),
            ),
        ).order_by('height_rank')
    if pref_weight_range:
        qs = qs.annotate(
            weight_rank=Case(
                When(
                    weight__in=[
                        value for value in range(
                            pref_weight_range[0], pref_weight_range[-1]
                        )
                    ], then=Value(1)
                ),
                default=Value(2),
                output_field=PositiveIntegerField(),
            ),
        ).order_by('weight_rank')

    if user.recommends.count() > 0:
        recommended_ids = list(
            user.recommends.all().values_list('id', flat=True)
        )
        qs = qs.annotate(
            recommended_weight=Case(
                When(
                    id__in=recommended_ids,
                    then=Value(1)
                ),
                default=Value(2)
            )
        ).order_by('recommended_weight')
    return qs


def exclude_curr_user_and_disliked(user, qs: QuerySet) -> QuerySet:
    blacklisted_users = list(user.blacklist.all().values_list('id', flat=True))
    liked_users = list(user.liked.all().values_list('id', flat=True))
    disliked_users = list(user.disliked.all().values_list('id', flat=True))
    disliked_users.extend(liked_users)
    disliked_users.extend(blacklisted_users)
    disliked_users.extend([user.id])

    qs = qs.exclude(
        id__in=disliked_users
    )
    return qs


def send_ws_notification(user_id, notification):
    """Trigger a notification in Django when a user receives a new like,
    message or match """
    from services.serializers import NotificationSerializer
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        f"user_{user_id}",
        {
            "type": "send_notification",
            "notification": NotificationSerializer(notification).data,
        },
    )


def save_or_update_user_media(request: Request, instance: User) -> None:
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


def save_or_update_user_tags(request: Request, instance: User) -> None:
    tags = [
        request.data.get(f'tag-{i}')
        for i in range(0, len(request.data))
        if request.data.get(f'tag-{i}') is not None
    ]
    if tags:
        instance.tags.clear()
        for tag in tags:
            instance.tags.add(
                Tag.objects.get(
                    title=tag
                )
            )
