import User from '../user/user.model.js';
import Product from '../product/product.model.js';
import templates from '../../utils/emailTemplates.js';
import sendEmail from '../../config/email.js';

const deleteUser = async (id) => {
  const user = await User.findById(id);
  if (!user || user.role === 'admin') {
    throw new Error('User not found or admin cannot be deleted');
  }
  await User.findByIdAndDelete(id);
};

const deleteProduct = async (id) => {
  const product = await Product.findById(id);
  if (!product) throw new Error('Product not found');
  product.status = 'deleted';
  await product.save();
};

const listProducts = async ({ page = 1, limit = 10, status, search }) => {
  const skip = (page - 1) * limit;
  const query = { status: { $ne: 'deleted' } };
  // Fix: Only apply status filter if status is a valid value (not 'all')
  if (status && status !== 'all') query.status = status;
  if (search && search.trim()) {
    query.$or = [
      { title: { $regex: search.trim(), $options: 'i' } },
      { description: { $regex: search.trim(), $options: 'i' } }
    ];
  }
  const [products, total] = await Promise.all([
    Product.find(query).populate('user', 'name email trustScore').sort('-createdAt').skip(skip).limit(limit).lean(),
    Product.countDocuments(query)
  ]);
  
  // Add sellerName and sellerEmail fields for frontend compatibility
  const productsWithSeller = products.map(product => ({
    ...product,
    sellerName: product.user?.name || 'Unknown',
    sellerEmail: product.user?.email || 'Unknown'
  }));
  
  return { products: productsWithSeller, total, page, limit, pages: Math.ceil(total / limit) };
};

const listUsers = async ({ page = 1, limit = 10, role, search, status }) => {
  const pageNum = parseInt(page) || 1;
  const limitNum = Math.min(parseInt(limit) || 10, 100);
  const skip = (pageNum - 1) * limitNum;
  const query = { role: { $ne: 'admin' } };
  if (role && role !== 'all') query.role = role;
  if (status && status !== 'all') query.isBlocked = status === 'blocked';
  if (search && search.trim()) {
    query.$or = [
      { name: { $regex: search.trim(), $options: 'i' } },
      { email: { $regex: search.trim(), $options: 'i' } }
    ];
  }
  // Get users without populate - we'll count products separately
  const [users, total] = await Promise.all([
    User.find(query).select('-password').sort('-createdAt').skip(skip).limit(limitNum).lean(),
    User.countDocuments(query)
  ]);
  
  // Get product counts for all users
  const Product = (await import('../product/product.model.js')).default;
  const userIds = users.map(u => u._id);
  const productCounts = await Product.aggregate([
    { $match: { user: { $in: userIds }, status: { $ne: 'deleted' } } },
    { $group: { _id: '$user', count: { $sum: 1 } } }
  ]);
  
  const countMap = {};
  productCounts.forEach(p => { countMap[p._id.toString()] = p.count; });
  
  users.forEach(u => {
    u.productCount = countMap[u._id.toString()] || 0;
    u.status = u.isBlocked ? 'blocked' : 'active';
  });
  return { users, total, page: pageNum, limit: limitNum, pages: Math.ceil(total / limitNum) };
};

const toggleUserBlock = async (id) => {
  const user = await User.findById(id);
  if (!user || user.role === 'admin') {
    throw new Error('Cannot block admin');
  }
  user.isBlocked = !user.isBlocked;
  await user.save();
  const action = user.isBlocked ? 'blocked' : 'unblocked';
  // TODO: sendEmail
  return user;
};

const getUserDetail = async (id) => {
  const user = await User.findById(id).populate('products').select('-password').lean();
  if (!user) throw new Error('User not found');
  user.productCount = user.products ? user.products.length : 0;
  user.status = user.isBlocked ? 'blocked' : 'active';
  return user;
};

const approveProduct = async (id) => {
  const product = await Product.findById(id);
  if (!product) {
    throw new Error('Product not found');
  }
  // Allow approval of any non-approved product (pending, suspicious, etc.)
  if (product.status === 'approved') {
    throw new Error('Product already approved');
  }
  if (product.status === 'deleted') {
    throw new Error('Product was deleted');
  }
  product.status = 'approved';
  await product.save();
  await User.findByIdAndUpdate(product.user, { $inc: { trustScore: 1 } });
  const user = await User.findById(product.user);
  await sendEmail(user.email, 'Your Ad Approved!', templates.adApproved(product.title));
};

const rejectProduct = async (id) => {
  const product = await Product.findById(id);
  if (!product) throw new Error('Product not found');
  product.status = 'rejected';
  await product.save();
  await User.findByIdAndUpdate(product.user, { $inc: { trustScore: -1 } });
  const user = await User.findById(product.user);
  await sendEmail(user.email, 'Your Ad Rejected', templates.adRejected(product.title, 'Admin review'));
};

export default { 
  deleteUser, 
  deleteProduct, 
  approveProduct, 
  rejectProduct, 
  listProducts, 
  listUsers, 
  getUserDetail 
};

