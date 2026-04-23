import Joi from 'joi';

export const toggleFavoriteSchema = Joi.object({
  productId: Joi.string().required().messages({
    'string.base': 'Product ID is required',
    'any.required': 'Product ID is required'
  })
});

export const listFavoritesSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(20),
  search: Joi.string().trim().allow('', null).optional()
});

