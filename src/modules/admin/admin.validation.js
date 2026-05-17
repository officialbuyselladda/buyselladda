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

export const createUserValidation = Joi.object({
  name: Joi.string().trim().min(2).max(30).required(),
  email: Joi.string().trim().email().required(),
  password: Joi.string().min(6).max(128).required(),
  phone: Joi.string().trim().allow('').optional(),
  location: Joi.string().trim().allow('').optional(),
  role: Joi.string().valid('user', 'admin').default('user'),
  isBlocked: Joi.boolean().default(false)
});

export const adPostingLimitsValidation = Joi.object({
  daily: Joi.number().integer().min(0).max(100000).required(),
  weekendDaily: Joi.number().integer().min(0).max(100000).required(),
  monthly: Joi.number().integer().min(0).max(1000000).required(),
  unlimited: Joi.boolean().required()
});

export const bulkAdPostingLimitsValidation = adPostingLimitsValidation.keys({
  role: Joi.string().valid('user', 'admin', 'all').default('user')
});

export const adminPermissionsList = [
  'all',
  'dashboard',
  'analytics',
  'products',
  'users',
  'userLimits',
  'chats',
  'reports',
  'supportTickets',
  'categories',
  'favorites',
  'notifications',
  'moderation',
  'settings',
  'systemSettings',
  'adminRoles',
];

export const adminRoleAccountValidation = Joi.object({
  name: Joi.string().trim().min(2).max(30).required(),
  email: Joi.string().trim().email().required(),
  password: Joi.string().min(6).max(128).required(),
  phone: Joi.string().trim().allow('').optional(),
  adminPermissions: Joi.array().items(Joi.string().valid(...adminPermissionsList)).min(1).required(),
  isBlocked: Joi.boolean().default(false)
});

export const updateAdminRoleAccountValidation = Joi.object({
  name: Joi.string().trim().min(2).max(30).optional(),
  email: Joi.string().trim().email().optional(),
  password: Joi.string().min(6).max(128).allow('').optional(),
  phone: Joi.string().trim().allow('').optional(),
  adminPermissions: Joi.array().items(Joi.string().valid(...adminPermissionsList)).min(1).optional(),
  isBlocked: Joi.boolean().optional()
}).min(1);

