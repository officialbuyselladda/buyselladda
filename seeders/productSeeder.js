import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import connectDB from '../src/config/db.js';
import Product from '../src/modules/product/product.model.js';
import User from '../src/modules/user/user.model.js';
import authService from '../src/modules/auth/auth.service.js';

const CATEGORIES = ['Electronics', 'Vehicles', 'Property', 'Jobs', 'Services', 'Others'];
const PRODUCTS_PER_CATEGORY = 12;

const titleBank = {
  Electronics: ['iPhone 13', 'Samsung TV 43"', 'Gaming Laptop', 'Bluetooth Speaker', 'Smart Watch', 'DSLR Camera'],
  Vehicles: ['Honda City 2018', 'Yamaha R15', 'Swift Dzire', 'Activa 6G', 'Royal Enfield Classic', 'Used Bicycle'],
  Property: ['2BHK Flat for Rent', 'Shop on Main Road', 'Office Space', 'Plot for Sale', 'PG Room Available', 'Warehouse'],
  Jobs: ['Delivery Boy Required', 'Receptionist Job', 'Sales Executive', 'Graphic Designer', 'Accountant Needed', 'Telecaller'],
  Services: ['AC Repair Service', 'Home Cleaning', 'Plumber on Call', 'Electrician Service', 'Laptop Repair', 'Painting Service'],
  Others: ['Study Table', 'Wooden Chair', 'Pet Adoption', 'Books Set', 'Gym Equipment', 'Musical Keyboard'],
};

const locationBank = ['Delhi', 'Mumbai', 'Bangalore', 'Hyderabad', 'Pune', 'Jaipur', 'Lucknow', 'Chandigarh'];

const categoryImageBank = {
  Electronics: [
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9',
    'https://images.unsplash.com/photo-1517336714739-489689fd1ca8',
    'https://images.unsplash.com/photo-1541807084-5c52b6b3adef',
  ],
  Vehicles: [
    'https://images.unsplash.com/photo-1494976388531-d1058494cdd8',
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70',
    'https://images.unsplash.com/photo-1549924231-f129b911e442',
  ],
  Property: [
    'https://images.unsplash.com/photo-1568605114967-8130f3a36994',
    'https://images.unsplash.com/photo-1570129477492-45c003edd2be',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750',
  ],
  Jobs: [
    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40',
    'https://images.unsplash.com/photo-1521737604893-d14cc237f11d',
    'https://images.unsplash.com/photo-1521791136064-7986c2920216',
  ],
  Services: [
    'https://images.unsplash.com/photo-1581578731548-c64695cc6952',
    'https://images.unsplash.com/photo-1621905251918-48416bd8575a',
    'https://images.unsplash.com/photo-1557804506-669a67965ba0',
  ],
  Others: [
    'https://images.unsplash.com/photo-1519710164239-da123dc03ef4',
    'https://images.unsplash.com/photo-1512436991641-6745cdb1723f',
    'https://images.unsplash.com/photo-1503602642458-232111445657',
  ],
};

const randomFrom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const priceRangeByCategory = {
  Electronics: [5000, 120000],
  Vehicles: [15000, 900000],
  Property: [500000, 15000000],
  Jobs: [10000, 80000],
  Services: [500, 25000],
  Others: [300, 50000],
};

const makeSlug = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');

const buildProducts = (users) => {
  const docs = [];

  CATEGORIES.forEach((category) => {
    for (let i = 1; i <= PRODUCTS_PER_CATEGORY; i += 1) {
      const baseTitle = randomFrom(titleBank[category]);
      const title = `[SEED] ${baseTitle} #${i}`;
      const [minP, maxP] = priceRangeByCategory[category];
      const price = randomInt(minP, maxP);
      const location = randomFrom(locationBank);
      const pickedUser = randomFrom(users);
      const imageUrl = randomFrom(categoryImageBank[category]);
      const slug = `seed-${makeSlug(baseTitle)}-${category.toLowerCase()}-${i}-${Date.now()}-${randomInt(100, 999)}`;
      const description = `High quality ${baseTitle.toLowerCase()} in excellent condition. Perfect working order. ${randomFrom(['Ready to use', 'Barely used', 'Like new', 'Well maintained'])}. Located in ${location}. Contact for quick deal. SEED-${i}-${Date.now()}`;

      docs.push({
        title,
        description,
        price,
        category,
        condition: randomFrom(['New', 'Used']),
        images: [
          {
            public_id: `seed-${category.toLowerCase()}-${i}`,
            url: imageUrl,
          },
        ],
        location,
        locationCoords: {
          type: 'Point',
          coordinates: [77.1025 + Math.random() * 0.1, 28.7041 + Math.random() * 0.1],
        },
        user: pickedUser._id,
        views: randomInt(0, 400),
        status: 'approved',
        slug,
        contentHash: `seed-${pickedUser._id}-${title}-${Date.now()}`, // Explicit unique contentHash
        searchVector: [],
      });
    }
  });

  return docs;
};

const seedProducts = async () => {
  try {
    console.log('🔌 Connecting to DB...');
    await connectDB();
    console.log('✅ DB connected');

    // Clear all products first
    await Product.deleteMany({});
    console.log('🧹 Cleared all products');

    const existingSeedUsers = await User.find({ email: { $regex: '@seed\\.BuySellAdda\\.com$' } }).select('_id email');
    if (existingSeedUsers.length) {
      await User.deleteMany({ _id: { $in: existingSeedUsers.map((u) => u._id) } });
      console.log(`🧹 Removed old seeded users: ${existingSeedUsers.length}`);
    }

    const seededUsers = [];
    for (let i = 1; i <= 6; i += 1) {
      const seedUser = await authService.register({
        name: `Seed Seller ${i}`,
        email: `seller${i}@seed.buyselladda.com`,
        password: 'seed123456',
      });
      seededUsers.push(seedUser);
    }
    console.log(`👥 Created seed users: ${seededUsers.length}`);

    const docs = buildProducts(seededUsers);
    const inserted = await Product.insertMany(docs);

    console.log(`✅ Seeded total products: ${inserted.length}`);
    console.log('📦 Category wise count:');
    for (const category of CATEGORIES) {
      const count = await Product.countDocuments({ category, title: { $regex: '^\\[SEED\\]' } });
      console.log(`   - ${category}: ${count}`);
    }

    console.log('👤 User wise count (who posted):');
    for (const user of seededUsers) {
      const count = await Product.countDocuments({ user: user._id });
      console.log(`   - ${user.name} (${user.email}): ${count}`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Product seeder failed:', error.message);
    process.exit(1);
  }
};

seedProducts();

