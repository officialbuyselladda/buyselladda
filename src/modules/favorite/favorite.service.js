import Favorite from './favorite.model.js';
import Product from '../product/product.model.js';
import asyncHandler from '../../utils/asyncHandler.js';
import { NotFoundError } from '../../utils/errorHandler.js';

const toggleFavorite = asyncHandler(async (userId, productId) => {
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
});

const getUserFavorites = asyncHandler(async (userId, query = {}) => {
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
});

const getFavoriteCount = asyncHandler(async (userId) => {
  return await Favorite.countDocuments({ user: userId });
});

export {
  toggleFavorite,
  getUserFavorites,
  getFavoriteCount
};

