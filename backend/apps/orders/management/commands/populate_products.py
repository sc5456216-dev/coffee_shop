from django.core.management.base import BaseCommand
from apps.products.models import Category, Product

class Command(BaseCommand):
    help = 'Populate database with sample products'

    def handle(self, *args, **options):
        # Create categories
        categories = [
            {'name': 'Espresso', 'slug': 'espresso'},
            {'name': 'Latte', 'slug': 'latte'},
            {'name': 'Cappuccino', 'slug': 'cappuccino'},
            {'name': 'Mocha', 'slug': 'mocha'},
            {'name': 'Americano', 'slug': 'americano'},
            {'name': 'Tea', 'slug': 'tea'},
            {'name': 'Pastries', 'slug': 'pastries'},
        ]
        
        for cat_data in categories:
            category, created = Category.objects.get_or_create(
                slug=cat_data['slug'],
                defaults={'name': cat_data['name'], 'is_active': True}
            )
            if created:
                self.stdout.write(f"✅ Created category: {category.name}")
        
        # Create products
        products = [
            {'name': 'Espresso', 'slug': 'espresso', 'price': 3.50, 'category': 'espresso', 'preparation_time': 3},
            {'name': 'Double Espresso', 'slug': 'double-espresso', 'price': 4.50, 'category': 'espresso', 'preparation_time': 4},
            {'name': 'Latte', 'slug': 'latte', 'price': 4.00, 'category': 'latte', 'preparation_time': 5},
            {'name': 'Vanilla Latte', 'slug': 'vanilla-latte', 'price': 4.50, 'category': 'latte', 'preparation_time': 5},
            {'name': 'Cappuccino', 'slug': 'cappuccino', 'price': 4.50, 'category': 'cappuccino', 'preparation_time': 5},
            {'name': 'Mocha', 'slug': 'mocha', 'price': 5.00, 'category': 'mocha', 'preparation_time': 6},
            {'name': 'Americano', 'slug': 'americano', 'price': 3.00, 'category': 'americano', 'preparation_time': 3},
            {'name': 'Green Tea', 'slug': 'green-tea', 'price': 3.00, 'category': 'tea', 'preparation_time': 3},
            {'name': 'Chai Latte', 'slug': 'chai-latte', 'price': 4.50, 'category': 'tea', 'preparation_time': 4},
            {'name': 'Croissant', 'slug': 'croissant', 'price': 3.00, 'category': 'pastries', 'preparation_time': 2},
            {'name': 'Muffin', 'slug': 'muffin', 'price': 3.50, 'category': 'pastries', 'preparation_time': 2},
        ]
        
        for prod_data in products:
            category = Category.objects.get(slug=prod_data['category'])
            product, created = Product.objects.get_or_create(
                slug=prod_data['slug'],
                defaults={
                    'name': prod_data['name'],
                    'price': prod_data['price'],
                    'category': category,
                    'preparation_time': prod_data.get('preparation_time', 5),
                    'stock_quantity': 100,
                    'is_available': True,
                    'is_featured': prod_data['slug'] in ['espresso', 'latte', 'mocha']
                }
            )
            if created:
                self.stdout.write(f"✅ Created product: {product.name}")
        
        self.stdout.write(self.style.SUCCESS('🎉 Sample products populated successfully!'))