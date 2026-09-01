from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from datetime import timedelta
from .models import Order
import logging

logger = logging.getLogger(__name__)

@shared_task
def send_order_confirmation_email(order_id):
    try:
        order = Order.objects.get(id=order_id)
        subject = f'Order Confirmation - {order.order_number}'
        message = f'''
        Thank you for your order at Coffee Shop!
        
        Order Number: {order.order_number}
        Total Amount: ${order.total_amount}
        Status: {order.get_status_display()}
        
        We'll notify you when your order is ready.
        '''
        
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [order.user.email],
            fail_silently=False,
        )
        return f"Email sent for order {order.order_number}"
    except Order.DoesNotExist:
        logger.error(f"Order {order_id} not found")
        return None

@shared_task
def update_order_status(order_id, new_status):
    try:
        order = Order.objects.get(id=order_id)
        old_status = order.status
        order.status = new_status
        order.save()
        
        # Send notification via WebSocket
        from channels.layers import get_channel_layer
        from asgiref.sync import async_to_sync
        
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f"orders_{order.user.id}",
            {
                'type': 'order_status_update',
                'order_id': order.id,
                'status': order.status,
                'order_number': order.order_number,
                'total_amount': str(order.total_amount)
            }
        )
        
        logger.info(f"Order {order.order_number} status updated from {old_status} to {new_status}")
        return f"Order {order.order_number} status updated to {new_status}"
    except Order.DoesNotExist:
        logger.error(f"Order {order_id} not found")
        return None

@shared_task
def cleanup_pending_orders():
    """Cancel pending orders older than 30 minutes"""
    cutoff_time = timezone.now() - timedelta(minutes=30)
    pending_orders = Order.objects.filter(
        status='pending',
        created_at__lt=cutoff_time
    )
    
    count = pending_orders.count()
    for order in pending_orders:
        order.status = 'cancelled'
        order.save()
        logger.info(f"Auto-cancelled order {order.order_number} due to timeout")
    
    return f"Cancelled {count} pending orders"

@shared_task
def send_order_reminder():
    """Send reminder for pending orders"""
    pending_orders = Order.objects.filter(status='pending')
    for order in pending_orders:
        send_mail(
            'Order Reminder',
            f'Your order {order.order_number} is still pending.',
            settings.DEFAULT_FROM_EMAIL,
            [order.user.email],
            fail_silently=True,
        )
    return f"Sent reminders to {pending_orders.count()} orders"