import User from '../user/user.model.js';
import sendEmail from '../../config/email.js';
import templates from '../../utils/emailTemplates.js';

export const getUserDetail = async (id) => {
  const user = await User.findById(id).populate('products').select('-password').lean();
  if (!user) throw new Error('User not found');
  user.productCount = user.products ? user.products.length : 0;
  user.status = user.isBlocked ? 'blocked' : 'active';
  return user;
};

export const toggleUserBlock = async (id) => {
  const user = await User.findById(id);
  if (!user || user.role === 'admin') throw new Error('Cannot block admin or invalid user');
  user.isBlocked = !user.isBlocked;
  await user.save();
  const action = user.isBlocked ? 'blocked' : 'unblocked';
  await sendEmail(user.email, `Your account has been ${action}`, templates.accountBlocked(action));
  return user;
};

export const updateUser = async (id, updateData) => {
  const user = await User.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).select('-password');
  if (!user) throw new Error('User not found');
  return user;
};

export const deleteUser = async (id) => {
  const user = await User.findById(id);
  if (!user || user.role === 'admin') throw new Error('Cannot delete admin');
  await User.findByIdAndDelete(id);
};

