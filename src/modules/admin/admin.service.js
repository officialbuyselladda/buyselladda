import User from '../user/user.model.js';
import Product from '../product/product.model.js';
import Chat from '../chat/chat.model.js';
import Message from '../chat/message.model.js';
import UserReport from '../user/userReport.model.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
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
  const query = {};
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
    u.emailStatus = u.isEmailVerified ? 'verified' : 'unverified';
  });
  return { users, total, page: pageNum, limit: limitNum, pages: Math.ceil(total / limitNum) };
};

const createVerificationToken = () => crypto.randomBytes(32).toString('hex');
const hashVerificationToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

const getClientUrl = () => (
  process.env.CLIENT_URL
  || process.env.FRONTEND_URL
  || process.env.WEBSITE_URL
  || 'https://buyselladda.com'
).replace(/\/$/, '');

const verifyUserEmail = async (id) => {
  const user = await User.findById(id).select('+emailVerificationToken +emailVerificationExpire');
  if (!user) throw new Error('User not found');
  if (user.role === 'admin') throw new Error('Admin email verification is managed separately');

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpire = undefined;
  await user.save({ validateBeforeSave: false });

  const safeUser = user.toObject();
  delete safeUser.password;
  delete safeUser.emailVerificationToken;
  delete safeUser.emailVerificationExpire;
  safeUser.emailStatus = 'verified';
  return safeUser;
};

const resendUserVerificationEmail = async (id) => {
  const user = await User.findById(id).select('+emailVerificationToken +emailVerificationExpire');
  if (!user) throw new Error('User not found');
  if (user.role === 'admin') throw new Error('Admin accounts do not need public email verification');
  if (user.isEmailVerified) {
    return { user, emailSent: false, alreadyVerified: true };
  }

  const verifyToken = createVerificationToken();
  user.emailVerificationToken = hashVerificationToken(verifyToken);
  user.emailVerificationExpire = Date.now() + 24 * 60 * 60 * 1000;
  await user.save({ validateBeforeSave: false });

  const verifyUrl = `${getClientUrl()}/verify-email/${verifyToken}`;
  await sendEmail(
    user.email,
    'Verify your BuySellAdda email',
    templates.verifyEmail({ name: user.name, verifyUrl }),
  );

  return { user, emailSent: true, alreadyVerified: false };
};

const getLimitWindows = () => {
  const now = new Date();
  const dayStart = new Date(now);
  dayStart.setHours(0, 0, 0, 0);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  return { now, dayStart, monthStart };
};

const getSafeLimits = (limits = {}) => ({
  daily: Number.isFinite(Number(limits.daily)) ? Number(limits.daily) : 5,
  weekendDaily: Number.isFinite(Number(limits.weekendDaily)) ? Number(limits.weekendDaily) : 10,
  monthly: Number.isFinite(Number(limits.monthly)) ? Number(limits.monthly) : 50,
  unlimited: Boolean(limits.unlimited),
});

const addUsageToUsers = async (users) => {
  const { now, dayStart, monthStart } = getLimitWindows();
  const userIds = users.map((user) => user._id);
  const [todayCounts, monthCounts] = await Promise.all([
    Product.aggregate([
      { $match: { user: { $in: userIds }, status: { $ne: 'deleted' }, createdAt: { $gte: dayStart, $lte: now } } },
      { $group: { _id: '$user', count: { $sum: 1 } } },
    ]),
    Product.aggregate([
      { $match: { user: { $in: userIds }, status: { $ne: 'deleted' }, createdAt: { $gte: monthStart, $lte: now } } },
      { $group: { _id: '$user', count: { $sum: 1 } } },
    ]),
  ]);

  const todayMap = {};
  const monthMap = {};
  todayCounts.forEach((item) => { todayMap[item._id.toString()] = item.count; });
  monthCounts.forEach((item) => { monthMap[item._id.toString()] = item.count; });
  const isWeekend = now.getDay() === 0 || now.getDay() === 6;

  return users.map((user) => {
    const limits = getSafeLimits(user.adPostingLimits);
    const activeDailyLimit = isWeekend ? limits.weekendDaily : limits.daily;
    const todayUsed = todayMap[user._id.toString()] || 0;
    const monthUsed = monthMap[user._id.toString()] || 0;
    return {
      ...user,
      adPostingLimits: limits,
      adUsage: {
        today: todayUsed,
        month: monthUsed,
        activeDailyLimit,
        isWeekend,
        dailyRemaining: limits.unlimited ? null : Math.max(activeDailyLimit - todayUsed, 0),
        monthlyRemaining: limits.unlimited ? null : Math.max(limits.monthly - monthUsed, 0),
      },
      status: user.isBlocked ? 'blocked' : 'active',
    };
  });
};

const listUserLimits = async ({ page = 1, limit = 10, role = 'user', search, status }) => {
  const pageNum = parseInt(page) || 1;
  const limitNum = Math.min(parseInt(limit) || 10, 100);
  const skip = (pageNum - 1) * limitNum;
  const query = {};
  if (role && role !== 'all') query.role = role;
  if (status && status !== 'all') query.isBlocked = status === 'blocked';
  if (search && search.trim()) {
    query.$or = [
      { name: { $regex: search.trim(), $options: 'i' } },
      { email: { $regex: search.trim(), $options: 'i' } },
    ];
  }

  const [users, total] = await Promise.all([
    User.find(query)
      .select('name email role isBlocked adPostingLimits createdAt')
      .sort('-createdAt')
      .skip(skip)
      .limit(limitNum)
      .lean(),
    User.countDocuments(query),
  ]);

  const usersWithUsage = await addUsageToUsers(users);
  return { users: usersWithUsage, total, page: pageNum, limit: limitNum, pages: Math.ceil(total / limitNum) };
};

const updateUserAdLimits = async (id, limits) => {
  const user = await User.findById(id).select('-password');
  if (!user) throw new Error('User not found');

  user.adPostingLimits = getSafeLimits(limits);
  await user.save();
  const [userWithUsage] = await addUsageToUsers([user.toObject()]);
  return userWithUsage;
};

const bulkUpdateUserAdLimits = async ({ role = 'user', ...limits }) => {
  const query = {};
  if (role && role !== 'all') query.role = role;
  const adPostingLimits = getSafeLimits(limits);
  const result = await User.updateMany(query, { $set: { adPostingLimits } });
  return {
    matched: result.matchedCount || 0,
    modified: result.modifiedCount || 0,
    adPostingLimits,
  };
};

const normalizeAdminPermissions = (permissions = []) => {
  const unique = [...new Set(permissions.filter(Boolean))];
  return unique.includes('all') ? ['all'] : unique;
};

const listAdminRoleAccounts = async ({ page = 1, limit = 10, search, status }) => {
  const pageNum = parseInt(page) || 1;
  const limitNum = Math.min(parseInt(limit) || 10, 100);
  const skip = (pageNum - 1) * limitNum;
  const query = { role: 'admin' };
  if (status && status !== 'all') query.isBlocked = status === 'blocked';
  if (search && search.trim()) {
    query.$or = [
      { name: { $regex: search.trim(), $options: 'i' } },
      { email: { $regex: search.trim(), $options: 'i' } },
    ];
  }

  const [admins, total] = await Promise.all([
    User.find(query)
      .select('name email phone role isBlocked adminPermissions createdAt lastSeen')
      .sort('-createdAt')
      .skip(skip)
      .limit(limitNum)
      .lean(),
    User.countDocuments(query),
  ]);

  return {
    admins: admins.map((item) => ({
      ...item,
      adminPermissions: normalizeAdminPermissions(item.adminPermissions || []),
      accessType: !item.adminPermissions?.length || item.adminPermissions?.includes('all') ? 'Full Access' : 'Limited Access',
      status: item.isBlocked ? 'blocked' : 'active',
    })),
    total,
    page: pageNum,
    limit: limitNum,
    pages: Math.ceil(total / limitNum),
  };
};

const createAdminRoleAccount = async (payload) => {
  const existingUser = await User.findOne({ email: payload.email });
  if (existingUser) {
    const error = new Error('This email is already registered');
    error.statusCode = 409;
    throw error;
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(payload.password, salt);
  const adminUser = await User.create({
    name: payload.name,
    email: payload.email,
    password: hashedPassword,
    phone: payload.phone || '',
    role: 'admin',
    isEmailVerified: true,
    isBlocked: Boolean(payload.isBlocked),
    adminPermissions: normalizeAdminPermissions(payload.adminPermissions),
  });

  const safeUser = adminUser.toObject();
  delete safeUser.password;
  return safeUser;
};

const updateAdminRoleAccount = async (id, payload) => {
  const adminUser = await User.findOne({ _id: id, role: 'admin' }).select('+password');
  if (!adminUser) throw new Error('Admin account not found');

  if (payload.email && payload.email !== adminUser.email) {
    const existingUser = await User.findOne({ email: payload.email, _id: { $ne: id } });
    if (existingUser) {
      const error = new Error('This email is already registered');
      error.statusCode = 409;
      throw error;
    }
  }

  ['name', 'email', 'phone', 'isBlocked'].forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(payload, key)) {
      adminUser[key] = payload[key];
    }
  });

  if (Array.isArray(payload.adminPermissions)) {
    adminUser.adminPermissions = normalizeAdminPermissions(payload.adminPermissions);
  }

  if (payload.password && payload.password.trim()) {
    const salt = await bcrypt.genSalt(10);
    adminUser.password = await bcrypt.hash(payload.password, salt);
  }

  await adminUser.save();
  const safeUser = adminUser.toObject();
  delete safeUser.password;
  return safeUser;
};

const deleteAdminRoleAccount = async (id, currentAdminId) => {
  if (String(id) === String(currentAdminId)) {
    const error = new Error('You cannot delete your own admin account');
    error.statusCode = 400;
    throw error;
  }

  const adminUser = await User.findOne({ _id: id, role: 'admin' });
  if (!adminUser) throw new Error('Admin account not found');
  await adminUser.deleteOne();
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

const listChats = async ({ page = 1, limit = 10, search }) => {
  const pageNum = parseInt(page) || 1;
  const limitNum = Math.min(parseInt(limit) || 10, 100);
  const skip = (pageNum - 1) * limitNum;

  const chats = await Chat.find()
    .populate('participants', 'name email avatar')
    .populate('product', 'title price images status')
    .populate({
      path: 'lastMessage',
      select: 'text image read createdAt sender',
      populate: { path: 'sender', select: 'name email' },
    })
    .sort('-updatedAt')
    .lean();

  const term = String(search || '').trim().toLowerCase();
  const filtered = term
    ? chats.filter((chat) => {
        const haystack = [
          chat.product?.title,
          chat.lastMessage?.text,
          ...(chat.participants || []).map((participant) => `${participant.name} ${participant.email}`),
        ].filter(Boolean).join(' ').toLowerCase();
        return haystack.includes(term);
      })
    : chats;

  const pageChats = filtered.slice(skip, skip + limitNum);
  const unreadCounts = await Message.aggregate([
    { $match: { chat: { $in: pageChats.map((chat) => chat._id) }, read: false } },
    { $group: { _id: '$chat', count: { $sum: 1 } } },
  ]);
  const unreadMap = {};
  unreadCounts.forEach((item) => { unreadMap[item._id.toString()] = item.count; });

  return {
    chats: pageChats.map((chat) => ({
      ...chat,
      unread: unreadMap[chat._id.toString()] || 0,
      title: chat.product?.title || 'Direct conversation',
      status: chat.product?.status === 'rejected' ? 'flagged' : 'active',
    })),
    total: filtered.length,
    page: pageNum,
    limit: limitNum,
    pages: Math.ceil(filtered.length / limitNum),
  };
};

const deleteChat = async (id) => {
  const chat = await Chat.findById(id);
  if (!chat) throw new Error('Chat not found');
  await Message.deleteMany({ chat: id });
  await chat.deleteOne();
};

const getReports = async ({ page = 1, limit = 10, status = 'all', search }) => {
  const productQuery = { status: { $in: ['pending', 'suspicious', 'rejected'] } };
  if (status && status !== 'all') productQuery.status = status;
  if (search && search.trim()) {
    productQuery.$or = [
      { title: { $regex: search.trim(), $options: 'i' } },
      { description: { $regex: search.trim(), $options: 'i' } },
    ];
  }

  const pageNum = parseInt(page) || 1;
  const limitNum = Math.min(parseInt(limit) || 10, 100);
  const skip = (pageNum - 1) * limitNum;
  const [products, total] = await Promise.all([
    Product.find(productQuery).populate('user', 'name email trustScore').sort('-createdAt').skip(skip).limit(limitNum).lean(),
    Product.countDocuments(productQuery),
  ]);

  return {
    reports: products.map((product) => ({
      id: product._id,
      productId: product._id,
      type: 'product',
      title: product.title,
      reporter: 'System moderation',
      status: product.status,
      date: product.createdAt,
      details: product.status === 'pending'
        ? 'Awaiting admin approval before it can appear publicly.'
        : 'Needs admin review.',
      user: product.user,
    })),
    total,
    page: pageNum,
    limit: limitNum,
    pages: Math.ceil(total / limitNum),
  };
};

const escapeCsv = (value = '') => {
  const text = String(value ?? '');
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

const getReportsExport = async (query = {}, format = 'csv') => {
  const result = await getReports({ ...query, page: 1, limit: 10000 });
  const rows = result.reports.map((report) => ({
    id: report.productId,
    title: report.title,
    seller: report.user?.email || 'Unknown',
    status: report.status,
    date: report.date ? new Date(report.date).toISOString() : '',
    details: report.details,
  }));

  if (format === 'pdf') {
    const lines = [
      'BuySellAdda Reports',
      `Generated: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`,
      '',
      ...rows.map((row, index) => `${index + 1}. ${row.title} | ${row.seller} | ${row.status} | ${row.date}`),
    ];
    const content = lines
      .join('\n')
      .replace(/\\/g, '\\\\')
      .replace(/\(/g, '\\(')
      .replace(/\)/g, '\\)');
    const stream = `BT /F1 12 Tf 40 790 Td 14 TL (${content}) Tj ET`;
    const objects = [
      '1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj',
      '2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj',
      '3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj',
      '4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj',
      `5 0 obj << /Length ${Buffer.byteLength(stream)} >> stream\n${stream}\nendstream endobj`,
    ];
    const body = objects.join('\n');
    return Buffer.from(`%PDF-1.4\n${body}\ntrailer << /Root 1 0 R >>\n%%EOF`);
  }

  const header = ['ID', 'Title', 'Seller', 'Status', 'Date', 'Details'];
  const csv = [
    header.join(','),
    ...rows.map((row) => [row.id, row.title, row.seller, row.status, row.date, row.details].map(escapeCsv).join(',')),
  ].join('\n');
  return csv;
};

const getModerationQueue = async (query = {}) => {
  const { page = 1, limit = 10, status = 'all', search = '', type = 'all' } = query;
  const pageNum = parseInt(page) || 1;
  const limitNum = Math.min(parseInt(limit) || 10, 100);
  const skip = (pageNum - 1) * limitNum;

  const getUserReports = async () => {
    const reportQuery = {};
    if (status && status !== 'all') reportQuery.status = status;
    if (search && search.trim()) {
      reportQuery.$or = [
        { reason: { $regex: search.trim(), $options: 'i' } },
        { details: { $regex: search.trim(), $options: 'i' } },
      ];
    }
    const [reports, total] = await Promise.all([
      UserReport.find(reportQuery)
        .populate('reporter', 'name email')
        .populate('reportedUser', 'name email isBlocked')
        .populate('chat', 'product updatedAt')
        .sort('-createdAt')
        .skip(skip)
        .limit(limitNum)
        .lean(),
      UserReport.countDocuments(reportQuery),
    ]);

    return {
      items: reports.map((report) => ({
        id: report._id,
        type: 'user',
        reason: report.reason,
        details: report.details,
        status: report.status,
        date: report.createdAt,
        user: report.reportedUser || { name: 'Unknown', email: 'Unknown' },
        reporter: report.reporter,
      })),
      total,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum),
    };
  };

  if (type === 'user') {
    return getUserReports();
  }

  const result = await getReports({ page, limit, status, search });
  const productItems = {
    items: result.reports.map((report) => ({
      ...report,
      reason: report.details,
      user: report.user || { name: 'Unknown', email: 'Unknown' },
    })),
    total: result.total,
    page: result.page,
    limit: result.limit,
    pages: result.pages,
  };

  if (type === 'product') return productItems;

  const userItems = await getUserReports();
  const mergedItems = [...userItems.items, ...productItems.items]
    .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
    .slice(0, limitNum);

  return {
    items: mergedItems,
    total: userItems.total + productItems.total,
    page: pageNum,
    limit: limitNum,
    pages: Math.ceil((userItems.total + productItems.total) / limitNum),
  };
};

const getAnalytics = async () => {
  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  const [statusCounts, monthlyProducts, monthlyUsers, totals] = await Promise.all([
    Product.aggregate([{ $group: { _id: '$status', value: { $sum: 1 } } }]),
    Product.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, products: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),
    User.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo }, role: 'user' } },
      { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, users: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),
    Promise.all([
      User.countDocuments({ role: 'user' }),
      Product.countDocuments({ status: 'approved' }),
      Product.countDocuments({ status: 'pending' }),
      Chat.countDocuments(),
      Product.aggregate([{ $group: { _id: null, views: { $sum: '$views' }, value: { $sum: '$price' } } }]),
    ]),
  ]);

  const monthLabel = (entry) => new Date(entry._id.year, entry._id.month - 1, 1).toLocaleString('en-US', { month: 'short' });
  const growthMap = {};
  monthlyProducts.forEach((entry) => {
    growthMap[`${entry._id.year}-${entry._id.month}`] = { month: monthLabel(entry), products: entry.products, users: 0 };
  });
  monthlyUsers.forEach((entry) => {
    const key = `${entry._id.year}-${entry._id.month}`;
    growthMap[key] = { month: monthLabel(entry), products: growthMap[key]?.products || 0, users: entry.users };
  });

  return {
    totals: {
      users: totals[0],
      activeListings: totals[1],
      pendingProducts: totals[2],
      chats: totals[3],
      views: totals[4][0]?.views || 0,
      listingValue: totals[4][0]?.value || 0,
    },
    statusData: statusCounts.map((item) => ({ name: item._id || 'unknown', value: item.value })),
    growthData: Object.values(growthMap),
  };
};

const updateUser = async (id, updateData) => {
  const allowed = {};
  ['name', 'email', 'phone', 'role', 'isBlocked'].forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(updateData, key)) {
      allowed[key] = updateData[key];
    }
  });

  const user = await User.findById(id);
  if (!user || user.role === 'admin') {
    throw new Error('User not found or admin cannot be edited here');
  }

  Object.assign(user, allowed);
  await user.save();
  const safeUser = user.toObject();
  delete safeUser.password;
  return safeUser;
};

const getUserDetail = async (id) => {
  const user = await User.findById(id).select('-password').lean();
  if (!user) throw new Error('User not found');
  const products = await Product.find({ user: id, status: { $ne: 'deleted' } })
    .select('title price status category createdAt images')
    .sort('-createdAt')
    .limit(12)
    .lean();
  user.products = products;
  user.productCount = user.products ? user.products.length : 0;
  user.status = user.isBlocked ? 'blocked' : 'active';
  user.emailStatus = user.isEmailVerified ? 'verified' : 'unverified';
  return user;
};

const createUser = async (userData) => {
  const existingUser = await User.findOne({ email: userData.email });
  if (existingUser) {
    const error = new Error('This email is already registered');
    error.statusCode = 409;
    throw error;
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(userData.password, salt);
  const user = await User.create({
    name: userData.name,
    email: userData.email,
    password: hashedPassword,
    phone: userData.phone || '',
    location: userData.location || '',
    role: userData.role || 'user',
    isEmailVerified: true,
    isBlocked: Boolean(userData.isBlocked),
  });

  const safeUser = user.toObject();
  delete safeUser.password;
  safeUser.productCount = 0;
  safeUser.status = safeUser.isBlocked ? 'blocked' : 'active';
  return safeUser;
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
  product.approvedAt = new Date();
  product.approvalSource = 'manual';
  await product.save();
  await User.findByIdAndUpdate(product.user, { $inc: { trustScore: 1 } });
  const user = await User.findById(product.user);
  if (user?.email) {
    try {
      await sendEmail(user.email, 'Your Ad Approved!', templates.adApproved(product.title));
    } catch (error) {
      console.warn('Approval email failed:', error.message);
    }
  }
};

const rejectProduct = async (id) => {
  const product = await Product.findById(id);
  if (!product) throw new Error('Product not found');
  product.status = 'rejected';
  product.approvedAt = null;
  product.approvalSource = null;
  await product.save();
  await User.findByIdAndUpdate(product.user, { $inc: { trustScore: -1 } });
  const user = await User.findById(product.user);
  if (user?.email) {
    try {
      await sendEmail(user.email, 'Your Ad Rejected', templates.adRejected(product.title, 'Admin review'));
    } catch (error) {
      console.warn('Rejection email failed:', error.message);
    }
  }
};

export default { 
  deleteUser, 
  deleteProduct, 
  approveProduct, 
  rejectProduct, 
  listProducts, 
  listUsers, 
  listUserLimits,
  createUser,
  getUserDetail,
  toggleUserBlock,
  updateUser,
  verifyUserEmail,
  resendUserVerificationEmail,
  updateUserAdLimits,
  bulkUpdateUserAdLimits,
  listAdminRoleAccounts,
  createAdminRoleAccount,
  updateAdminRoleAccount,
  deleteAdminRoleAccount,
  listChats,
  deleteChat,
  getReports,
  getReportsExport,
  getModerationQueue,
  getAnalytics
};

