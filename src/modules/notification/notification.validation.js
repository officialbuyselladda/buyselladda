import Joi from 'joi';

export const createNotificationSchema = Joi.object({
  type: Joi.string().valid('new_message', 'product_status', 'favorite_activity', 'system', 'promotion').required(),
  title: Joi.string().trim().max(200).required(),
  message: Joi.string().trim().max(1000).required(),
  data: Joi.object().optional(),
  relatedProduct: Joi.string().optional(),
  relatedChat: Joi.string().optional(),
  priority: Joi.string().valid('low', 'medium', 'high').default('medium')
});

export const listNotificationsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(20),
  read: Joi.boolean().optional(),
  type: Joi.string().optional(),
  priority: Joi.string().valid('low', 'medium', 'high').optional()
});

