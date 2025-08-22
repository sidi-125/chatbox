import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import Message, MyUser, Block

connected_users = {}


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.username = self.scope["url_route"]["kwargs"]["username"]
        connected_users[self.username] = self
        await self.accept()

    async def disconnect(self, close_code):
        connected_users.pop(self.username, None)

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            receiver_username = data.get("receiver")
            message = (data.get("message") or "").strip()

            if not message:
                return

            # Save message and determine visibility
            msg_obj, sender_can_see, receiver_can_see = await ChatConsumer.save_message(
                self.username, receiver_username, message
            )
            # --- Send message ONLY to receiver (if connected & allowed) ---
            if receiver_can_see and receiver_username in connected_users:
                receiver_response = {
                    "sender": self.username,
                    "message": message,
                    "sent_during_block": (
                        msg_obj.sent_during_block if msg_obj else False
                    ),
                }
                await connected_users[receiver_username].send(
                    json.dumps(receiver_response)
                )

        except Exception as e:
            print("Error in receive:", e)

    @staticmethod
    @database_sync_to_async
    def is_blocked(blocker_user, blocked_user):
        return Block.objects.filter(
            blocker_id=blocker_user.id, blocked_id=blocked_user.id, is_active=True
        ).exists()

    @staticmethod
    async def save_message(sender_username, receiver_username, message):
        try:
            sender, _ = await database_sync_to_async(MyUser.objects.get_or_create)(
                username=sender_username
            )
            receiver, _ = await database_sync_to_async(MyUser.objects.get_or_create)(
                username=receiver_username
            )

            # Check block status
            sender_blocked_receiver = await ChatConsumer.is_blocked(sender, receiver)
            receiver_blocked_sender = await ChatConsumer.is_blocked(receiver, sender)
            
            # Visibility rules
            sender_can_see = True
            receiver_can_see = not receiver_blocked_sender
            sent_during_block = sender_blocked_receiver or receiver_blocked_sender

            # Save message
            msg_obj = Message(
                sender=sender,
                receiver=receiver,
                content=message or "",
                sent_during_block=sent_during_block,
            )
            await database_sync_to_async(msg_obj.save)()

            return msg_obj, sender_can_see, receiver_can_see

        except Exception as e:
            print(f"Unexpected error in save_message: {e}")
            return None, True, False
