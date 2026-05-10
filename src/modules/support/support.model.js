import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    senderRole: {
      type: String,
      enum: ['user', 'admin'],
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 3000,
    },
  },
  { timestamps: true }
);

const supportTicketSchema = new mongoose.Schema(
  {
    ticketNumber: {
      type: String,
      unique: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
      maxlength: 140,
    },
    category: {
      type: String,
      enum: ['account', 'ad', 'payment', 'chat', 'safety', 'technical', 'other'],
      default: 'other',
      index: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
      index: true,
    },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'waiting_user', 'resolved', 'closed'],
      default: 'open',
      index: true,
    },
    relatedProduct: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      default: null,
    },
    contactEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
    },
    messages: [messageSchema],
    adminNote: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: '',
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

supportTicketSchema.index({ status: 1, priority: 1, updatedAt: -1 });
supportTicketSchema.index({ subject: 'text', ticketNumber: 'text', contactEmail: 'text' });

supportTicketSchema.pre('save', function setTicketNumber(next) {
  if (!this.ticketNumber) {
    const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
    this.ticketNumber = `DK-${Date.now().toString().slice(-8)}-${suffix}`;
  }
  next();
});

const SupportTicket = mongoose.model('SupportTicket', supportTicketSchema);

export default SupportTicket;
