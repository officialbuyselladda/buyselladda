import Category from '../src/modules/category/category.model.js';
import connectDB from '../src/config/db.js';

const categoriesData = [
  { name: 'Stationary', slug: 'stationary', sortOrder: 1, icon: 'book', meta: { color: '#2563EB' } },
  { name: 'Electronics', slug: 'electronics', sortOrder: 2, icon: 'devices', meta: { color: '#4F46E5' } },
  { name: 'Jobs', slug: 'jobs', sortOrder: 3, icon: 'briefcase', meta: { color: '#EF4444' } },
  { name: 'Clothes', slug: 'clothes', sortOrder: 4, icon: 'shirt', meta: { color: '#EC4899' } },
  { name: 'Room', slug: 'room', sortOrder: 5, icon: 'room', meta: { color: '#10B981' } },
  { name: 'Flat,Building', slug: 'flat-building', sortOrder: 6, icon: 'building', meta: { color: '#14B8A6' } },
  { name: 'Cars', slug: 'cars', sortOrder: 7, icon: 'car', meta: { color: '#F59E0B' } },
  { name: 'Motorcycle', slug: 'motorcycle', sortOrder: 8, icon: 'bike', meta: { color: '#8B5CF6' } },
  { name: 'For Sale: Houses & Apartments', slug: 'for-sale-houses-apartments', sortOrder: 9, icon: 'home-sale', meta: { color: '#F97316' } },
  { name: 'For Rent: Houses & Apartments', slug: 'for-rent-houses-apartments', sortOrder: 10, icon: 'key', meta: { color: '#0EA5E9' } },
  { name: 'Smartphones', slug: 'smartphones', parentSlug: 'electronics', sortOrder: 20, icon: 'phone' },
  { name: 'Laptops', slug: 'laptops', parentSlug: 'electronics', sortOrder: 21, icon: 'laptop' },
  { name: 'Apartments', slug: 'apartments', parentSlug: 'flat-building', sortOrder: 30, icon: 'building' },
];

const seedCategories = async () => {
  try {
    await connectDB();
    console.log('Connected to DB. Seeding categories...');

    await Category.deleteMany({});
    console.log('Cleared existing categories');

    const createdBySlug = new Map();
    for (const category of categoriesData.filter((item) => !item.parentSlug)) {
      const created = await Category.create(category);
      createdBySlug.set(created.slug, created);
    }

    for (const category of categoriesData.filter((item) => item.parentSlug)) {
      const parent = createdBySlug.get(category.parentSlug);
      if (!parent) continue;
      const { parentSlug, ...payload } = category;
      await Category.create({ ...payload, parent: parent._id });
    }

    const count = await Category.countDocuments();
    console.log(`Seeded ${count} categories successfully!`);
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

if (import.meta.url === `file://${process.argv[1]}`) {
  seedCategories();
}
