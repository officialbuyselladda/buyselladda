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
  adminPermissions: [{
    type: String,
    trim: true,
  }],
  phone: {
    type: String,
    trim: true,
    default: '',
    validate: {
      validator(value) {
        return !value || /^[6-9]\d{9}$/.test(value);
      },
      message: 'Please provide a valid 10 digit phone number',
    },
  },
  userType: {
    type: String,
    enum: ['normal', 'dealer'],
    default: 'normal',
  },
  subscriptionGroup: {
    type: String,
    enum: ['free', 'standard', 'premium', 'dealer'],
    default: 'free',
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  emailVerificationToken: {
    type: String,
    select: false,
  },
  emailVerificationExpire: {
    type: Date,
    select: false,
  },
  emailVerificationOtp: {
    type: String,
    select: false,
  },
  emailVerificationOtpExpire: {
    type: Date,
    select: false,
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
  adPostingLimits: {
    daily: {
      type: Number,
      default: 5,
      min: 0,
    },
    weekendDaily: {
      type: Number,
      default: 10,
      min: 0,
    },
    monthly: {
      type: Number,
      default: 50,
      min: 0,
    },
    unlimited: {
      type: Boolean,
      default: false,
    },
  },
  resetPasswordToken: {
    type: String,
    select: false,
  },
  resetPasswordExpire: {
    type: Date,
    select: false,
  },
}, {
  timestamps: true,
});

const User = mongoose.model('User', userSchema);

export default User;

