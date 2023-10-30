import os
from django.core.management.base import BaseCommand
from django.core.files import File
from django.conf import settings
from services.models import ZodiacSign

DEFAULT_IMAGE_PATH = os.path.join('media', 'defaults', 'zodiac')

SIGNS_LIST = [{
        'title': sign.split('.')[0],
        'icon': f'{os.path.join(DEFAULT_IMAGE_PATH, sign)}'
    }
    for sign in os.listdir(
        f"{os.path.join(settings.MEDIA_ROOT, 'defaults', 'zodiac')}"
    )
]


class Command(BaseCommand):
    help = 'Creates zodiac signs'

    def handle(self, *args, **options):
        if ZodiacSign.objects.count() > 0:
            return self.stdout.write(
                self.style.SUCCESS('Zodiac signs already exists')
            )
        for sign in SIGNS_LIST:
            with open(sign.get('icon'), "rb") as sign_icon:
                ZodiacSign.objects.create(
                    title=sign.get('title'),
                    icon=File(sign_icon)
                )
        return self.stdout.write(
            self.style.SUCCESS('Successfully created zodiac signs')
        )
