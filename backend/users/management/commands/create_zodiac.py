import json
import os
from django.core.management.base import BaseCommand
from django.core.files import File
from services.models import ZodiacSign


ZODIAC_FILE_EXT = ".svg"
DEFAULT_IMAGE_PATH = os.path.join('media', 'defaults', 'zodiac')


class Command(BaseCommand):
    help = 'Creates zodiac signs'

    def handle(self, *args, **options):
        if ZodiacSign.objects.count() > 0:
            return self.stdout.write(
                self.style.SUCCESS('Zodiac signs already exists')
            )
        with open("../shared_data/zodiacSigns.json") as zodiac_file:
            zodiac_signs = json.load(zodiac_file)
        for zodiac_sign in zodiac_signs.get("zodiac_signs"):
            title = zodiac_sign.get("title")
            icon_path = os.path.join(DEFAULT_IMAGE_PATH, title + ZODIAC_FILE_EXT)
            with open(icon_path, "rb") as icon_data:
                ZodiacSign.objects.create(
                    title=title,
                    icon=File(icon_data)
                )
        return self.stdout.write(
            self.style.SUCCESS('Successfully created zodiac signs')
        )
