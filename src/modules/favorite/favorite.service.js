import Favorite from './favorite.model.js';
import Product from '../product/product.model.js';
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
  const favorites = await Favorite.find(filter)
    .populate({
      path: 'product',
      match: search ? { $text: { $search: search } } : {},
      select: 'title description price images category status locationCoords isBoosted createdAt',
      populate: { path: 'user', select: 'name avatar phone' }
    })
    .sort('-createdAt')
    .skip(skip)
    .limit(limit * 1)
    .lean();

  // Filter out null products (deleted)
  const validFavorites = favorites.filter(f => f.product);

  const total = await Favorite.countDocuments({ user: userId });

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

// Admin: List all favorites with pagination
const listFavoritesAdmin = async ({ page = 1, limit = 10, search, userId }) => {
  const pageNum = parseInt(page) || 1;
  const limitNum = Math.min(parseInt(limit) || 10, 100);
  const skip = (pageNum - 1) * limitNum;
  
  const filter = {};
  if (userId) filter.user = userId;
  
  const favorites = await Favorite.find(filter)
    .populate({
      path: 'user',
      select: 'name email avatar'
    })
    .populate({
      path: 'product',
      select: 'title description price images status category',
      match: search ? { 
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ]
      } : {}
    })
    .sort('-createdAt')
    .skip(skip)
    .limit(limitNum)
    .lean();
  
  // Filter out null products
  const validFavorites = favorites.filter(f => f.product);
  
  const total = await Favorite.countDocuments(filter);
  
  return {
    favorites: validFavorites,
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

