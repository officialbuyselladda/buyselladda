import mongoose from 'mongoose';

const favoriteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
    index: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound index for unique favorites
favoriteSchema.index({ user: 1, product: 1 }, { unique: true });

// Virtuals
favoriteSchema.virtual('productDetails', {
  ref: 'Product',
  localField: 'product',
  foreignField: '_id',
  justOne: true
});

favoriteSchema.virtual('userDetails', {
  ref: 'User',
  localField: 'user',
  foreignField: '_id',
  justOne: true
});

favoriteSchema.pre(/^find/, function() {
  this.populate('productDetails userDetails');
});

export default mongoose.model('Favorite', favoriteSchema);

