import mongoose from 'mongoose';
import Product from './product.model.js';
import User from '../user/user.model.js';
import templates from '../../utils/emailTemplates.js';
import sendEmail from '../../config/email.js';

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

const isImageSetSafe = (images = []) => {
  if (!Array.isArray(images) || images.length === 0) return false;
  return images.every((img) => {
    const hasValidUrl = typeof img?.url === 'string' && img.url.trim().length > 0;
    const hasValidPublicId = typeof img?.public_id === 'string' && img.public_id.trim().length > 0;
    return hasValidUrl || hasValidPublicId;
  });
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
  const user = await User.findById(productData.user).select('trustScore');
  if (!user) throw new Error('User not found');

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
  const status = 'pending';

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
  console.log('Generated slug:', slug);

  const product = await Product.create({ ...productData, status, searchVector, slug });
  
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
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;
  const skip = (page - 1) * limit;
  const cursor = query.cursor;

  const lat = parseFloat(query.lat);
  const lng = parseFloat(query.lng);
  const radius = (parseFloat(query.radius) || 10) * 1000; // meters

  let products;
  let total;
  let nextCursor = null;
  let hasMore = false;
  let geoUsed = false;

  try {
    if (!isNaN(lat) && !isNaN(lng)) {
      // Try geospatial first
      const matchStage = {
        status: 'approved',
        ...(query.category && { category: query.category })
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
        { $sort: { isBoosted: -1, createdAt: -1, _id: -1 } },
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
  if (!geoUsed || !products || products.length === 0) {
    const filter = { status: 'approved' };
    if (query.category) filter.category = query.category;
    if (query.location) filter.location = { $regex: query.location, $options: 'i' };
    if (query.search) filter.$text = { $search: query.search };
    if (cursor && mongoose.Types.ObjectId.isValid(cursor)) {
      filter._id = { $lt: new mongoose.Types.ObjectId(cursor) };
    }

    const findQuery = Product.find(filter);

    if (query.search) {
      findQuery.select({ score: { $meta: 'textScore' } });
      findQuery.sort({ isBoosted: -1, score: { $meta: 'textScore' }, createdAt: -1 });
    } else {
      findQuery.sort({ isBoosted: -1, createdAt: -1 });
    }

    products = await findQuery
      .select('title price images category createdAt isBoosted user location')
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
  if (query.category) countFilter.category = query.category;
  total = await Product.countDocuments(countFilter);

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

export const updateProduct = async (id, updateData, userId) => {
  const product = await Product.findOne({ _id: id, user: userId });
  if (!product) throw new Error('Product not found');
  Object.assign(product, updateData);
  if (updateData.title || updateData.description) {
    const contentText = `${product.title} ${product.description}`.toLowerCase();
    product.searchVector = computeTFIDF(contentText);
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
    .select('title price images category createdAt status isBoosted user location')
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
  const category = query.category || inferredCategory;

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

