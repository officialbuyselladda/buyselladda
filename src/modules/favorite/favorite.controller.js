import asyncHandler from '../../utils/asyncHandler.js';
import responseHandler from '../../utils/responseHandler.js';
import * as favoriteService from './favorite.service.js';
import { toggleFavoriteSchema, listFavoritesSchema } from './favorite.validation.js';
import { ValidationError } from '../../utils/errorHandler.js';

const toggleFavorite = asyncHandler(async (req, res) => {
  const { error, value } = toggleFavoriteSchema.validate(req.body);
  if (error) throw new ValidationError(error.details[0].message);

  const result = await favoriteService.toggleFavorite(req.user._id, value.productId);
  responseHandler(res, `Favorite ${result.action} successfully`, result);
});

const getUserFavorites = asyncHandler(async (req, res) => {
  const { error, value } = listFavoritesSchema.validate(req.query);
  if (error) throw new ValidationError(error.details[0].message);

  const favorites = await favoriteService.getUserFavorites(req.user._id, value);
  responseHandler(res, 'Favorites retrieved successfully', favorites);
});

const getFavoriteCount = asyncHandler(async (req, res) => {
  const count = await favoriteService.getFavoriteCount(req.user._id);
  responseHandler(res, 'Favorite count retrieved', { count });
});

// Admin: List all favorites
const listFavoritesAdmin = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, userId } = req.query;
  
  const result = await favoriteService.listFavoritesAdmin({
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 10,
    search,
    userId
  });
  
  responseHandler(res, 'Admin favorites retrieved successfully', result);
});

// Admin: Delete a favorite
const deleteFavoriteAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await favoriteService.deleteFavorite(id);
  responseHandler(res, 'Favorite deleted successfully');
});

export {
  toggleFavorite,
  getUserFavorites,
  getFavoriteCount,
  listFavoritesAdmin,
  deleteFavoriteAdmin
};

