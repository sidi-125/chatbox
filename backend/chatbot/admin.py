from django.contrib import admin
from .models import MyUser, Message, Block

# MyUser (Custom User Model)


@admin.register(MyUser)
class MyUserAdmin(admin.ModelAdmin):
    list_display = ("id", "username", "is_active", "is_staff", "date_joined")
    search_fields = ("username",)
    list_filter = ("is_active", "is_staff", "date_joined")
    ordering = ("-date_joined",)


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = (
        "sender",
        "receiver",
        "content",
        "timestamp",
        "disappear_option",
        "disappear_at",
        "is_deleted",
    )
    search_fields = ("sender__username", "receiver__username", "content")
    list_filter = ("timestamp",)
    ordering = ("-timestamp",)


@admin.register(Block)
class BlockAdmin(admin.ModelAdmin):
    list_display = ("blocker", "blocked", "blocked_at", "is_active")
    search_fields = ("blocker__username", "blocked__username")
    list_filter = ("blocked_at",)
    ordering = ("-blocked_at",)
