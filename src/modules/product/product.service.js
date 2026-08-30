import mongoose from 'mongoose';
import Product from './product.model.js';
import User from '../user/user.model.js';
import Category from '../category/category.model.js';
import templates from '../../utils/emailTemplates.js';
import sendEmail from '../../config/email.js';
import appConfigService from '../appConfig/appConfig.service.js';

// DSA Helpers - TF-IDF + Cosine Similarity for Recommendations
export const computeTFIDF = (text) => {
  const words = (text || '').toLowerCase().match(/\\w{2,}/g) || [];
  const wordCount = words.length;
  if (wordCount === 0) return [];
  const termFreq = {};
  words.forEach(word => {
    termFreq[word] = (termFreq[word] || 0) + 1;
  });
  const maxTF = Math.max(...Object.values(termFreq));
  const vector = [];
  Object.entries(termFreq).forEach(([term, freq]) => {
    const tf = freq / maxTF;
    const idf = Math.log(1000 / 1); // Mock IDF assuming ~1000 docs
    const tfidf = tf * idf;
    if (tfidf > 0.1) vector.push({term, tfidf});
  });
  return vector.sort((a, b) => b.tfidf - a.tfidf).slice(0, 10);
};

export const cosineSimilarity = (vecA, vecB) => {
  const termsA = new Set(vecA.map(v => v.term));
  const termsB = new Set(vecB.map(v => v.term));
  const shared = [...termsA].filter(t => termsB.has(t));
  let dot = 0, normA = 0, normB = 0;
  shared.forEach(term => {
    const a = vecA.find(v => v.term === term).tfidf;
    const b = vecB.find(v => v.term === term).tfidf;
    dot += a * b;
    normA += a * a;
    normB += b * b;
  });
  const norm = Math.sqrt(normA) * Math.sqrt(normB);
  return norm === 0 ? 0 : dot / norm;
};

const bannedWords = ['spam', 'scam', 'free', 'hack', 'viagra']; // Add more
const FALLBACK_CATEGORIES = [
  'Stationary',
  'Electronics',
  'Jobs',
  'Clothes',
  'Room',
  'Flat,Building',
  'Cars',
  'Motorcycle',
  'For Sale: Houses & Apartments',
  'For Rent: Houses & Apartments',
  'Vehicles',
  'Property',
  'Jobs',
  'Services',
  'Others',
];

const slugify = (value = '') => String(value)
  .toLowerCase()
  .trim()
  .replace(/[^a-z0-9\s-]/g, '')
  .replace(/\s+/g, '-')
  .replace(/-+/g, '-');

const normalizeCategory = async (category, { requireActive = false } = {}) => {
  const raw = String(category || '').trim();
  if (!raw) return null;

  const normalizedSlug = slugify(raw);
  const query = {
    $or: [
      { slug: normalizedSlug },
      { name: { $regex: `^${raw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' } },
    ],
  };
  if (requireActive) query.isActive = true;

  const dbCategory = await Category.findOne(query).select('name isActive').lean();
  if (dbCategory) return dbCategory.name;

  const fallback = FALLBACK_CATEGORIES.find((cat) => slugify(cat) === normalizedSlug || cat.toLowerCase() === raw.toLowerCase());
  if (fallback) return fallback;
  return requireActive ? null : raw;
};

const isImageSetSafe = (images = []) => {
  if (!Array.isArray(images) || images.length === 0) return false;
  return images.every((img) => {
    const hasValidUrl = typeof img?.url === 'string' && img.url.trim().length > 0;
    const hasValidPublicId = typeof img?.public_id === 'string' && img.public_id.trim().length > 0;
    return hasValidUrl || hasValidPublicId;
  });
};

const getSafeAdPostingLimits = (limits = {}) => ({
  daily: Number.isFinite(Number(limits.daily)) ? Number(limits.daily) : 5,
  weekendDaily: Number.isFinite(Number(limits.weekendDaily)) ? Number(limits.weekendDaily) : 10,
  monthly: Number.isFinite(Number(limits.monthly)) ? Number(limits.monthly) : 50,
  unlimited: Boolean(limits.unlimited),
});

const getMonthlyLimitForUser = async (user, limits) => {
  const config = await appConfigService.getAppConfig().catch(() => null);
  if (user.userType === 'dealer' || user.subscriptionGroup === 'dealer') {
    return Number(config?.controls?.dealerMonthlyPostLimit) || limits.monthly;
  }
  if (user.subscriptionGroup === 'free') {
    return Number(config?.controls?.freeMonthlyPostLimit) || limits.monthly;
  }
  return limits.monthly;
};

const assertUserCanPostAd = async (user) => {
  const limits = getSafeAdPostingLimits(user.adPostingLimits);
  if (limits.unlimited || user.role === 'admin') return;

  const now = new Date();
  const dayStart = new Date(now);
  dayStart.setHours(0, 0, 0, 0);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const isWeekend = now.getDay() === 0 || now.getDay() === 6;
  const activeDailyLimit = isWeekend ? limits.weekendDaily : limits.daily;

  const monthlyLimit = await getMonthlyLimitForUser(user, limits);
  const [todayCount, monthCount] = await Promise.all([
    Product.countDocuments({
      user: user._id,
      status: { $ne: 'deleted' },
      createdAt: { $gte: dayStart, $lte: now },
    }),
    Product.countDocuments({
      user: user._id,
      status: { $ne: 'deleted' },
      createdAt: { $gte: monthStart, $lte: now },
    }),
  ]);

  if (todayCount >= activeDailyLimit) {
    const error = new Error(`Daily ad posting limit reached. You can post ${activeDailyLimit} ads today.`);
    error.statusCode = 429;
    throw error;
  }

  if (monthCount >= monthlyLimit) {
    const error = new Error(`Monthly ad posting limit reached. Free users can post ${monthlyLimit} ads per month. Please wait until next month or continue with a subscription to post more ads.`);
    error.statusCode = 429;
    throw error;
  }
};

export const getPostingEligibility = async (userId) => {
  const user = await User.findById(userId).select('role userType subscriptionGroup adPostingLimits');
  if (!user) throw new Error('User not found');
  const limits = getSafeAdPostingLimits(user.adPostingLimits);
  const monthlyLimit = await getMonthlyLimitForUser(user, limits);
  const now = new Date();
  const dayStart = new Date(now);
  dayStart.setHours(0, 0, 0, 0);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const dailyLimit = now.getDay() === 0 || now.getDay() === 6 ? limits.weekendDaily : limits.daily;
  const [dailyUsed, monthlyUsed] = await Promise.all([
    Product.countDocuments({ user: user._id, status: { $ne: 'deleted' }, createdAt: { $gte: dayStart } }),
    Product.countDocuments({ user: user._id, status: { $ne: 'deleted' }, createdAt: { $gte: monthStart } }),
  ]);
  const unlimited = limits.unlimited || user.role === 'admin';
  return {
    canPost: unlimited || (dailyUsed < dailyLimit && monthlyUsed < monthlyLimit),
    userType: user.userType,
    subscriptionGroup: user.subscriptionGroup,
    unlimited,
    daily: { used: dailyUsed, limit: dailyLimit, remaining: unlimited ? null : Math.max(0, dailyLimit - dailyUsed) },
    monthly: { used: monthlyUsed, limit: monthlyLimit, remaining: unlimited ? null : Math.max(0, monthlyLimit - monthlyUsed), resetsAt: nextMonth },
  };
};

export const boostProduct = async (id, userId, durationDays = 7) => {
  const user = await User.findById(userId).select('subscriptionGroup userType');
  if (!user) throw new Error('User not found');
  if (!['premium', 'dealer'].includes(user.subscriptionGroup) && user.userType !== 'dealer') {
    const error = new Error('A Premium or Dealer subscription is required to promote an ad.');
    error.statusCode = 403;
    throw error;
  }
  const product = await Product.findOne({ _id: id, user: userId, status: 'approved' });
  if (!product) throw new Error('Only your approved ads can be promoted');
  product.isBoosted = true;
  product.boostedUntil = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);
  await product.save();
  return product;
};

// Generate unique slug from title + timestamp + random to prevent duplicates
const generateSlug = (title) => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  const slugBase = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .substring(0, 50); // Limit length
  return `${slugBase}-${timestamp}-${random}`;
};

export const createProduct = async (productData) => {
  const user = await User.findById(productData.user).select('trustScore email role userType subscriptionGroup adPostingLimits');
  if (!user) throw new Error('User not found');
  await assertUserCanPostAd(user);

  const categoryName = await normalizeCategory(productData.category, { requireActive: true });
  if (!categoryName) throw new Error('Please choose a valid active category');
  productData.category = categoryName;
  if (productData.subCategory) {
    const subCategoryName = await normalizeCategory(productData.subCategory, { requireActive: true });
    if (!subCategoryName) throw new Error('Please choose a valid active sub category');
    productData.subCategory = subCategoryName;
    const [parentCategory, childCategory] = await Promise.all([
      Category.findOne({ name: categoryName, isActive: true }).select('_id').lean(),
      Category.findOne({ name: subCategoryName, isActive: true }).select('parent').lean(),
    ]);
    if (parentCategory && childCategory?.parent && childCategory.parent.toString() !== parentCategory._id.toString()) {
      const error = new Error('Please choose a sub category that belongs to the selected main category');
      error.statusCode = 400;
      throw error;
    }
  }

  // Banned words check
  const hasBanned = bannedWords.some(word =>
    productData.title.toLowerCase().includes(word) || productData.description.toLowerCase().includes(word)
  );

  // Price check
  const isValidPriceRange = productData.price >= 10 && productData.price <= 1000000;

  // Image safety check (basic structural safety check)
  const imageSafe = isImageSetSafe(productData.images);

  // Score-based moderation
  let score = 0;
  if (user.trustScore > 5) score += 2;
  if (!hasBanned) score += 2;
  if (isValidPriceRange) score += 2;
  if (imageSafe) score += 2;

// All products go to pending - admin approval required before showing on website
  const config = await appConfigService.getAppConfig().catch(() => null);
  const status = config?.controls?.autoApproveAds === true && user.trustScore > 5 && score >= 6 ? 'approved' : 'pending';

  // Auto-geocode location if no coordinates
  console.log('Attempting to geocode location:', productData.location);
  const geocodeService = (await import('../geocode/geocode.service.js')).default;
  if (productData.location && (!productData.locationCoords || !productData.locationCoords.coordinates || productData.locationCoords.coordinates.length === 0)) {
    const coordinates = await geocodeService.forwardGeocode(productData.location);
    console.log('Geocoded coordinates:', coordinates);
    if (coordinates && coordinates.length === 2) {
      productData.locationCoords = {
        type: 'Point',
        coordinates
      };
      console.log('Set locationCoords:', productData.locationCoords);
    } else {
      // Fallback - set dummy coords to avoid Mongo error
      productData.locationCoords = {
        type: 'Point',
        coordinates: [77.39, 28.58] // Noida default
      };
      console.log('Using fallback coords for Noida');
    }
  } else {
    console.log('locationCoords already present:', productData.locationCoords);
  }

// Compute DSA search vector
  const contentText = `${productData.title} ${productData.description}`.toLowerCase();
  const searchVector = computeTFIDF(contentText);

  // Removed contentHash and duplicate check to allow posting without duplicate errors

// Generate unique slug to prevent duplicate key errors
  const slug = generateSlug(productData.title);
  const contentHash = `${productData.user}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;

  const product = await Product.create({ ...productData, status, searchVector, slug, contentHash });
  
  // Send notification email
  let subject, html;
  if (status === 'approved') {
    subject = 'Ad Approved!';
    html = templates.adApproved(productData.title);
  } else if (status === 'pending') {
    subject = 'Ad Under Review';
    html = templates.adSuspicious(productData.title);
  }
if (html) {
    try {
      await sendEmail(user.email, subject, html);
      console.log('✅ Notification email sent successfully');
    } catch (emailErr) {
      // Don't fail product creation if email fails - just log the error
      console.warn('⚠️ Email send failed (non-blocking):', emailErr.message);
    }
  }
  
  return product.populate('user', 'name avatar');
};

export const getProducts = async (query) => {
  await Product.updateMany({ isBoosted: true, boostedUntil: { $lte: new Date() } }, { isBoosted: false, boostedUntil: null });
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;
  const skip = (page - 1) * limit;
  const cursor = query.cursor;

  const lat = parseFloat(query.lat);
  const lng = parseFloat(query.lng);
  const radius = (parseFloat(query.radius) || 10) * 1000; // meters
  const sortBy = query.sortBy || 'latest';
  const config = await appConfigService.getAppConfig().catch(() => null);
  const boostedSort = config?.controls?.boostedSearchEnabled === false ? {} : { isBoosted: -1 };
  const getSort = () => {
    if (sortBy === 'price_low') return { ...boostedSort, price: 1, createdAt: -1, _id: -1 };
    if (sortBy === 'price_high') return { ...boostedSort, price: -1, createdAt: -1, _id: -1 };
    if (sortBy === 'oldest') return { ...boostedSort, createdAt: 1, _id: 1 };
    return { ...boostedSort, createdAt: -1, _id: -1 };
  };

  let products;
  let total;
  let nextCursor = null;
  let hasMore = false;
  let geoUsed = false;
  const categoryName = query.category ? await normalizeCategory(query.category, { requireActive: true }) : null;
  const subCategoryName = query.subCategory ? await normalizeCategory(query.subCategory, { requireActive: true }) : null;
  if ((query.category && !categoryName) || (query.subCategory && !subCategoryName)) {
    return {
      products: [],
      pagination: {
        page,
        limit,
        total: 0,
        pages: 0,
        nextCursor: null,
        hasMore: false,
        mode: cursor ? 'cursor' : 'page',
        geoUsed: false,
      },
      warning: null,
    };
  }
  const priceFilter = {};
  if (query.minPrice !== undefined && query.minPrice !== null && query.minPrice !== '') priceFilter.$gte = Number(query.minPrice);
  if (query.maxPrice !== undefined && query.maxPrice !== null && query.maxPrice !== '') priceFilter.$lte = Number(query.maxPrice);

  try {
    if (!isNaN(lat) && !isNaN(lng) && !query.search) {
      // Try geospatial first
      const matchStage = {
        status: 'approved',
        ...(categoryName && { category: categoryName }),
        ...(subCategoryName && { subCategory: subCategoryName }),
        ...(Object.keys(priceFilter).length && { price: priceFilter })
      };

      if (cursor && mongoose.Types.ObjectId.isValid(cursor)) {
        matchStage._id = { $lt: new mongoose.Types.ObjectId(cursor) };
      }

      if (query.search) {
        matchStage.$text = { $search: query.search };
      }

      const pipeline = [
        {
          $geoNear: {
            near: { type: 'Point', coordinates: [lng, lat] },
            distanceField: 'dist.calculated',
            maxDistance: radius,
            spherical: true
          }
        },
        {
          $match: matchStage
        },
        { $sort: getSort() },
        ...(cursor ? [] : [{ $skip: skip }]),
        { $limit: limit + 1 },
        {
          $lookup: {
            from: 'users',
            localField: 'user',
            foreignField: '_id',
            as: 'user',
            pipeline: [{ $project: { name: 1, avatar: 1 } }]
          }
        },
        { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } }
      ];
      products = await Product.aggregate(pipeline);
      geoUsed = true;
    }
  } catch (geoError) {
    console.warn('Geospatial query failed, falling back:', geoError.message);
  }

  // Fallback to standard query if geo failed or no coords
  if (!geoUsed || !products) {
    const filter = { status: 'approved' };
    if (categoryName) filter.category = categoryName;
    if (subCategoryName) filter.subCategory = subCategoryName;
    if (query.location) filter.location = { $regex: query.location, $options: 'i' };
    if (query.search) filter.$text = { $search: query.search };
    if (Object.keys(priceFilter).length) filter.price = priceFilter;
    if (cursor && mongoose.Types.ObjectId.isValid(cursor)) {
      filter._id = { $lt: new mongoose.Types.ObjectId(cursor) };
    }

    const findQuery = Product.find(filter);

    if (query.search) {
      findQuery.select({ score: { $meta: 'textScore' } });
      findQuery.sort({ ...boostedSort, score: { $meta: 'textScore' }, createdAt: -1 });
    } else {
      findQuery.sort(getSort());
    }

    products = await findQuery
      .select('title price images category createdAt isBoosted user location locationCoords')
      .populate('user', 'name avatar')
      .skip(cursor ? 0 : skip)
      .limit(limit + 1);
  }

  hasMore = products.length > limit;
  if (hasMore) {
    products = products.slice(0, limit);
  }
  nextCursor = products.length ? products[products.length - 1]._id?.toString() : null;

  const countFilter = { status: 'approved' };
  if (categoryName) countFilter.category = categoryName;
  if (subCategoryName) countFilter.subCategory = subCategoryName;
  if (query.location) countFilter.location = { $regex: query.location, $options: 'i' };
  if (Object.keys(priceFilter).length) countFilter.price = priceFilter;
  if (query.search) countFilter.$text = { $search: query.search };
  total = geoUsed && !query.search
    ? products.length + (hasMore ? 1 : 0)
    : await Product.countDocuments(countFilter);

  return {
    products,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      nextCursor,
      hasMore,
      mode: cursor ? 'cursor' : 'page',
      geoUsed: !!geoUsed,
    },
    warning: !geoUsed ? 'Geolocation temporarily unavailable - showing nationwide results' : null,
  };
};

export const getProduct = async (id) => {
  const product = await Product.findById(id).populate('user', 'name avatar email');
  if (!product || product.status !== 'approved') throw new Error('Product not found or not approved');
  product.views += 1;
  await product.save();
  
  // Add sellerName and sellerEmail for frontend compatibility
  const productWithSeller = {
    ...product.toObject(),
    sellerName: product.user?.name || 'Unknown',
    sellerEmail: product.user?.email || 'Unknown'
  };
  
  return productWithSeller;
};

export const getMyProduct = async (id, userId) => {
  const product = await Product.findOne({ _id: id, user: userId })
    .populate('user', 'name avatar email');
  if (!product) throw new Error('Product not found');
  return product;
};

export const updateProduct = async (id, updateData, userId) => {
  const product = await Product.findOne({ _id: id, user: userId });
  if (!product) throw new Error('Product not found');

  const keys = Object.keys(updateData);
  if (keys.length === 1 && keys[0] === 'status') {
    const requestedStatus = updateData.status;
    if (requestedStatus === 'paused' && product.status === 'approved') {
      product.status = 'paused';
    } else if (requestedStatus === 'approved' && product.status === 'paused') {
      product.status = 'approved';
    } else if (requestedStatus === 'sold') {
      product.status = 'sold';
    } else {
      throw new Error('Invalid status change');
    }
    await product.save();
    return product.populate('user', 'name avatar');
  }

  delete updateData.status;
  delete updateData.isBoosted;
  delete updateData.boostedUntil;
  if (updateData.category) {
    const categoryName = await normalizeCategory(updateData.category, { requireActive: true });
    if (!categoryName) throw new Error('Please choose a valid active category');
    updateData.category = categoryName;
  }
  if (product.status === 'rejected' || product.status === 'approved') {
    updateData.status = 'pending';
    updateData.approvedAt = null;
    updateData.approvalSource = null;
  }
  Object.assign(product, updateData);
  if (updateData.title || updateData.description) {
    const contentText = `${product.title} ${product.description}`.toLowerCase();
    product.searchVector = computeTFIDF(contentText);
  }
  if (updateData.location && (!updateData.locationCoords || !updateData.locationCoords.coordinates?.length)) {
    const geocodeService = (await import('../geocode/geocode.service.js')).default;
    const coordinates = await geocodeService.forwardGeocode(updateData.location);
    if (coordinates && coordinates.length === 2) {
      product.locationCoords = { type: 'Point', coordinates };
    }
  }
  await product.save();
  return product.populate('user', 'name avatar');
};

export const deleteProduct = async (id, userId) => {
  const product = await Product.findOneAndDelete({ _id: id, user: userId });
  if (!product) throw new Error('Product not found');
};

export const getMyProducts = async (userId, query = {}) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;
  const skip = (page - 1) * limit;
  const cursor = query.cursor;

  const filter = { user: userId };
  if (query.status) filter.status = query.status;
  if (cursor && mongoose.Types.ObjectId.isValid(cursor)) {
    filter._id = { $lt: new mongoose.Types.ObjectId(cursor) };
  }

  let products = await Product.find(filter)
    .select('title description price images category condition createdAt updatedAt status views isBoosted user location locationCoords')
    .populate('user', 'name avatar')
    .sort({ _id: -1 })
    .skip(cursor ? 0 : skip)
    .limit(limit + 1);

  const hasMore = products.length > limit;
  if (hasMore) {
    products = products.slice(0, limit);
  }
  const nextCursor = products.length ? products[products.length - 1]._id?.toString() : null;

  const countFilter = { user: userId };
  if (query.status) countFilter.status = query.status;
  const total = await Product.countDocuments(countFilter);

  return {
    data: products,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      nextCursor,
      hasMore,
      mode: cursor ? 'cursor' : 'page'
    }
  };
};

const CATEGORY_HINTS = {
  Electronics: ['mobile', 'phone', 'laptop', 'tv', 'camera', 'electronics', 'gadget'],
  Vehicles: ['car', 'bike', 'scooter', 'vehicle', 'truck', 'auto'],
  Property: ['house', 'flat', 'apartment', 'plot', 'property', 'rent'],
  Jobs: ['job', 'hiring', 'vacancy', 'internship', 'work'],
  Services: ['service', 'repair', 'cleaning', 'tutor', 'freelance'],
  Others: [],
};

const inferCategoryFromSearch = (search = '') => {
  const term = String(search).toLowerCase().trim();
  if (!term) return null;

  for (const [category, hints] of Object.entries(CATEGORY_HINTS)) {
    if (hints.some((hint) => term.includes(hint))) {
      return category;
    }
  }
  return null;
};

export const getRecommendations = async (query = {}) => {
  const limit = Math.min(parseInt(query.limit, 10) || 10, 30);
  const inferredCategory = inferCategoryFromSearch(query.search);
  const category = query.category
    ? await normalizeCategory(query.category, { requireActive: true })
    : inferredCategory;

  let filter = { status: 'approved' };
  if (category) filter.category = category;
  if (query.excludeProductId && mongoose.Types.ObjectId.isValid(query.excludeProductId)) {
    filter._id = { $ne: new mongoose.Types.ObjectId(query.excludeProductId) };
  }

  if (query.similarTo && mongoose.Types.ObjectId.isValid(query.similarTo)) {
    // DSA Cosine similarity
    const targetProduct = await Product.findById(query.similarTo).select('searchVector');
    if (!targetProduct || !targetProduct.searchVector || targetProduct.searchVector.length === 0) {
      return { recommendations: [], seed: { strategy: 'dsa-cosine', error: 'No vector' } };
    }

    const candidates = await Product.find(filter)
      .select('title price images category createdAt isBoosted user searchVector')
      .populate('user', 'name avatar')
      .lean();

    const scored = candidates.map(p => ({
      ...p,
      similarityScore: cosineSimilarity(targetProduct.searchVector, p.searchVector || [])
    })).sort((a, b) => b.similarityScore - a.similarityScore);

    const recommendations = scored.slice(0, limit);

    return {
      recommendations,
      seed: {
        strategy: 'dsa-tf-idf-cosine',
        similarTo: query.similarTo,
        avgScore: scored[0] ? scored[0].similarityScore : 0,
        count: candidates.length,
      },
    };
  } else {
    const recommendations = await Product.find(filter)
      .select('title price images category createdAt isBoosted user')
      .populate('user', 'name avatar')
      .sort({ isBoosted: -1, createdAt: -1, views: -1 })
      .limit(limit);

    return {
      recommendations,
      seed: {
        search: query.search || null,
        category: category || null,
        inferredFromSearch: inferredCategory || null,
        strategy: 'basic-filtering',
      },
    };
  }
};

