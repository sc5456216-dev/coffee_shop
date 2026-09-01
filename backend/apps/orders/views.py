from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import NotFound
from django.core.cache import cache
from .models import Order
from .serializers import OrderSerializer, OrderCreateSerializer
from .tasks import send_order_confirmation_email, update_order_status

class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_staff:
            return Order.objects.all()
        return Order.objects.filter(user=self.request.user)

    def get_serializer_class(self):
        if self.action == 'create':
            return OrderCreateSerializer
        return OrderSerializer

    # ✅ FIXED: Correctly looks up by ID or Order Number
    def get_object(self):
        queryset = self.get_queryset()
        pk = self.kwargs.get('pk')
        
        if pk:
            # Try to find by ID first
            order = queryset.filter(pk=pk).first()
            if not order:
                # If not found by ID, try by order_number
                order = queryset.filter(order_number=pk).first()
        else:
            order = None
        
        if not order:
            raise NotFound("Order not found.")
        
        # Check if user has permission to see this order
        if not self.request.user.is_staff and order.user != self.request.user:
            raise NotFound("Order not found.")
            
        return order

    def perform_create(self, serializer):
        # ✅ This is the ONLY place 'user' is passed
        order = serializer.save(user=self.request.user)
        
        # ✅ FIXED: Wrapped in try/except so it NEVER crashes the order
        try:
            send_order_confirmation_email.delay(order.id)
        except Exception as e:
            print(f"Email sending failed (ignored): {e}")
        
        return order

    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        order = self.get_object()
        new_status = request.data.get('status')
        
        if new_status not in dict(Order.STATUS_CHOICES):
            return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Update status using Celery
        try:
            update_order_status.delay(order.id, new_status)
        except Exception as e:
            print(f"Status update task failed (ignored): {e}")
        
        return Response({'status': 'updated', 'order_number': order.order_number})