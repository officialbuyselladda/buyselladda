import User from '../user/user.model.js';
import Product from '../product/product.model.js';

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

const approveProduct = async (id) => {
  const product = await Product.findById(id);
  if (!product || product.status !== 'pending') {
    throw new Error('Product not pending');
  }
  product.status = 'approved';
  await product.save();
await User.findByIdAndUpdate(product.user, { $inc: { trustScore: 1 } });
  // Send approved email
  await sendEmail((await User.findById(product.user)).email, 'Your Ad Approved!', templates.adApproved(product.title));
};

const rejectProduct = async (id) => {
  const product = await Product.findById(id);
  if (!product) throw new Error('Product not found');
  product.status = 'rejected';
  await product.save();
await User.findByIdAndUpdate(product.user, { $inc: { trustScore: -1 } });
  // Send rejected email
  await sendEmail((await User.findById(product.user)).email, 'Your Ad Rejected', templates.adRejected(product.title, 'Admin review'));
};

export default { deleteUser, deleteProduct, approveProduct, rejectProduct };

