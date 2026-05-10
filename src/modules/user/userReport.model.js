import mongoose from 'mongoose';

const userReportSchema = mongoose.Schema({
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  reportedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  chat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat',
  },
  reason: {
    type: String,
    required: true,
    trim: true,
    maxlength: 120,
  },
  details: {
    type: String,
    trim: true,
    maxlength: 1000,
    default: '',
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'dismissed'],
    default: 'pending',
  },
}, { timestamps: true });

userReportSchema.index({ reporter: 1, reportedUser: 1, createdAt: -1 });

const UserReport = mongoose.model('UserReport', userReportSchema);

export default UserReport;
