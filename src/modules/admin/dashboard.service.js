import User from '../user/user.model.js';
import Product from '../product/product.model.js';
import Chat from '../chat/chat.model.js';

const getDashboardStats = async () => {
  const usersCount = await User.countDocuments();
  const productsCount = await Product.countDocuments({ status: 'active' });
  const chatsCount = await Chat.countDocuments();

  const recentUsers = await User.find().sort('-createdAt').limit(5).select('name email');
  const recentProducts = await Product.find({ status: 'active' }).populate('user', 'name').sort('-createdAt').limit(5);

  return {
    usersCount,
    productsCount,
    chatsCount,
    recentUsers,
    recentProducts,
  };
};

export default { getDashboardStats };

