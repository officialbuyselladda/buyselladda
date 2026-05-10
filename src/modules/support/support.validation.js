import Joi from 'joi';

const objectId = Joi.string().hex().length(24);

export const createSupportTicketValidation = Joi.object({
  subject: Joi.string().trim().min(5).max(140).required(),
  category: Joi.string().valid('account', 'ad', 'payment', 'chat', 'safety', 'technical', 'other').default('other'),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent').default('medium'),
  message: Joi.string().trim().min(10).max(3000).required(),
  relatedProduct: objectId.allow('', null).optional(),
  contactEmail: Joi.string().trim().email().allow('').optional(),
});

export const supportListQueryValidation = Joi.object({
  status: Joi.string().valid('all', 'open', 'in_progress', 'waiting_user', 'resolved', 'closed').default('all'),
  priority: Joi.string().valid('all', 'low', 'medium', 'high', 'urgent').default('all'),
  category: Joi.string().valid('all', 'account', 'ad', 'payment', 'chat', 'safety', 'technical', 'other').default('all'),
  search: Joi.string().trim().allow('').default(''),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
});

export const updateSupportTicketValidation = Joi.object({
  status: Joi.string().valid('open', 'in_progress', 'waiting_user', 'resolved', 'closed').optional(),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent').optional(),
  adminNote: Joi.string().trim().max(2000).allow('').optional(),
  reply: Joi.string().trim().min(2).max(3000).allow('').optional(),
});

export const replySupportTicketValidation = Joi.object({
  message: Joi.string().trim().min(2).max(3000).required(),
});
