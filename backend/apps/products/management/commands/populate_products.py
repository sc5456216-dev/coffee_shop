from django.core.management.base import BaseCommand
from apps.products.models import Category, Product, ProductVariant
from decimal import Decimal

class Command(BaseCommand):
    help = 'Populate database with sample coffee shop products'

    def handle(self, *args, **options):
        self.stdout.write('🚀 Populating products...')
        
        # Create Categories
        categories_data = [
            {
                'name': 'Coffee',
                'slug': 'coffee',
                'description': 'Premium coffee from around the world',
                'is_active': True
            },
            {
                'name': 'Tea',
                'slug': 'tea',
                'description': 'Fine teas from the best estates',
                'is_active': True
            },
            {
                'name': 'Pastries',
                'slug': 'pastries',
                'description': 'Freshly baked pastries and desserts',
                'is_active': True
            },
            {
                'name': 'Biscuits & Cookies',
                'slug': 'biscuits',
                'description': 'Delicious biscuits and cookies',
                'is_active': True
            },
            {
                'name': 'Sandwiches',
                'slug': 'sandwiches',
                'description': 'Fresh sandwiches and wraps',
                'is_active': True
            },
            {
                'name': 'Cold Drinks',
                'slug': 'cold-drinks',
                'description': 'Refreshing cold beverages',
                'is_active': True
            },
            {
                'name': 'Specialty',
                'slug': 'specialty',
                'description': 'Specialty items and seasonal offerings',
                'is_active': True
            },
        ]
        
        categories = {}
        for cat_data in categories_data:
            category, created = Category.objects.get_or_create(
                slug=cat_data['slug'],
                defaults={
                    'name': cat_data['name'],
                    'description': cat_data['description'],
                    'is_active': cat_data['is_active']
                }
            )
            categories[cat_data['slug']] = category
            if created:
                self.stdout.write(f'✅ Created category: {category.name}')
            else:
                self.stdout.write(f'🔄 Category exists: {category.name}')

        # Create Products
        products_data = [
            # === COFFEE PRODUCTS ===
            {
                'name': 'Espresso',
                'slug': 'espresso',
                'description': 'Rich and bold single shot of espresso',
                'price': 3.50,
                'category': 'coffee',
                'is_available': True,
                'stock_quantity': 100,
                'preparation_time': 3,
                'is_featured': True
            },
            {
                'name': 'Double Espresso',
                'slug': 'double-espresso',
                'description': 'Double shot of intense espresso',
                'price': 4.50,
                'category': 'coffee',
                'is_available': True,
                'stock_quantity': 100,
                'preparation_time': 4,
                'is_featured': False
            },
            {
                'name': 'Caffè Latte',
                'slug': 'caffe-latte',
                'description': 'Smooth espresso with steamed milk and a light layer of foam',
                'price': 4.50,
                'category': 'coffee',
                'is_available': True,
                'stock_quantity': 100,
                'preparation_time': 5,
                'is_featured': True
            },
            {
                'name': 'Cappuccino',
                'slug': 'cappuccino',
                'description': 'Classic Italian coffee with equal parts espresso, steamed milk, and foam',
                'price': 4.75,
                'category': 'coffee',
                'is_available': True,
                'stock_quantity': 100,
                'preparation_time': 5,
                'is_featured': True
            },
            {
                'name': 'Mocha',
                'slug': 'mocha',
                'description': 'Espresso with chocolate syrup and steamed milk',
                'price': 5.00,
                'category': 'coffee',
                'is_available': True,
                'stock_quantity': 80,
                'preparation_time': 5,
                'is_featured': True
            },
            {
                'name': 'Americano',
                'slug': 'americano',
                'description': 'Espresso with hot water for a smoother taste',
                'price': 3.50,
                'category': 'coffee',
                'is_available': True,
                'stock_quantity': 100,
                'preparation_time': 3,
                'is_featured': False
            },
            {
                'name': 'Flat White',
                'slug': 'flat-white',
                'description': 'Smooth espresso with microfoam milk',
                'price': 4.75,
                'category': 'coffee',
                'is_available': True,
                'stock_quantity': 80,
                'preparation_time': 5,
                'is_featured': False
            },
            {
                'name': 'Caramel Macchiato',
                'slug': 'caramel-macchiato',
                'description': 'Espresso with vanilla, steamed milk, and caramel drizzle',
                'price': 5.25,
                'category': 'coffee',
                'is_available': True,
                'stock_quantity': 75,
                'preparation_time': 5,
                'is_featured': False
            },

            # === TEA PRODUCTS ===
            {
                'name': 'English Breakfast Tea',
                'slug': 'english-breakfast-tea',
                'description': 'Classic black tea blend, perfect with milk and sugar',
                'price': 3.00,
                'category': 'tea',
                'is_available': True,
                'stock_quantity': 100,
                'preparation_time': 3,
                'is_featured': True
            },
            {
                'name': 'Earl Grey Tea',
                'slug': 'earl-grey-tea',
                'description': 'Black tea flavored with bergamot oil',
                'price': 3.25,
                'category': 'tea',
                'is_available': True,
                'stock_quantity': 100,
                'preparation_time': 3,
                'is_featured': False
            },
            {
                'name': 'Green Tea',
                'slug': 'green-tea',
                'description': 'Light and refreshing Japanese green tea',
                'price': 3.00,
                'category': 'tea',
                'is_available': True,
                'stock_quantity': 90,
                'preparation_time': 3,
                'is_featured': False
            },
            {
                'name': 'Chai Latte',
                'slug': 'chai-latte',
                'description': 'Spiced Indian tea with steamed milk',
                'price': 4.50,
                'category': 'tea',
                'is_available': True,
                'stock_quantity': 80,
                'preparation_time': 5,
                'is_featured': True
            },
            {
                'name': 'Matcha Latte',
                'slug': 'matcha-latte',
                'description': 'Ceremonial grade matcha with steamed milk',
                'price': 5.00,
                'category': 'tea',
                'is_available': True,
                'stock_quantity': 70,
                'preparation_time': 5,
                'is_featured': False
            },
            {
                'name': 'Hibiscus Tea',
                'slug': 'hibiscus-tea',
                'description': 'Floral and tangy herbal tea',
                'price': 3.25,
                'category': 'tea',
                'is_available': True,
                'stock_quantity': 85,
                'preparation_time': 3,
                'is_featured': False
            },

            # === PASTRIES ===
            {
                'name': 'Butter Croissant',
                'slug': 'butter-croissant',
                'description': 'Flaky, buttery French croissant',
                'price': 3.25,
                'category': 'pastries',
                'is_available': True,
                'stock_quantity': 50,
                'preparation_time': 2,
                'is_featured': True
            },
            {
                'name': 'Chocolate Croissant',
                'slug': 'chocolate-croissant',
                'description': 'Butter croissant filled with rich chocolate',
                'price': 3.75,
                'category': 'pastries',
                'is_available': True,
                'stock_quantity': 45,
                'preparation_time': 2,
                'is_featured': False
            },
            {
                'name': 'Blueberry Muffin',
                'slug': 'blueberry-muffin',
                'description': 'Moist muffin bursting with blueberries',
                'price': 3.50,
                'category': 'pastries',
                'is_available': True,
                'stock_quantity': 40,
                'preparation_time': 2,
                'is_featured': False
            },
            {
                'name': 'Banana Bread',
                'slug': 'banana-bread',
                'description': 'Homestyle banana bread with walnuts',
                'price': 4.00,
                'category': 'pastries',
                'is_available': True,
                'stock_quantity': 35,
                'preparation_time': 2,
                'is_featured': False
            },
            {
                'name': 'Scone with Jam',
                'slug': 'scone-jam',
                'description': 'Traditional scone served with strawberry jam',
                'price': 3.50,
                'category': 'pastries',
                'is_available': True,
                'stock_quantity': 30,
                'preparation_time': 3,
                'is_featured': False
            },
            {
                'name': 'Danish Pastry',
                'slug': 'danish-pastry',
                'description': 'Flaky pastry with cream cheese filling',
                'price': 3.75,
                'category': 'pastries',
                'is_available': True,
                'stock_quantity': 30,
                'preparation_time': 2,
                'is_featured': False
            },

            # === BISCUITS & COOKIES ===
            {
                'name': 'Chocolate Chip Cookie',
                'slug': 'chocolate-chip-cookie',
                'description': 'Classic cookie with chunks of chocolate',
                'price': 2.50,
                'category': 'biscuits',
                'is_available': True,
                'stock_quantity': 60,
                'preparation_time': 1,
                'is_featured': True
            },
            {
                'name': 'Shortbread Cookie',
                'slug': 'shortbread-cookie',
                'description': 'Buttery Scottish shortbread',
                'price': 2.75,
                'category': 'biscuits',
                'is_available': True,
                'stock_quantity': 55,
                'preparation_time': 1,
                'is_featured': False
            },
            {
                'name': 'Oatmeal Raisin Cookie',
                'slug': 'oatmeal-raisin-cookie',
                'description': 'Chewy oatmeal cookie with raisins',
                'price': 2.50,
                'category': 'biscuits',
                'is_available': True,
                'stock_quantity': 50,
                'preparation_time': 1,
                'is_featured': False
            },
            {
                'name': 'Digestive Biscuit',
                'slug': 'digestive-biscuit',
                'description': 'Wholesome wheat biscuit',
                'price': 2.25,
                'category': 'biscuits',
                'is_available': True,
                'stock_quantity': 60,
                'preparation_time': 1,
                'is_featured': False
            },
            {
                'name': 'Biscotti',
                'slug': 'biscotti',
                'description': 'Italian almond biscuit, perfect for dipping',
                'price': 3.00,
                'category': 'biscuits',
                'is_available': True,
                'stock_quantity': 40,
                'preparation_time': 1,
                'is_featured': False
            },
            {
                'name': 'Macaron',
                'slug': 'macaron',
                'description': 'French almond meringue cookie',
                'price': 3.50,
                'category': 'biscuits',
                'is_available': True,
                'stock_quantity': 30,
                'preparation_time': 1,
                'is_featured': False
            },

            # === SANDWICHES ===
            {
                'name': 'Ham & Cheese Sandwich',
                'slug': 'ham-cheese-sandwich',
                'description': 'Classic sandwich with ham and cheddar',
                'price': 6.50,
                'category': 'sandwiches',
                'is_available': True,
                'stock_quantity': 25,
                'preparation_time': 5,
                'is_featured': False
            },
            {
                'name': 'Chicken Wrap',
                'slug': 'chicken-wrap',
                'description': 'Grilled chicken with lettuce and mayo in a tortilla',
                'price': 7.00,
                'category': 'sandwiches',
                'is_available': True,
                'stock_quantity': 25,
                'preparation_time': 5,
                'is_featured': False
            },
            {
                'name': 'Veggie Club Sandwich',
                'slug': 'veggie-club-sandwich',
                'description': 'Roasted vegetables with hummus on multigrain bread',
                'price': 6.75,
                'category': 'sandwiches',
                'is_available': True,
                'stock_quantity': 20,
                'preparation_time': 5,
                'is_featured': False
            },
            {
                'name': 'Tuna Melt',
                'slug': 'tuna-melt',
                'description': 'Tuna salad with cheese on toasted bread',
                'price': 7.25,
                'category': 'sandwiches',
                'is_available': True,
                'stock_quantity': 20,
                'preparation_time': 5,
                'is_featured': False
            },

            # === COLD DRINKS ===
            {
                'name': 'Iced Coffee',
                'slug': 'iced-coffee',
                'description': 'Chilled coffee served over ice',
                'price': 4.00,
                'category': 'cold-drinks',
                'is_available': True,
                'stock_quantity': 80,
                'preparation_time': 3,
                'is_featured': False
            },
            {
                'name': 'Iced Latte',
                'slug': 'iced-latte',
                'description': 'Smooth iced coffee with milk',
                'price': 4.75,
                'category': 'cold-drinks',
                'is_available': True,
                'stock_quantity': 80,
                'preparation_time': 3,
                'is_featured': False
            },
            {
                'name': 'Cold Brew',
                'slug': 'cold-brew',
                'description': 'Smooth, slow-steeped cold brew coffee',
                'price': 5.00,
                'category': 'cold-drinks',
                'is_available': True,
                'stock_quantity': 70,
                'preparation_time': 3,
                'is_featured': True
            },
            {
                'name': 'Lemonade',
                'slug': 'lemonade',
                'description': 'Freshly squeezed lemonade',
                'price': 3.50,
                'category': 'cold-drinks',
                'is_available': True,
                'stock_quantity': 60,
                'preparation_time': 2,
                'is_featured': False
            },

            # === SPECIALTY ===
            {
                'name': 'Pumpkin Spice Latte',
                'slug': 'pumpkin-spice-latte',
                'description': 'Seasonal favorite with pumpkin and spices',
                'price': 5.50,
                'category': 'specialty',
                'is_available': True,
                'stock_quantity': 50,
                'preparation_time': 5,
                'is_featured': True
            },
            {
                'name': 'Matcha Latte',
                'slug': 'matcha-latte-specialty',
                'description': 'Premium matcha green tea latte',
                'price': 5.25,
                'category': 'specialty',
                'is_available': True,
                'stock_quantity': 45,
                'preparation_time': 5,
                'is_featured': False
            },
            {
                'name': 'Golden Milk Latte',
                'slug': 'golden-milk-latte',
                'description': 'Turmeric and spice latte with oat milk',
                'price': 5.00,
                'category': 'specialty',
                'is_available': True,
                'stock_quantity': 40,
                'preparation_time': 5,
                'is_featured': False
            },
        ]

        # Create products
        for prod_data in products_data:
            category = categories[prod_data['category']]
            product, created = Product.objects.get_or_create(
                slug=prod_data['slug'],
                defaults={
                    'name': prod_data['name'],
                    'description': prod_data['description'],
                    'price': Decimal(str(prod_data['price'])),
                    'category': category,
                    'is_available': prod_data['is_available'],
                    'stock_quantity': prod_data['stock_quantity'],
                    'preparation_time': prod_data['preparation_time'],
                    'is_featured': prod_data['is_featured']
                }
            )
            if created:
                self.stdout.write(f'✅ Created product: {product.name}')
            else:
                self.stdout.write(f'🔄 Product exists: {product.name}')

            # Add variants for coffee and tea products
            if prod_data['category'] in ['coffee', 'tea']:
                # Add size variants
                sizes = [
                    {'name': 'Small', 'price_adjustment': 0},
                    {'name': 'Medium', 'price_adjustment': 0.75},
                    {'name': 'Large', 'price_adjustment': 1.50},
                ]
                for size in sizes:
                    variant, created = ProductVariant.objects.get_or_create(
                        product=product,
                        name=size['name'],
                        defaults={
                            'price_adjustment': Decimal(str(size['price_adjustment'])),
                            'stock_quantity': product.stock_quantity,
                            'is_active': True
                        }
                    )
                    if created:
                        self.stdout.write(f'  ✅ Added variant: {product.name} - {size["name"]}')

        self.stdout.write(self.style.SUCCESS('🎉 All products populated successfully!'))