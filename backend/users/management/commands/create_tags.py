import json
from django.core.management.base import BaseCommand
from services.models import Tag


class Command(BaseCommand):
    help = 'Creates tags'

    def handle(self, *args, **options):
        if Tag.objects.count() > 0:
            return self.stdout.write(
                self.style.SUCCESS('Tags already exists')
            )
        with open("../shared_data/tags.json") as tags_file:
            interest_tags = json.load(tags_file)
            for tag in interest_tags.get("tags"):
                Tag.objects.create(title=tag.get("value"))
        return self.stdout.write(
            self.style.SUCCESS('Successfully created tags')
        )
