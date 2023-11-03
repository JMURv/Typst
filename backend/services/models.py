from django.db import models


class Notification(models.Model):
    recipient = models.ForeignKey(
        "users.User",
        on_delete=models.CASCADE,
        related_name="notifications"
    )
    actor = models.ForeignKey(
        "users.User",
        on_delete=models.CASCADE,
        related_name="sent_notifications"
    )
    message = models.CharField(max_length=255)
    action = models.CharField(max_length=255)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)


class Tag(models.Model):
    title = models.CharField(max_length=100)


class ZodiacSign(models.Model):
    title = models.CharField(max_length=255)
    icon = models.FileField(
        upload_to="zodiac/",
        validators=[],
    )
