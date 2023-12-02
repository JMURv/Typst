from django.db import models


class Subscription(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(max_length=1000)
    price = models.PositiveIntegerField()
    likes_limit = models.PositiveIntegerField()


class UserSubscription(models.Model):
    user = models.ForeignKey(
        to="users.User",
        related_name="subscriptions",
        on_delete=models.CASCADE
    )
    subscription = models.ForeignKey(
        to=Subscription,
        on_delete=models.CASCADE
    )
    expiration_date = models.DateField()


class UserDailyLikes(models.Model):
    user_subscription = models.ForeignKey(
        to=UserSubscription,
        on_delete=models.CASCADE
    )
    date = models.DateField(auto_now_add=True)
    likes_used = models.PositiveIntegerField(default=0)
