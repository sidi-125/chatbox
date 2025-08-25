# serializers.py
from rest_framework import serializers
from .models import Message, Block


class ChatMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        message = serializers.CharField(source='content')
        fields = ["sender", "receiver", "content", "timestamp", "sent_during_block"]


class BlockSerializer(serializers.ModelSerializer):
    class Meta:
        model = Block
        fields = ["id", "blocker", "blocked", "blocked_at"]
        read_only_fields = ["blocker", "blocked_at"]
