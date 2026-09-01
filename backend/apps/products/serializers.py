from rest_framework import serializers
from .models import Category, Product, ProductVariant

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'image', 'created_at']

class ProductVariantSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductVariant
        fields = ['id', 'name', 'price_adjustment', 'stock_quantity', 'is_active']

class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.ReadOnlyField(source='category.name')
    variants = ProductVariantSerializer(many=True, read_only=True)
    final_price = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'description', 'price', 'final_price',
            'category', 'category_name', 'image', 'is_available',
            'stock_quantity', 'preparation_time', 'is_featured',
            'variants', 'created_at', 'updated_at'
        ]

    def get_final_price(self, obj):
        return float(obj.price)