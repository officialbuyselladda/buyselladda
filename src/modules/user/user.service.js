import User from './user.model.js';
import UserReport from './userReport.model.js';
import Product from '../product/product.model.js';

const getUser = async (id) => {
  const user = await User.findById(id).select('-password');
  if (!user) {
    throw new Error('User not found');
  }
  return user;
};

const getPublicProfile = async (profileUserId, viewerId) => {
  const user = await User.findById(profileUserId).select('name email phone avatar location trustScore createdAt lastSeen isBlocked blockedUsers');
  if (!user) throw new Error('User not found');

  const viewer = await User.findById(viewerId).select('blockedUsers');
  const totalProducts = await Product.countDocuments({ user: profileUserId, status: { $ne: 'rejected' } });
  const approvedProducts = await Product.countDocuments({ user: profileUserId, status: 'approved' });

  const userObject = user.toObject();
  return {
    ...userObject,
    blockedUsers: undefined,
    isBlockedByMe: Boolean(viewer?.blockedUsers?.some((blockedId) => blockedId.toString() === profileUserId.toString())),
    stats: {
      totalProducts,
      approvedProducts,
    },
  };
};

const toggleBlockUser = async (userId, targetUserId) => {
  if (userId.toString() === targetUserId.toString()) throw new Error('You cannot block yourself');

  const user = await User.findById(userId).select('blockedUsers');
  const targetUser = await User.findById(targetUserId).select('_id role');
  if (!user || !targetUser) throw new Error('User not found');

  const isBlocked = user.blockedUsers.some((blockedId) => blockedId.toString() === targetUserId.toString());
  if (isBlocked) {
    user.blockedUsers = user.blockedUsers.filter((blockedId) => blockedId.toString() !== targetUserId.toString());
  } else {
    user.blockedUsers.push(targetUserId);
  }

  await user.save();
  return { blocked: !isBlocked };
};

const reportUser = async (reporterId, reportedUserId, data = {}) => {
  if (reporterId.toString() === reportedUserId.toString()) throw new Error('You cannot report yourself');

  const reportedUser = await User.findById(reportedUserId).select('_id');
  if (!reportedUser) throw new Error('User not found');

  const reason = String(data.reason || '').trim();
  if (!reason) throw new Error('Report reason is required');

  return UserReport.create({
    reporter: reporterId,
    reportedUser: reportedUserId,
    chat: data.chatId || undefined,
    reason,
    details: String(data.details || '').trim(),
  });
};

const updateUser = async (id, updateData) => {
  const user = await User.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  ).select('-password');
  if (!user) {
    throw new Error('User not found');
  }
  return user;
};

const getProfileStats = async (userId) => {
  const stats = await User.aggregate([
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: 'user',
        as: 'products',
        pipeline: [
          { $match: { status: { $ne: 'rejected' } } }
        ]
      }
    },
    {
      $lookup: {
        from: 'messages',
        localField: '_id',
        foreignField: 'participants',
        as: 'chats',
        pipeline: [
          { $unwind: '$participants' },
          { $match: { 'participants.user': userId } },
          { $count: 'totalChats' }
        ]
      }
    },
    {
      $addFields: {
        totalProducts: { $size: '$products' },
        approvedProducts: {
          $size: {
            $filter: {
              input: '$products',
              cond: { $eq: ['$$this.status', 'approved'] }
            }
          }
        },
        totalChats: { $ifNull: [{ $size: '$chats' }, 0] },
        totalViews: { $sum: '$products.views' }
      }
    },
    { $match: { _id: userId } },
    { $project: {
        totalProducts: 1,
        approvedProducts: 1,
        totalChats: 1,
        totalViews: 1
      }
    }
  ]);

  return stats[0] || {
    totalProducts: 0,
    approvedProducts: 0,
    totalChats: 0,
    totalViews: 0
  };
};

export default { getUser, getPublicProfile, updateUser, getProfileStats, toggleBlockUser, reportUser };

