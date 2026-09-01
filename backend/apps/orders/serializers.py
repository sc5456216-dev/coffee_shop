from rest_framework import serializers
from .models import Order, OrderItem
from apps.products.models import Product

class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.ReadOnlyField(source='product.name')
    product_price = serializers.ReadOnlyField(source='product.price')
    
    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name', 'product_price', 'quantity', 'price', 'special_instructions']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    user_email = serializers.ReadOnlyField(source='user.email')
    user_username = serializers.ReadOnlyField(source='user.username')
    
    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'user', 'user_email', 'user_username',
            'status', 'total_amount', 'notes', 'items', 'created_at', 'updated_at'
        ]
        read_only_fields = ['order_number', 'created_at', 'updated_at']

class OrderCreateSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, required=True)
    
    class Meta:
        model = Order
        fields = ['id', 'notes', 'items']  # ✅ FIXED: Added 'id' here
        read_only_fields = ['id']          # ✅ FIXED: Mark 'id' as read-only
    
    def validate(self, data):
        if not data.get('items'):
            raise serializers.ValidationError("Order must have at least one item")
        
        for item in data['items']:
            product = item.get('product')
            quantity = item.get('quantity', 1)
            
            if not product:
                raise serializers.ValidationError("Product is required for each item")
            
            if quantity <= 0:
                raise serializers.ValidationError("Quantity must be greater than 0")
            
            if product.stock_quantity < quantity:
                raise serializers.ValidationError(f"Insufficient stock for {product.name}")
        
        return data
    
    def create(self, validated_data):
        items_data = validated_data.pop('items')
        
        # ✅ FIXED: The 'user' comes from the ViewSet; no duplicate 'user' here
        order = Order.objects.create(total_amount=0, **validated_data)
        
        total = 0
        for item_data in items_data:
            product = item_data['product']
            quantity = item_data['quantity']
            price = product.price
            
            total += price * quantity
            
            # Update stock
            product.stock_quantity -= quantity
            product.save()
            
            # ✅ FIXED: Create the item WITHOUT the 'price' key from item_data.
            # We pop it out to prevent "multiple values for keyword argument 'price'"
            item_data.pop('price', None) 
            
            OrderItem.objects.create(order=order, price=price, **item_data)
        
        order.total_amount = total
        order.save()
        return order