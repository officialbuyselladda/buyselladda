import mongoose from 'mongoose';

const contactMessageSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['contact', 'report'],
      default: 'contact',
    },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    message: { type: String, required: true },
    problemType: { type: String, trim: true, default: '' },
    adReference: { type: String, trim: true, default: '' },
    screenshotAttached: { type: Boolean, default: false },
    status: { type: String, enum: ['new', 'reviewed'], default: 'new' },
  },
  { timestamps: true }
);

export default mongoose.model('ContactMessage', contactMessageSchema);
