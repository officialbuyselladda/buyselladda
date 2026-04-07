import Product from './product.model.js';
import User from '../user/user.model.js';

const bannedWords = ['spam', 'scam', 'free', 'hack', 'viagra']; // Add more

const createProduct = async (productData) => {
  const user = await User.findById(productData.user).select('trustScore');
  if (!user) throw new Error('User not found');

  const recentPosts = await Product.countDocuments({
    user: productData.user,
    createdAt: { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
  });

  // Banned words check
  const hasBanned = bannedWords.some(word => 
    productData.title.toLowerCase().includes(word) || productData.description.toLowerCase().includes(word)
  );

  // Price check
  const isSuspiciousPrice = productData.price < 10 || productData.price > 1000000;

  let status = 'pending';
  if (user.trustScore > 5) {
    status = 'approved';
  } else if (hasBanned || isSuspiciousPrice || recentPosts > 3) {
    status = 'rejected';
    await User.findByIdAndUpdate(user._id, { $inc: { trustScore: -1 } });
  } else if (recentPosts > 2) {
    status = 'suspicious';
  }

  const product = await Product.create({ ...productData, status });
  
  // Send notification email
  let subject, html;
  if (status === 'approved') {
    subject = 'Ad Approved!';
    html = templates.adApproved(productData.title);
  } else if (status === 'rejected') {
    subject = 'Ad Rejected';
    html = templates.adRejected(productData.title, 'Spam/banned words/price issue');
  } else if (status === 'suspicious') {
    subject = 'Ad Under Review';
    html = templates.adSuspicious(productData.title);
  }
  if (html) {
    await sendEmail(user.email, subject, html);
  }
  
  return product.populate('user', 'name avatar');
};

const getProducts = async (query) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;
  const skip = (page - 1) * limit;

  const filter = { status: 'approved' };
  if (query.category) filter.category = query.category;
  if (query.location) filter.location = { $regex: query.location, $options: 'i' };
  if (query.search) filter.$or = [
    { title: { $regex: query.search, $options: 'i' } },
    { description: { $regex: query.search, $options: 'i' } },
  ];

  const products = await Product.find(filter)
    .populate('user', 'name avatar')
    .sort('-createdAt')
    .skip(skip)
    .limit(limit);

  const total = await Product.countDocuments(filter);

  return {
    products,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

const getProduct = async (id) => {
  const product = await Product.findById(id).populate('user', 'name avatar');
  if (!product || product.status !== 'approved') throw new Error('Product not found or not approved');
  product.views += 1;
  await product.save();
  return product;
};

const updateProduct = async (id, updateData, userId) => {
  const product = await Product.findOne({ _id: id, user: userId });
  if (!product) throw new Error('Product not found');
  Object.assign(product, updateData);
  await product.save();
  return product.populate('user', 'name avatar');
};

const deleteProduct = async (id, userId) => {
  const product = await Product.findOneAndDelete({ _id: id, user: userId });
  if (!product) throw new Error('Product not found');
};

export default { createProduct, getProducts, getProduct, updateProduct, deleteProduct };

