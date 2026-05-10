import mongoose from 'mongoose';

const productSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    required: true,
    trim: true,
  },
  condition: {
    type: String,
    enum: ['New', 'Used'],
    default: 'Used',
  },
  images: [{
    public_id: String,
    url: String,
  }],
  location: {
    type: String,
    required: true,
  },
  locationCoords: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: [Number]  // [lng, lat]
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  views: {
    type: Number,
    default: 0,
  },
  isBoosted: {
    type: Boolean,
    default: false,
    index: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'suspicious', 'deleted', 'sold'],
    default: 'pending',
  },
  slug: {
    type: String,
    lowercase: true,
    trim: true,
    default: null  // Default to null, service generates unique slug
  },
  contentHash: {
    type: String,
    default: null,
  },
  searchVector: [
    {
      term: {
        type: String,
      },
      tfidf: {
        type: Number,
      },
    },
  ],
}, { timestamps: true });

productSchema.index({ title: 'text', category: 1 });
productSchema.index({ category: 1, status: 1, createdAt: -1 });
productSchema.index({ category: 1, createdAt: -1 });
productSchema.index({ user: 1, createdAt: -1 });
productSchema.index({ isBoosted: -1, createdAt: -1, status: 1 });
productSchema.index({ locationCoords: '2dsphere' });


const Product = mongoose.model('Product', productSchema);

export default Product;
