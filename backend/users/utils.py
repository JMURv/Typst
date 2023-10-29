from django.db.models import (
    F,
    Case,
    When,
    Value,
    PositiveIntegerField,
    QuerySet
)
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync


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


def calculate_preferences_and_order(user, qs: QuerySet) -> QuerySet:
    available_prefs = {'age': False, 'height': False, 'weight': False}
    pref_age_range = AGE_MAPPING.get(user.preferred_age, None)
    pref_height_range = HEIGHT_MAPPING.get(user.preferred_height, None)
    pref_weight_range = WEIGHT_MAPPING.get(user.preferred_weight, None)

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
    """Trigger a notification in Django when a user receives a new like"""
    from services.serializers import NotificationSerializer
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        f"user_{user_id}",
        {
            "type": "send_notification",
            "notification": NotificationSerializer(notification).data,
        },
    )
