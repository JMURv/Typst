from django.db import models


class Room(models.Model):
    members = models.ManyToManyField(
        "users.User",
        related_name='chats',
    )


class Message(models.Model):
    room = models.ForeignKey(
        "Room",
        on_delete=models.CASCADE,
        related_name='messages',
        blank=True,
        null=True,
    )
    user = models.ForeignKey(
        "users.User",
        on_delete=models.CASCADE,
        related_name='user_messages'
    )
    content = models.TextField(
        blank=False
    )
    seen = models.BooleanField(
        default=False
    )
    timestamp = models.DateTimeField(
        auto_now_add=True
    )
    edited = models.BooleanField(
        default=False
    )
    reply = models.ForeignKey(
        "self",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='message_reply'
    )

    def is_media(self):
        return self.media_files.exists()

    def __str__(self):
        strftime = self.timestamp.strftime("%Y-%m-%d %H:%M:%S")
        return f'Message: {self.user.username} - {strftime}'


class MessageMediaFile(models.Model):
    message = models.ForeignKey(
        "Message",
        on_delete=models.CASCADE,
        related_name="media_files"
    )
    file = models.FileField(
        upload_to="messages/media"
    )
    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return self.file.name
