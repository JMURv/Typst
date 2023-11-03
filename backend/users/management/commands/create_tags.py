from django.core.management.base import BaseCommand
from services.models import Tag

INTEREST_TAGS = [
    "art",
    "photo",
    "films",
    "videogames",
    "science",
    "programming",
    "modeling",
    "sport",
    "business",
    "traveling",
    "clubbing",
    "finance",
    "medicine",
    "IT",
    "beauty",
    "fashion",
    "music",
    "tech",
    "news",
    "politics",
    "reading",
    "design",
    "2D",
    "3D",
    "auto",
    "cuisine",
    "entertainment",
    "religion",
    "humor"
]


class Command(BaseCommand):
    help = 'Creates tags'

    def handle(self, *args, **options):
        if Tag.objects.count() > 0:
            return self.stdout.write(
                self.style.SUCCESS('Tags already exists')
            )
        for tag in INTEREST_TAGS:
            Tag.objects.create(title=tag)
        return self.stdout.write(
            self.style.SUCCESS('Successfully created tags')
        )
