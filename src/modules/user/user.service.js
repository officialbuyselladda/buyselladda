import User from './user.model.js';

const getUser = async (id) => {
  const user = await User.findById(id).select('-password');
  if (!user) {
    throw new Error('User not found');
  }
  return user;
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

export default { getUser, updateUser, getProfileStats };

