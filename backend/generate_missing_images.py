import os
from PIL import Image, ImageDraw, ImageFont

def create_placeholder(text, filename, size=(400, 400), bg_color='#6F4E37'):
    """Create a placeholder image with text"""
    try:
        img = Image.new('RGB', size, bg_color)
        draw = ImageDraw.Draw(img)
        
        # Try to load a font, fallback to default
        try:
            font = ImageFont.truetype("arial.ttf", 30)
        except:
            font = ImageFont.load_default()
        
        # Draw text
        text_bbox = draw.textbbox((0, 0), text, font=font)
        text_width = text_bbox[2] - text_bbox[0]
        text_height = text_bbox[3] - text_bbox[1]
        
        x = (size[0] - text_width) // 2
        y = (size[1] - text_height) // 2
        
        draw.text((x, y), text, fill='white', font=font)
        
        # Add a coffee cup icon
        draw.ellipse([(size[0]//2-20, 20), (size[0]//2+20, 60)], fill='white', outline='white')
        draw.rectangle([(size[0]//2-10, 60), (size[0]//2+10, 80)], fill='white')
        
        img.save(filename)
        print(f"✅ Created placeholder: {filename}")
        return True
    except Exception as e:
        print(f"❌ Error creating {filename}: {e}")
        return False

def main():
    # Create directories if they don't exist
    os.makedirs('media/products', exist_ok=True)
    os.makedirs('media/categories', exist_ok=True)
    
    # Missing products that need placeholders
    missing_products = [
        'mocha', 'americano', 'banana-bread', 'cold-brew'
    ]
    
    # Also create placeholders for any missing product images
    products_dir = 'media/products'
    existing = set(os.listdir(products_dir))
    expected = ['espresso.jpg', 'latte.jpg', 'cappuccino.jpg', 'mocha.jpg', 'americano.jpg',
                'english-breakfast-tea.jpg', 'earl-grey-tea.jpg', 'green-tea.jpg', 'chai-latte.jpg',
                'butter-croissant.jpg', 'chocolate-croissant.jpg', 'blueberry-muffin.jpg', 'banana-bread.jpg',
                'chocolate-chip-cookie.jpg', 'shortbread-cookie.jpg', 'biscotti.jpg',
                'ham-cheese-sandwich.jpg', 'chicken-wrap.jpg',
                'iced-coffee.jpg', 'cold-brew.jpg']
    
    for product in expected:
        if product not in existing:
            name = product.replace('.jpg', '').replace('-', ' ').title()
            create_placeholder(name, os.path.join(products_dir, product))

if __name__ == "__main__":
    print("🎨 Generating placeholder images for missing products...")
    main()
    print("✅ All placeholders created!")
