from django.core.management.base import BaseCommand
from subscriptions.models import Subscription


SUBSCRIPTIONS = [
    {
        "name": "Jupiter",
        "description": "Description",
        "price": 400,
        "likes_limit": 150,
    },
    {
        "name": "Mars",
        "description": "Description",
        "price": 300,
        "likes_limit": 100,
    },
    {
        "name": "Mercury",
        "description": "Description",
        "price": 200,
        "likes_limit": 50,
    },
]


class Command(BaseCommand):
    help = 'Creates subscriptions'

    def handle(self, *args, **options):
        if Subscription.objects.count() > 0:
            return self.stdout.write(
                self.style.SUCCESS('Subscriptions already exists')
            )
        for sub in SUBSCRIPTIONS:
            Subscription.objects.create(**sub)
        return self.stdout.write(
            self.style.SUCCESS('Successfully created subscriptions')
        )
