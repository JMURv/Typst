from django.contrib import admin
from django.urls import path, include

from django.conf import settings
from django.conf.urls.static import static
from users.views import approve_verification, decline_verification

urlpatterns = [
    path('admin/', admin.site.urls),
    path('staff/verification/accept/', approve_verification),
    path('staff/verification/decline/', decline_verification),
    path('api/', include('api.urls'))
]
if settings.DEBUG:
    urlpatterns += static(
        settings.MEDIA_URL,
        document_root=settings.MEDIA_ROOT
    )
