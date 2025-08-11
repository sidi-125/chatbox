from django.contrib import admin
from django.contrib.auth.models import User
from django.contrib.auth import get_user_model
from .models import Message

User = get_user_model()


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ("sender", "receiver", "content", "timestamp")
    search_fields = ("sender", "receiver", "content")
    list_filter = ("timestamp",)


class CustomUserAdmin(admin.ModelAdmin):
    list_display = ("id", "email", "is_active", "is_staff", "date_joined")
    search_fields = ("email",)
