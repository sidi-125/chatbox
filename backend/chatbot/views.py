from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Q
from django.utils import timezone
from .models import Message, MyUser, Block
from django.contrib.auth import get_user_model
from rest_framework.views import APIView
from .encryption_utils import decrypt_message
User = get_user_model()

# chat history view
@api_view(["Post"])
def chat_history(request, username1, username2):
    try:
        user1 = MyUser.objects.get(username=username1)
        user2 = MyUser.objects.get(username=username2)
    except MyUser.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

    # Fetch all messages
    messages = Message.objects.filter(
        Q(sender=user1, receiver=user2) | Q(sender=user2, receiver=user1)
    ).order_by("timestamp")

    # Determine block relationship
    viewer_is_blocker = False
    if Block.objects.filter(blocker=user1, blocked=user2, is_active=True).exists():
        viewer_is_blocker = True
    elif Block.objects.filter(blocker=user2, blocked=user1, is_active=True).exists():
        viewer_is_blocker = True

    visible_msgs = []
    now = timezone.now()
    for msg in messages:
        if msg.sent_during_block:
            continue
        if msg.disappear_at and msg.disappear_at <= now and not msg.is_deleted:
            msg.is_deleted = True
            msg.save()
            print(msg.id)

        # return msg
        if not msg.is_deleted:
            visible_msgs.append(
                {
                    "id": msg.id,
                    "sender": msg.sender.username,
                    "receiver": msg.receiver.username,
                    # "message": msg.content,        
                    "message": decrypt_message(msg.encrypted_content),
                    "timestamp": msg.timestamp.isoformat(),  # <-- format timestamp as ISO string
                    "send_during_block": msg.sent_during_block,
                    "disappear_option": msg.disappear_option,
                    "time_remaining": msg.time_remaining(),
                    "is_deleted": msg.is_deleted,
                    "disappear_at": msg.disappear_at,
                    
                }
            )

    return Response(visible_msgs, status=status.HTTP_200_OK)

# @api_view(["POST"])
# def toggle_disappearing(request, username):
#     try:
#         user = MyUser.objects.get(username=username)
#     except MyUser.DoesNotExist:
#         return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

#     enabled = request.data.get("enabled", None)
#     if enabled is None:
#         return Response({"error": "enabled field is required"}, status=status.HTTP_400_BAD_REQUEST)

#     user.disappearing_enabled = bool(enabled)
#     user.save()

#     return Response({
#         "username": user.username,
#         "disappearing_enabled": user.disappearing_enabled,
#     })
@api_view(["POST"])
def toggle_disappearing(request, username):
    """
    Endpoint to turn disappearing messages ON or OFF using username.
    Example payload:
    { "action": "on" } or { "action": "off" }
    """
    try:
        user = MyUser.objects.get(username=username)
    except MyUser.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

    action = request.data.get("action", "").lower()

    if action == "on":
        user.disappearing_enabled = True
    elif action == "off":
        user.disappearing_enabled = False
    else:
        return Response({"error": "Invalid action, use 'on' or 'off'"}, status=400)

    user.save()
    return Response({
        "username": user.username,
        "disappearing_enabled": user.disappearing_enabled
    })
@api_view(["DELETE"])
def delete_chat(request, username1, username2):
    messages = Message.objects.filter(
        sender__username__in=[username1, username2],
        receiver__username__in=[username1, username2],
    )
    deleted_count = messages.count()
    messages.delete()
    return Response(
        {"message": f"{deleted_count} messages deleted successfully."},
        status=status.HTTP_200_OK,
    )


# block user view
class BlockUserView(APIView):
    def post(self, request):
        blocker_username = request.data.get("blocker")
        blocked_username = request.data.get("blocked")
        try:
            blocker = MyUser.objects.get(username=blocker_username)
            blocked = MyUser.objects.get(username=blocked_username)
        except MyUser.DoesNotExist:
            return Response({"error": "User not found"}, status=404)

        if blocker == blocked:
            return Response({"error": "Cannot block yourself"}, status=400)

        block, created = Block.objects.get_or_create(blocker=blocker, blocked=blocked)
        if not created and not block.is_active:
            block.is_active = True
            block.blocked_at = timezone.now()
            block.save()
        return Response(
            {"message": f"{blocked_username} blocked by {blocker_username}"}, status=201
        )


# unblock user view
class UnblockUserView(APIView):
    def post(self, request):
        blocker_username = request.data.get("blocker")
        blocked_username = request.data.get("blocked")
        try:
            blocker = MyUser.objects.get(username=blocker_username)
            blocked = MyUser.objects.get(username=blocked_username)
        except MyUser.DoesNotExist:
            return Response({"error": "User not found"}, status=404)

        try:
            block = Block.objects.get(blocker=blocker, blocked=blocked)
            if block.is_active:
                block.is_active = False
                block.save()
                return Response(
                    {"message": f"{blocked_username} unblocked by {blocker_username}"},
                    status=200,
                )
            else:
                return Response({"message": "User was already unblocked"}, status=200)
        except Block.DoesNotExist:
            return Response({"error": "Block record not found"}, status=404)
