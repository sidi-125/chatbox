# urls.py
from django.urls import path
from .views import delete_chat, BlockUserView, UnblockUserView
from . import views

urlpatterns = [
    path("chat/delete/<str:username1>/<str:username2>/", delete_chat),
    path("block-user/", BlockUserView.as_view(), name="block-user"),
    path("unblock-user/", UnblockUserView.as_view(), name="unblock-user"),
    path("history/<str:username1>/<str:username2>/",views.chat_history,name="chat_history"),
]
