import Joi from 'joi';

export const listValidation = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().allow(''),
  role: Joi.string().valid('user', 'admin', 'all').default('all'),
  status: Joi.string().valid('all', 'active', 'blocked').default('all')
});

export const userDetailValidation = Joi.object({
  id: Joi.string().required()
});

export const deleteUserValidation = Joi.object({
  id: Joi.string().required()
});

export const deleteProductValidation = Joi.object({
  id: Joi.string().required()
});

export const approveProductValidation = Joi.object({
  id: Joi.string().required()
});

export const rejectProductValidation = Joi.object({
  id: Joi.string().required()
});

// Duplicate removed

export const updateUserValidation = Joi.object({
  name: Joi.string().optional(),
  email: Joi.string().email().optional(),
  phone: Joi.string().optional(),
  location: Joi.string().optional(),
  role: Joi.string().valid('user', 'admin').optional(),
  isBlocked: Joi.boolean().optional()
}).min(1);

export const toggleUserBlockValidation = Joi.object({
  id: Joi.string().required()
});

