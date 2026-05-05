import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function dropIndexes() {
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/dealkro';
  
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  const Product = (await import('./src/modules/product/product.model.js')).default;
  
  console.log('\n🗑️ Dropping problematic indexes...\n');

  // First, get all current indexes to find the exact names
  const indexes = await Product.collection.indexes();
  console.log('Current indexes on products collection:');
  indexes.forEach((idx, i) => {
    console.log(`  ${i + 1}. ${idx.name}: ${JSON.stringify(idx.key)} (unique: ${idx.unique || false})`);
  });

  // List of indexes to try to drop (by exact name or key pattern)
  const indexPatternsToDrop = [
    'user_1_contentHash_1',
    'slug_1', 
    'contentHash_1',
    '_id_'
  ];

  for (const idx of indexes) {
    // Skip _id_ index
    if (idx.name === '_id_') continue;
    
    // Check if this is a unique index on slug that could cause duplicate null errors
    const isUniqueSlug = idx.unique && idx.key.slug === 1;
    const isContentHash = idx.key.contentHash === 1;
    
    if (isUniqueSlug || isContentHash || indexPatternsToDrop.includes(idx.name)) {
      try {
        await Product.collection.dropIndex(idx.name);
        console.log(`✅ Dropped index: ${idx.name}`);
      } catch (e) {
        console.log(`⚠️ Could not drop ${idx.name}: ${e.message}`);
      }
    }
  }

  // Also try to drop by key pattern (for indexes not in list)
  try {
    await Product.collection.dropIndex('user_1_contentHash_1');
    console.log('✅ Dropped index: user_1_contentHash_1');
  } catch (e) {
    // Ignore if not found
  }

  try {
    await Product.collection.dropIndex('slug_1');
    console.log('✅ Dropped index: slug_1');
  } catch (e) {
    // Ignore if not found
  }

  try {
    await Product.collection.dropIndex('contentHash_1');
    console.log('✅ Dropped index: contentHash_1');
  } catch (e) {
    // Ignore if not found
  }

  console.log('\n📋 Remaining indexes after cleanup:');
  const remainingIndexes = await Product.collection.indexes();
  remainingIndexes.forEach((idx, i) => {
    console.log(`  ${i + 1}. ${idx.name}: ${JSON.stringify(idx.key)} (unique: ${idx.unique || false})`);
  });

  // Sample some products to check slug status
  console.log('\n📊 Sample of products with null/empty slugs:');
  const sampleProducts = await Product.find({ $or: [{ slug: null }, { slug: '' }, { slug: { $exists: false } }] })
    .select('title slug')
    .limit(5);
  console.log(`Found ${sampleProducts.length} products with null/empty slugs`);
  sampleProducts.forEach(p => {
    console.log(`  - "${p.title}" -> slug: ${p.slug}`);
  });

  await mongoose.disconnect();
  console.log('\n✅ Done! The duplicate key error should be fixed now.');
  process.exit(0);
}

dropIndexes().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
