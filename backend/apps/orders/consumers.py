import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import Order

class OrderConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope['user']
        
        if self.user.is_authenticated:
            self.room_group_name = f'orders_{self.user.id}'
            
            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )
            
            await self.accept()
        else:
            await self.close()

    async def disconnect(self, close_code):
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )

    async def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data.get('type')

        if message_type == 'get_order_status':
            order_id = data.get('order_id')
            order = await self.get_order(order_id)
            if order:
                await self.send_order_status(order)
        elif message_type == 'get_all_orders':
            orders = await self.get_user_orders()
            await self.send(text_data=json.dumps({
                'type': 'all_orders',
                'orders': orders
            }))

    @database_sync_to_async
    def get_order(self, order_id):
        try:
            return Order.objects.get(id=order_id, user=self.user)
        except Order.DoesNotExist:
            return None

    @database_sync_to_async
    def get_user_orders(self):
        orders = Order.objects.filter(user=self.user).values(
            'id', 'order_number', 'status', 'total_amount', 'created_at'
        )
        return list(orders)

    async def send_order_status(self, order):
        await self.send(text_data=json.dumps({
            'type': 'order_status_update',
            'order_id': order.id,
            'status': order.status,
            'order_number': order.order_number,
            'total_amount': str(order.total_amount)
        }))

    async def order_status_update(self, event):
        await self.send(text_data=json.dumps({
            'type': 'order_status_update',
            'order_id': event['order_id'],
            'status': event['status'],
            'order_number': event['order_number'],
            'total_amount': event.get('total_amount', '0')
        }))