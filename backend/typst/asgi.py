from django.core.asgi import get_asgi_application
import os


os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'typst.settings')
django_asgi_app = get_asgi_application()

from chat import routing
from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": AllowedHostsOriginValidator(
        AuthMiddlewareStack(URLRouter(routing.websocket_urlpatterns))
    ),
})
