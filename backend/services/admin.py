from django.contrib import admin
from .models import ZodiacSign, Notification, Tag


admin.site.register(Notification)
admin.site.register(ZodiacSign)
admin.site.register(Tag)
