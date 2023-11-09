from django.core.management.base import BaseCommand
from django.contrib.sites.models import Site
from django.conf import settings


class Command(BaseCommand):
    help = 'Configure site domain'

    def handle(self, *args, **options):
        site_obj = Site.objects.get(id=1)
        if site_obj.name == settings.SITE_DOMAIN:
            return self.stdout.write(
                self.style.SUCCESS('Site domain already configured')
            )
        site_obj.name = settings.SITE_DOMAIN
        site_obj.domain = settings.SITE_DOMAIN
        site_obj.save()
        return self.stdout.write(
            self.style.SUCCESS('Successfully configure site domain')
        )
