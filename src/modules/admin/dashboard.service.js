import User from '../user/user.model.js';
import Product from '../product/product.model.js';
import Chat from '../chat/chat.model.js';

const getDashboardStats = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const [
    usersCount,
    productsCount,
    pendingProducts,
    chatsCount,
    newUsersToday,
    todayProducts,
    activeUsers,
    totalViews,
    revenue
  ] = await Promise.all([
    User.countDocuments(),
    Product.countDocuments({ status: 'approved' }),
    Product.countDocuments({ status: 'pending' }),
    Chat.countDocuments(),
    User.countDocuments({ createdAt: { $gte: today } }),
    Product.countDocuments({ createdAt: { $gte: today }, status: 'approved' }),
    User.countDocuments({ isOnline: true, role: 'user' }),
    Product.aggregate([{ $group: { _id: null, total: { $sum: '$views' } } }]),
    Product.aggregate([{ $match: { status: 'approved' } }, { $group: { _id: null, total: { $sum: '$price' } } }])
  ]);

  const recentUsers = await User.find().sort('-createdAt').limit(5).select('name email role trustScore createdAt');
  const recentProducts = await Product.find({ status: 'approved' }).populate('user', 'name trustScore').sort('-createdAt').limit(5).select('title price status views createdAt');

  return {
    totalUsers: usersCount,
    totalProducts: productsCount,
    pendingProducts,
    totalChats: chatsCount,
    newUsersToday,
    todayProducts,
    activeUsers: activeUsers || 0,
    totalViews: (totalViews[0]?.total || 0),
    revenue: (revenue[0]?.total || 0),
    recentUsers,
    recentProducts,
  };
};

export default { getDashboardStats };

