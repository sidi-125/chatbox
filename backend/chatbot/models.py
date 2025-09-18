from django.contrib.auth.models import (
    AbstractBaseUser,
    BaseUserManager,
    PermissionsMixin,
)
from django.conf import settings
from django.db import models
from django.utils import timezone

User = settings.AUTH_USER_MODEL


class MyUserManager(BaseUserManager):
    def create_user(self, username, password=None):
        if not username:
            raise ValueError("Username is required")

        user = self.model(username=username)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, password=None):
        user = self.create_user(username, password)
        user.is_staff = True
        user.is_superuser = True
        user.save(using=self._db)
        return user


class MyUser(AbstractBaseUser, PermissionsMixin):
    username = models.CharField(max_length=100, unique=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)
    last_seen = models.DateTimeField(default=timezone.now)
    disappearing_enabled = models.BooleanField(default=False)
    objects = MyUserManager()

    USERNAME_FIELD = "username"
    REQUIRED_FIELDS = []

    def __str__(self):
        return self.username


class Message(models.Model):
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="sent_messages"
    )
    receiver = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="received_messages",
    )
    encrypted_content = models.TextField(default="")
    content = models.TextField(blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    sent_during_block = models.BooleanField(default=False)
    disappear_option = models.CharField(
        max_length=10,
        choices=[
            ("off", "Off"),
            ("24h", "24 Hours"),
            ("7d", "7 Days"),
            ("1minute", "1 Minute"),
        ],
        default="off",
    )
    disappear_at = models.DateTimeField(blank=True, null=True)
    is_deleted = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        now = timezone.now()
        if self.disappear_option == "24h":
            self.disappear_at = timezone.now() + timezone.timedelta(hours=24)
        elif self.disappear_option == "7d":
            self.disappear_at = timezone.now() + timezone.timedelta(days=7)
        elif self.disappear_option == "1minute":
            self.disappear_at = timezone.now() + timezone.timedelta(minutes=1)
        else:
            self.disappear_at = None
        super().save(*args, **kwargs)

    def has_disappeared(self):
        return self.disappear_at and timezone.now() > self.disappear_at

    def time_remaining(self):
        if not self.disappear_at:
            return None
        remaining = self.disappear_at - timezone.now()
        return max(0, int(remaining.total_seconds()))

    def __str__(self):
        return f"{self.sender} to {self.receiver}"

    def __str__(self):
        return f"{self.sender} to {self.receiver}"

    def __str__(self):
        return f"{self.sender} to {self.receiver}"


class Block(models.Model):
    blocker = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="blocking"
    )
    blocked = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="blocked_by"
    )
    blocked_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ("blocker", "blocked")

    def __str__(self):
        return f"{self.blocker} blocked {self.blocked}"
