import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function dropIndexes() {
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/dealkro';
  
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  const Product = (await import('./src/modules/product/product.model.js')).default;
  
  try {
    await Product.collection.dropIndex('user_1_contentHash_1');
    console.log('✅ Dropped index: user_1_contentHash_1');
  } catch (e) {
    console.log('⚠️ Index user_1_contentHash_1 not found or already dropped');
  }
  
  try {
    await Product.collection.dropIndex('slug_1');
    console.log('✅ Dropped index: slug_1');
  } catch (e) {
    console.log('⚠️ Index slug_1 not found or already dropped');
  }

  // Also drop any other duplicate indexes
  try {
    await Product.collection.dropIndex('user_1_contentHash_1');
    console.log('✅ Dropped index');
  } catch (e) {}

  console.log('\n📋 Current indexes:');
  const indexes = await Product.collection.indexes();
  console.log(indexes.map(i => i.key).filter(k => k));

  await mongoose.disconnect();
  console.log('Done!');
  process.exit(0);
}

dropIndexes().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
