import Favorite from './favorite.model.js';
import Product from '../product/product.model.js';
import User from '../user/user.model.js';
import { NotFoundError } from '../../utils/errorHandler.js';

const toggleFavorite = async (userId, productId) => {
  // Check if product exists
  const product = await Product.findById(productId);
  if (!product) throw new NotFoundError('Product not found');

  // Check if already favorited
  const existingFavorite = await Favorite.findOne({ user: userId, product: productId });
  
  if (existingFavorite) {
    // Remove favorite
    await existingFavorite.deleteOne();
    return { action: 'removed', favorite: null };
  } else {
    // Add favorite
    const favorite = await Favorite.create({ user: userId, product: productId });
    return { action: 'added', favorite };
  }
};

const getUserFavorites = async (userId, query = {}) => {
  const { page = 1, limit = 20, search } = query;
  const skip = (page - 1) * limit;

  const filter = { user: userId };
  if (search) {
    const matchingProducts = await Product.find({ $text: { $search: search } }).select('_id').lean();
    const productIds = matchingProducts.map((product) => product._id);
    if (productIds.length === 0) {
      return {
        favorites: [],
        pagination: {
          page,
          limit,
          total: 0,
          pages: 0
        }
      };
    }
    filter.product = { $in: productIds };
  }

  const favorites = await Favorite.find(filter)
    .populate({
      path: 'product',
      select: 'title description price images category condition status location locationCoords isBoosted createdAt views',
      populate: { path: 'user', select: 'name avatar phone' }
    })
    .sort('-createdAt')
    .skip(skip)
    .limit(limit * 1)
    .lean();

  // Filter out null products (deleted)
  const validFavorites = favorites.filter(f => f.product);

  const total = await Favorite.countDocuments(filter);

  return {
    favorites: validFavorites,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

const getFavoriteCount = async (userId) => {
  return await Favorite.countDocuments({ user: userId });
};

const listFavoritesAdmin = async ({ page = 1, limit = 10, search, userId }) => {
  const pageNum = parseInt(page) || 1;
  const limitNum = Math.min(parseInt(limit) || 10, 100);
  const skip = (pageNum - 1) * limitNum;
  const term = String(search || '').trim();
  const filter = {};
  if (userId) filter.user = userId;

  if (term) {
    const [matchingProducts, matchingUsers] = await Promise.all([
      Product.find({
        $or: [
          { title: { $regex: term, $options: 'i' } },
          { description: { $regex: term, $options: 'i' } },
          { category: { $regex: term, $options: 'i' } },
        ],
      }).select('_id').lean(),
      User.find({
        $or: [
          { name: { $regex: term, $options: 'i' } },
          { email: { $regex: term, $options: 'i' } },
        ],
      }).select('_id').lean(),
    ]);

    const productIds = matchingProducts.map((product) => product._id);
    const userIds = matchingUsers.map((user) => user._id);
    filter.$or = [
      ...(productIds.length ? [{ product: { $in: productIds } }] : []),
      ...(userIds.length ? [{ user: { $in: userIds } }] : []),
    ];

    if (filter.$or.length === 0) {
      return {
        favorites: [],
        total: 0,
        page: pageNum,
        limit: limitNum,
        pages: 0,
      };
    }
  }

  const [favorites, total] = await Promise.all([
    Favorite.find(filter)
      .populate({
        path: 'user',
        select: 'name email avatar'
      })
      .populate({
        path: 'product',
        select: 'title description price images status category views createdAt'
      })
    .sort('-createdAt')
    .skip(skip)
    .limit(limitNum)
      .lean(),
    Favorite.countDocuments(filter),
  ]);

  return {
    favorites: favorites.filter(f => f.product && f.user),
    total,
    page: pageNum,
    limit: limitNum,
    pages: Math.ceil(total / limitNum)
  };
};

// Admin: Delete a favorite by ID
const deleteFavorite = async (id) => {
  const favorite = await Favorite.findById(id);
  if (!favorite) throw new NotFoundError('Favorite not found');
  await favorite.deleteOne();
  return { message: 'Favorite deleted successfully' };
};

export {
  toggleFavorite,
  getUserFavorites,
  getFavoriteCount,
  listFavoritesAdmin,
  deleteFavorite
};

