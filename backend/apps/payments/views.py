from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Payment
from .serializers import PaymentSerializer, PaymentCreateSerializer
from apps.orders.models import Order

class PaymentViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.is_staff:
            return Payment.objects.all()
        return Payment.objects.filter(user=self.request.user)
    
    def get_serializer_class(self):
        if self.action == 'create':
            return PaymentCreateSerializer
        return PaymentSerializer
    
    def perform_create(self, serializer):
        order_id = self.request.data.get('order')
        try:
            order = Order.objects.get(id=order_id, user=self.request.user)
            if Payment.objects.filter(order=order).exists():
                raise serializers.ValidationError("Payment already exists for this order")
            
            serializer.save(user=self.request.user)
            
            # Update order status
            order.status = 'confirmed'
            order.save()
            
        except Order.DoesNotExist:
            raise serializers.ValidationError("Order not found")
    
    @action(detail=True, methods=['post'])
    def process_payment(self, request, pk=None):
        payment = self.get_object()
        
        # Simulate payment processing
        payment.status = 'completed'
        payment.save()
        
        # Update order status
        order = payment.order
        order.status = 'confirmed'
        order.save()
        
        return Response({'status': 'Payment processed successfully'})