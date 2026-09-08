const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Food = require('./models/Food');
const Admin = require('./models/Admin');

dotenv.config();

const sampleFoods = [
  {
    name: 'Paneer Tikka',
    description: 'Marinated cottage cheese grilled to perfection with spices',
    price: 180,
    category: 'Starters',
    image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400&h=300&fit=crop',
    isAvailable: true,
  },
  {
    name: 'Veg Spring Rolls',
    description: 'Crispy rolls stuffed with fresh vegetables and served with chili sauce',
    price: 120,
    category: 'Starters',
    image: 'https://images.unsplash.com/photo-1606525437817-0fd4b9644f84?w=400&h=300&fit=crop',
    isAvailable: true,
  },
  {
    name: 'Chicken Biryani',
    description: 'Aromatic basmati rice layered with tender spiced chicken',
    price: 220,
    category: 'Main Course',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&h=300&fit=crop',
    isAvailable: true,
  },
  {
    name: 'Dal Makhani',
    description: 'Slow-cooked black lentils in creamy tomato gravy',
    price: 160,
    category: 'Main Course',
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=300&fit=crop',
    isAvailable: true,
  },
  {
    name: 'Butter Naan',
    description: 'Soft tandoor-baked bread brushed with butter',
    price: 40,
    category: 'Main Course',
    image: 'https://images.unsplash.com/photo-1600398142498-c5f5e0f8a7ce?w=400&h=300&fit=crop',
    isAvailable: true,
  },
  {
    name: 'Masala Dosa',
    description: 'Crispy rice crepe filled with spiced potato filling',
    price: 100,
    category: 'Main Course',
    image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=400&h=300&fit=crop',
    isAvailable: true,
  },
  {
    name: 'Mango Lassi',
    description: 'Refreshing yogurt drink blended with alphonso mango',
    price: 80,
    category: 'Beverages',
    image: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400&h=300&fit=crop',
    isAvailable: true,
  },
  {
    name: 'Masala Chai',
    description: 'Hot Indian tea brewed with spices and milk',
    price: 30,
    category: 'Beverages',
    image: 'https://images.unsplash.com/photo-1597318181409-cf64d0b5d8a2?w=400&h=300&fit=crop',
    isAvailable: true,
  },
  {
    name: 'Cold Coffee',
    description: 'Chilled coffee blended with ice cream and cream',
    price: 100,
    category: 'Beverages',
    image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=300&fit=crop',
    isAvailable: true,
  },
  {
    name: 'Gulab Jamun',
    description: 'Soft milk-solid dumplings soaked in rose-flavored sugar syrup',
    price: 60,
    category: 'Desserts',
    image: 'https://images.unsplash.com/photo-1666190066824-48a0e5f60e17?w=400&h=300&fit=crop',
    isAvailable: true,
  },
  {
    name: 'Chocolate Brownie',
    description: 'Rich and fudgy chocolate brownie served warm',
    price: 120,
    category: 'Desserts',
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&h=300&fit=crop',
    isAvailable: true,
  },
  {
    name: 'Samosa',
    description: 'Crispy fried pastry filled with spiced potatoes and peas',
    price: 30,
    category: 'Snacks',
    image: 'https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd7?w=400&h=300&fit=crop',
    isAvailable: true,
  },
  {
    name: 'Vada Pav',
    description: 'Mumbai-style spiced potato fritter in a bun with chutneys',
    price: 40,
    category: 'Snacks',
    image: 'https://images.unsplash.com/photo-1606491956689-2ea866880049?w=400&h=300&fit=crop',
    isAvailable: true,
  },
  {
    name: 'French Fries',
    description: 'Golden crispy fries with peri-peri seasoning',
    price: 90,
    category: 'Snacks',
    image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&h=300&fit=crop',
    isAvailable: true,
  },
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Seed admin
    const adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
      await Admin.create({ username: 'admin', password: 'admin123' });
      console.log('🔑 Default admin created (admin / admin123)');
    } else {
      console.log('🔑 Admin already exists');
    }

    // Seed foods
    const foodCount = await Food.countDocuments();
    if (foodCount === 0) {
      await Food.insertMany(sampleFoods);
      console.log(`🍽️  ${sampleFoods.length} food items seeded`);
    } else {
      console.log(`🍽️  ${foodCount} food items already exist (skipping)`);
    }

    console.log('\n✅ Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error.message);
    process.exit(1);
  }
};

seedDB();
