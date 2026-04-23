import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['new_message', 'product_status', 'favorite_activity', 'system', 'promotion'],
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  relatedProduct: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    sparse: true
  },
  relatedChat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat',
    sparse: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ isRead: 1, createdAt: -1 });
notificationSchema.index({ type: 1 });

export default mongoose.model('Notification', notificationSchema);

