const mongoose = require('mongoose');
const Category = require('../src/modules/category/category.model.js');
const connectDB = require('../src/config/db.js');

const categoriesData = [
  // Main Categories
  { name: 'Electronics', slug: 'electronics', sortOrder: 1, icon: '📱', meta: { color: '#4F46E5' } },
  { name: 'Vehicles', slug: 'vehicles', sortOrder: 2, icon: '🚗', meta: { color: '#F59E0B' } },
  { name: 'Property', slug: 'property', sortOrder: 3, icon: '🏠', meta: { color: '#10B981' } },
  { name: 'Jobs', slug: 'jobs', sortOrder: 4, icon: '💼', meta: { color: '#EF4444' } },
  { name: 'Mobile Phones', slug: 'mobile-phones', sortOrder: 5, icon: '📱', meta: { color: '#8B5CF6' } },
  { name: 'Furniture', slug: 'furniture', sortOrder: 6, icon: '🛋️', meta: { color: '#06B6D4' } },
  
  // Subcategories
  { name: 'Smartphones', slug: 'smartphones', parent: null, sortOrder: 10 }, // Will set parent after main created
  { name: 'Laptops', slug: 'laptops', parent: null, sortOrder: 11 },
  { name: 'Cars', slug: 'cars', parent: null, sortOrder: 20 },
  { name: 'Apartments', slug: 'apartments', parent: null, sortOrder: 30 },
];

const seedCategories = async () => {
  try {
    await connectDB();
    console.log('✅ Connected to DB. Seeding categories...');

    await Category.deleteMany({});
    console.log('🗑️  Cleared existing categories');

    // Create main categories first
    for (const cat of categoriesData.filter(c => !c.parent)) {
      await Category.create(cat);
    }

    // Get main category IDs and create subcategories
    const electronicsId = await Category.findOne({ slug: 'electronics' }, '_id');
    const vehiclesId = await Category.findOne({ slug: 'vehicles' }, '_id');
    const propertyId = await Category.findOne({ slug: 'property' }, '_id');

    await Category.create([
      { ...categoriesData.find(c => c.slug === 'smartphones'), parent: electronicsId._id },
      { ...categoriesData.find(c => c.slug === 'laptops'), parent: electronicsId._id },
      { ...categoriesData.find(c => c.slug === 'cars'), parent: vehiclesId._id },
      { ...categoriesData.find(c => c.slug === 'apartments'), parent: propertyId._id },
    ]);

    const count = await Category.countDocuments();
    console.log(`✅ Seeded ${count} categories successfully!`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  seedCategories();
}

module.exports = seedCategories;

