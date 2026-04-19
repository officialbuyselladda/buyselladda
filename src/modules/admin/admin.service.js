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
  if (status) query.status = status;
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
  return { products, total, page, limit, pages: Math.ceil(total / limit) };
};

const listUsers = async ({ page = 1, limit = 10, role, search }) => {
  const pageNum = parseInt(page) || 1;
  const limitNum = Math.min(parseInt(limit) || 10, 100);
  const skip = (pageNum - 1) * limitNum;
  const query = {};
  if (role && role !== 'all') query.role = role;
  if (search && search.trim()) {
    query.$or = [
      { name: { $regex: search.trim(), $options: 'i' } },
      { email: { $regex: search.trim(), $options: 'i' } }
    ];
  }
  const [users, total] = await Promise.all([
    User.find(query).select('-password').sort('-createdAt').skip(skip).limit(limit).lean(),
    User.countDocuments(query)
  ]);
  return { users, total, page, limit, pages: Math.ceil(total / limit) };
};

const getUserDetail = async (id) => {
  const user = await User.findById(id).populate('products').select('-password').lean();
  if (!user) throw new Error('User not found');
  return user;
};

const approveProduct = async (id) => {
  const product = await Product.findById(id);
  if (!product || product.status !== 'pending') {
    throw new Error('Product not pending');
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

