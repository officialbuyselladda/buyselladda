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
    enum: ['Electronics', 'Vehicles', 'Property', 'Jobs', 'Services', 'Others'],
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
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  views: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'suspicious'],
    default: 'pending',
  },
}, { timestamps: true });

productSchema.index({ title: 'text', description: 'text' });
productSchema.index({ category: 1, status: 1, createdAt: -1 });

const Product = mongoose.model('Product', productSchema);

export default Product;

