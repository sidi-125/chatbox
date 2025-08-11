import json
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async
from .models import Message, MyUser

connected_users = {}

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.username = self.scope['url_route']['kwargs']['username']
        connected_users[self.username] = self
        await self.accept()

    async def disconnect(self, close_code):
        if self.username in connected_users:
            del connected_users[self.username]

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            print(f"Received text_data: {text_data}")

            receiver = data.get("receiver")
            message = data.get("message")

            if not receiver or not message:
                return

            await self.save_message(self.username, receiver, message)

            # Send message to receiver if connected
            if receiver in connected_users:
                await connected_users[receiver].send(text_data=json.dumps({
                    "sender": self.username,
                    "message": message,
                }))

        except Exception as e:
            print("Error in receive:", e)

    @staticmethod
    async def save_message(sender_username, receiver_username, message):
        try:
            sender, _ = await sync_to_async(MyUser.objects.get_or_create)(username=sender_username)
            receiver, _ = await sync_to_async(MyUser.objects.get_or_create)(username=receiver_username)
            await sync_to_async(Message.objects.create)(sender=sender, receiver=receiver, content=message)
        except Exception as e:
            print("Error saving message:", e)
