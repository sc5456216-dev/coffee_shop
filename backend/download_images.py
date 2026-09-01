import os
import sys
import django
import requests

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'coffee_shop.settings')
django.setup()

# Working Unsplash image URLs for coffee shop products
IMAGE_URLS = {
    # Category Images
    'coffee': 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&h=400&fit=crop',
    'tea': 'https://images.unsplash.com/photo-1556881286-fc6915169721?w=800&h=400&fit=crop',
    'pastries': 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&h=400&fit=crop',
    'biscuits': 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=800&h=400&fit=crop',
    'sandwiches': 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=800&h=400&fit=crop',
    'cold-drinks': 'https://images.unsplash.com/photo-1517701550923-8c5a10325781?w=800&h=400&fit=crop',
    'specialty': 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&h=400&fit=crop',
    
    # Product Images - Coffee (Updated working URLs)
    'espresso': 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&h=400&fit=crop',
    'latte': 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=400&h=400&fit=crop',
    'cappuccino': 'https://images.unsplash.com/photo-1534778101976-62847782c213?w=400&h=400&fit=crop',
    'mocha': 'https://images.unsplash.com/photo-1525803851131-81c32754b030?w=400&h=400&fit=crop',
    'americano': 'https://images.unsplash.com/photo-1551030173-1220f915cf1e?w=400&h=400&fit=crop',
    
    # Product Images - Tea
    'english-breakfast-tea': 'https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?w=400&h=400&fit=crop',
    'earl-grey-tea': 'https://images.unsplash.com/photo-1556881286-fc6915169721?w=400&h=400&fit=crop',
    'green-tea': 'https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?w=400&h=400&fit=crop',
    'chai-latte': 'https://images.unsplash.com/photo-1556881286-fc6915169721?w=400&h=400&fit=crop',
    
    # Product Images - Pastries
    'butter-croissant': 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&h=400&fit=crop',
    'chocolate-croissant': 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&h=400&fit=crop',
    'blueberry-muffin': 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=400&h=400&fit=crop',
    'banana-bread': 'https://images.unsplash.com/photo-1574085733277-851d8b2adacc?w=400&h=400&fit=crop',
    
    # Product Images - Biscuits
    'chocolate-chip-cookie': 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400&h=400&fit=crop',
    'shortbread-cookie': 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400&h=400&fit=crop',
    'biscotti': 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400&h=400&fit=crop',
    
    # Product Images - Sandwiches
    'ham-cheese-sandwich': 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&h=400&fit=crop',
    'chicken-wrap': 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&h=400&fit=crop',
    
    # Product Images - Cold Drinks (Updated working URLs)
    'iced-coffee': 'https://images.unsplash.com/photo-1517701550923-8c5a10325781?w=400&h=400&fit=crop',
    'cold-brew': 'https://images.unsplash.com/photo-1517701550923-8c5a10325781?w=400&h=400&fit=crop',
}

def download_image(url, filename, folder='media/products/'):
    """Download an image from URL and save to folder"""
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        response = requests.get(url, stream=True, headers=headers, timeout=30)
        if response.status_code == 200:
            filepath = os.path.join(folder, filename)
            with open(filepath, 'wb') as f:
                for chunk in response.iter_content(1024):
                    if chunk:
                        f.write(chunk)
            print(f"✅ Downloaded: {filename}")
            return filepath
        else:
            print(f"❌ Failed to download: {filename} (Status: {response.status_code})")
            return None
    except Exception as e:
        print(f"❌ Error downloading {filename}: {e}")
        return None

def main():
    # Create directories if they don't exist
    os.makedirs('media/products', exist_ok=True)
    os.makedirs('media/categories', exist_ok=True)
    
    print("📥 Downloading images...")
    print("=" * 50)
    
    # Download category images
    print("\n📁 Downloading Category Images:")
    category_names = ['coffee', 'tea', 'pastries', 'biscuits', 'sandwiches', 'cold-drinks', 'specialty']
    for name in category_names:
        if name in IMAGE_URLS:
            filename = f"{name}.jpg"
            download_image(IMAGE_URLS[name], filename, 'media/categories/')
    
    # Download product images
    print("\n📁 Downloading Product Images:")
    product_names = [
        'espresso', 'latte', 'cappuccino', 'mocha', 'americano',
        'english-breakfast-tea', 'earl-grey-tea', 'green-tea', 'chai-latte',
        'butter-croissant', 'chocolate-croissant', 'blueberry-muffin', 'banana-bread',
        'chocolate-chip-cookie', 'shortbread-cookie', 'biscotti',
        'ham-cheese-sandwich', 'chicken-wrap',
        'iced-coffee', 'cold-brew'
    ]
    for name in product_names:
        if name in IMAGE_URLS:
            filename = f"{name}.jpg"
            download_image(IMAGE_URLS[name], filename, 'media/products/')
    
    print("\n" + "=" * 50)
    print("✅ All images downloaded successfully!")
    print(f"📁 Images saved to: media/products/ and media/categories/")

if __name__ == "__main__":
    main()