from rest_framework import serializers
from .models import Payment

class PaymentSerializer(serializers.ModelSerializer):
    order_number = serializers.ReadOnlyField(source='order.order_number')
    
    class Meta:
        model = Payment
        fields = [
            'id', 'order', 'order_number', 'user', 'amount', 
            'payment_method', 'transaction_id', 'status', 
            'created_at', 'updated_at'
        ]
        read_only_fields = ['transaction_id', 'created_at', 'updated_at']

class PaymentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ['order', 'payment_method', 'amount']
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        validated_data['transaction_id'] = f"TXN-{uuid.uuid4().hex[:12].upper()}"
        return super().create(validated_data)