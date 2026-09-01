from django.contrib import admin
from django.utils.html import format_html
from .models import Category, Product, ProductVariant

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'is_active', 'created_at')
    list_filter = ('is_active',)
    search_fields = ('name', 'description')
    prepopulated_fields = {'slug': ('name',)}
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'slug', 'description')
        }),
        ('Display Settings', {
            'fields': ('is_active', 'image')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('product_image', 'name', 'price', 'category', 'is_available', 'stock_quantity', 'is_featured')
    list_filter = ('category', 'is_available', 'is_featured')
    search_fields = ('name', 'description', 'slug')
    prepopulated_fields = {'slug': ('name',)}
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'slug', 'description', 'category')
        }),
        ('Pricing & Stock', {
            'fields': ('price', 'is_available', 'stock_quantity')
        }),
        ('Additional Info', {
            'fields': ('preparation_time', 'is_featured', 'image')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def product_image(self, obj):
        if obj.image:
            return format_html('<img src="{}" width="50" height="50" style="object-fit:cover; border-radius:4px;" />', obj.image.url)
        return format_html('<span style="color:#999;">No image</span>')
    product_image.short_description = 'Image'

@admin.register(ProductVariant)
class ProductVariantAdmin(admin.ModelAdmin):
    list_display = ('product', 'name', 'price_adjustment', 'stock_quantity', 'is_active')
    list_filter = ('is_active', 'product__category')
    search_fields = ('product__name', 'name')
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('product', 'name')
        }),
        ('Pricing & Stock', {
            'fields': ('price_adjustment', 'stock_quantity', 'is_active')
        }),
    )