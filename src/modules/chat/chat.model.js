import mongoose from 'mongoose';

const chatSchema = mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }],
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  },
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
  },
}, { timestamps: true });

// Index for efficient queries
chatSchema.index({ participants: 1 });
chatSchema.index({ product: 1 });

const Chat = mongoose.model('Chat', chatSchema);

export default Chat;

