import mongoose from 'mongoose';
import validator from 'validator';

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [30, 'Name cannot exceed 30 chars'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide valid email'],
  },
  password: {
    type: String,
    required: [true, 'Password required'],
    minlength: 6,
    select: false,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  phone: {
    type: String,
    trim: true,
    default: '',
  },
  isBlocked: {
    type: Boolean,
    default: false
  },
  avatar: {
    public_id: String,
    url: String,
  },
  location: String,
  lastSeen: {
    type: Date,
    default: Date.now,
  },
  blockedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  trustScore: {
    type: Number,
    default: 0,
    min: 0,
  },
}, {
  timestamps: true,
});

const User = mongoose.model('User', userSchema);

export default User;

