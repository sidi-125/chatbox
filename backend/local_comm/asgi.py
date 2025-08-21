"""
ASGI config for localnet_comm project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.2/howto/deployment/asgi/
"""

# Try this comment your code and replace this in file
import os
import django
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "local_comm.settings")
django.setup()


# Lazy import AFTER Django setup
def get_websocket_application():
    import chatbot.routing  # Import inside the function to avoid premature Django usage

    return URLRouter(chatbot.routing.websocket_urlpatterns)


application = ProtocolTypeRouter(
    {
        "http": get_asgi_application(),
        "websocket": AuthMiddlewareStack(get_websocket_application()),
    }
)
