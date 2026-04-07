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

export default { getUser, updateUser };

