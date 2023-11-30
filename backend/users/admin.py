from django.contrib import admin
from django.contrib.auth.models import Group
from .models import User, UserMedia, UserStories


admin.site.unregister(Group)

admin.site.register(User)
admin.site.register(UserMedia)
admin.site.register(UserStories)
