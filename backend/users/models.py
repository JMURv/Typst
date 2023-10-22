from django.contrib.auth.models import AbstractUser
from django.db import models
from django.db.models.signals import m2m_changed
from django.dispatch import receiver

from services.models import Notification
from chat.models import Room

from .utils import send_ws_notification

BASE_CHOICES = (
    ("sm", "Small"),
    ("md", "Medium"),
    ("lg", "Large"),
    ("xl", "Extra large")
)

AGE_CHOICES = BASE_CHOICES

HEIGHT_CHOICES = BASE_CHOICES

WEIGHT_CHOICES = BASE_CHOICES

SEX_CHOICES = (
    ('m', 'Man'),
    ('w', 'Woman'),
)

ORIENTATION_CHOICES = (
    ('m', 'Man'),
    ('w', 'Woman'),
    ('b', 'Bisexual'),
)

RELATIONSHIPS_CHOICES = (
    ("l", "Long"),
    ("s", "Short"),
    ("d", "Default"),
)


class User(AbstractUser):
    email = models.EmailField('Email', max_length=255, unique=True)

    sex = models.CharField(max_length=1, choices=SEX_CHOICES, null=True)
    orientation = models.CharField(max_length=1, choices=ORIENTATION_CHOICES, null=True)
    relation_type = models.CharField(max_length=1, choices=RELATIONSHIPS_CHOICES, null=True)

    age = models.PositiveIntegerField("Age", null=True)
    height = models.PositiveIntegerField("Height", null=True)
    weight = models.PositiveIntegerField("Weight", null=True)

    preferred_age = models.CharField("Preferred Age", max_length=2, choices=AGE_CHOICES, null=True)
    preferred_height = models.CharField("Preferred Height", max_length=2, choices=HEIGHT_CHOICES, null=True)
    preferred_weight = models.CharField("Preferred Weight", max_length=2, choices=WEIGHT_CHOICES, null=True)

    about = models.TextField('About', max_length=700, null=True)
    country = models.CharField('Country', max_length=60, null=True)
    preferred_country = models.CharField('Country', max_length=60, null=True)
    city = models.CharField('City', max_length=60, null=True)

    liked = models.ManyToManyField(
        'self',
        related_name='liked_by',
        symmetrical=False,
        blank=True
    )
    disliked = models.ManyToManyField(
        'self',
        related_name='disliked_by',
        symmetrical=False,
        blank=True
    )

    blacklist = models.ManyToManyField(
        "self",
        related_name='blacklisted_by',
        symmetrical=False,
        blank=True,
        null=True
    )

    recommends = models.ManyToManyField(
        "self",
        related_name='recommended_by',
        symmetrical=False,
        blank=True,
        null=True
    )

    new_like_notification = models.BooleanField(default=True)
    new_match_notification = models.BooleanField(default=True)
    new_message_notification = models.BooleanField(default=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []


class UserMedia(models.Model):
    author = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='media',
    )
    file = models.FileField(
        upload_to="users/user_media",
        validators=[],
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.file.name


@receiver(m2m_changed, sender=User.liked.through)
def create_like_and_match_notification(sender, instance, action, **kwargs):
    """Create a Notification when user gets a new like or match"""
    if action == 'post_add':
        actor = instance
        follow_id = list(kwargs['pk_set'])[0]
        recipient = User.objects.get(id=follow_id)
        if actor in recipient.liked.all() and recipient in actor.liked.all():
            message = f'You have a new match!'
            if not Room.objects.filter(members=actor).filter(members=recipient).exists():
                chat_room_obj = Room.objects.create()
                chat_room_obj.members.add(actor, recipient)
            if actor.new_match_notification:
                notification = Notification.objects.create(
                    recipient=actor,
                    actor=recipient,
                    action="match",
                    message=message
                )
                send_ws_notification(
                    user_id=actor.id,
                    notification=notification
                )
            if recipient.new_match_notification:
                notification = Notification.objects.create(
                    recipient=recipient,
                    actor=actor,
                    action="match",
                    message=message
                )
                send_ws_notification(
                    user_id=recipient.id,
                    notification=notification
                )
            return
        if recipient.new_like_notification:
            message = f'You have a new like!'
            notification = Notification.objects.create(
                recipient=recipient,
                actor=actor,
                action="like",
                message=message
            )
            send_ws_notification(
                user_id=recipient.id,
                notification=notification
            )
