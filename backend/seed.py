"""
Seed script — populates the canteen database with sample food items and a
default admin account.

Usage:
    python seed.py
"""

import sys
import os

# Ensure the backend package is importable
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import app
from models import db, Admin, Food


SAMPLE_FOODS = [
    # ── Starters ────────────────────────────────────────────────
    {
        'name': 'Paneer Tikka',
        'description': 'Marinated cottage cheese grilled to perfection with spices',
        'price': 180,
        'category': 'Starters',
        'image': 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400&h=300&fit=crop',
        'is_available': True,
    },
    {
        'name': 'Veg Spring Rolls',
        'description': 'Crispy rolls stuffed with fresh vegetables and served with chili sauce',
        'price': 120,
        'category': 'Starters',
        'image': 'https://images.unsplash.com/photo-1606525437817-0fd4b9644f84?w=400&h=300&fit=crop',
        'is_available': True,
    },

    # ── Main Course ─────────────────────────────────────────────
    {
        'name': 'Chicken Biryani',
        'description': 'Aromatic basmati rice layered with tender spiced chicken',
        'price': 220,
        'category': 'Main Course',
        'image': 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&h=300&fit=crop',
        'is_available': True,
    },
    {
        'name': 'Dal Makhani',
        'description': 'Slow-cooked black lentils in creamy tomato gravy',
        'price': 160,
        'category': 'Main Course',
        'image': 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=300&fit=crop',
        'is_available': True,
    },
    {
        'name': 'Butter Naan',
        'description': 'Soft tandoor-baked bread brushed with butter',
        'price': 40,
        'category': 'Main Course',
        'image': 'https://images.unsplash.com/photo-1600398142498-c5f5e0f8a7ce?w=400&h=300&fit=crop',
        'is_available': True,
    },

    # ── Beverages / Cold Drinks ─────────────────────────────────
    {
        'name': 'Mango Lassi',
        'description': 'Refreshing yogurt drink blended with alphonso mango',
        'price': 80,
        'category': 'Beverages',
        'image': 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400&h=300&fit=crop',
        'is_available': True,
    },
    {
        'name': 'Masala Chai',
        'description': 'Hot Indian tea brewed with spices and milk',
        'price': 30,
        'category': 'Beverages',
        'image': 'https://images.unsplash.com/photo-1597318181409-cf64d0b5d8a2?w=400&h=300&fit=crop',
        'is_available': True,
    },
    {
        'name': 'Cold Coffee',
        'description': 'Chilled coffee blended with ice cream and cream',
        'price': 100,
        'category': 'Beverages',
        'image': 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=300&fit=crop',
        'is_available': True,
    },
    {
        'name': 'Lemonade',
        'description': 'Fresh lemon juice with sugar, salt, and a hint of mint',
        'price': 40,
        'category': 'Beverages',
        'image': 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=400&h=300&fit=crop',
        'is_available': True,
    },
    {
        'name': 'Iced Tea',
        'description': 'Chilled black tea with lemon and a touch of honey',
        'price': 60,
        'category': 'Beverages',
        'image': 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=300&fit=crop',
        'is_available': True,
    },
    {
        'name': 'Buttermilk (Chaas)',
        'description': 'Spiced yogurt drink with cumin and fresh coriander',
        'price': 30,
        'category': 'Beverages',
        'image': 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&h=300&fit=crop',
        'is_available': True,
    },

    # ── Desserts ────────────────────────────────────────────────
    {
        'name': 'Gulab Jamun',
        'description': 'Soft milk-solid dumplings soaked in rose-flavored sugar syrup',
        'price': 60,
        'category': 'Desserts',
        'image': 'https://images.unsplash.com/photo-1666190066824-48a0e5f60e17?w=400&h=300&fit=crop',
        'is_available': True,
    },
    {
        'name': 'Chocolate Brownie',
        'description': 'Rich and fudgy chocolate brownie served warm',
        'price': 120,
        'category': 'Desserts',
        'image': 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&h=300&fit=crop',
        'is_available': True,
    },

    # ── Snacks (Indian) ────────────────────────────────────────
    {
        'name': 'Samosa',
        'description': 'Crispy fried pastry filled with spiced potatoes and peas',
        'price': 30,
        'category': 'Snacks',
        'image': 'https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd7?w=400&h=300&fit=crop',
        'is_available': True,
    },
    {
        'name': 'Idli',
        'description': 'Steamed rice cakes served with coconut chutney and sambar',
        'price': 40,
        'category': 'Snacks',
        'image': 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400&h=300&fit=crop',
        'is_available': True,
    },
    {
        'name': 'Frankie',
        'description': 'Spiced veggie or paneer roll wrapped in a flaky paratha',
        'price': 80,
        'category': 'Snacks',
        'image': 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&h=300&fit=crop',
        'is_available': True,
    },
    {
        'name': 'Dosa',
        'description': 'Crispy golden rice crepe served with chutney and sambar',
        'price': 60,
        'category': 'Snacks',
        'image': 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=400&h=300&fit=crop',
        'is_available': True,
    },
    {
        'name': 'Vada Pav',
        'description': 'Mumbai-style spiced potato fritter in a bun with chutneys',
        'price': 40,
        'category': 'Snacks',
        'image': 'https://images.unsplash.com/photo-1606491956689-2ea866880049?w=400&h=300&fit=crop',
        'is_available': True,
    },
    {
        'name': 'French Fries',
        'description': 'Golden crispy fries with peri-peri seasoning',
        'price': 90,
        'category': 'Snacks',
        'image': 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&h=300&fit=crop',
        'is_available': True,
    },
]


def seed():
    with app.app_context():
        db.create_all()
        print('✅ Connected to MySQL')

        # Seed admin
        admin_count = Admin.query.count()
        if admin_count == 0:
            admin = Admin(username='admin')
            admin.set_password('admin123')
            db.session.add(admin)
            db.session.commit()
            print('🔑 Default admin created (admin / admin123)')
        else:
            print('🔑 Admin already exists')

        # Seed foods
        food_count = Food.query.count()
        if food_count == 0:
            for item in SAMPLE_FOODS:
                food = Food(**item)
                db.session.add(food)
            db.session.commit()
            print(f'🍽️  {len(SAMPLE_FOODS)} food items seeded')
        else:
            print(f'🍽️  {food_count} food items already exist (skipping)')

        print('\n✅ Database seeded successfully!')


if __name__ == '__main__':
    seed()
