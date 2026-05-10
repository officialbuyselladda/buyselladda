import Joi from 'joi';

const createCategorySchema = Joi.object({
  name: Joi.string().trim().required().max(100),
  description: Joi.string().trim().max(500).allow(''),
  parent: Joi.string().allow('', null).optional().messages({
    'string.base': 'Parent must be a valid category ID'
  }),
  icon: Joi.string().trim().max(50).allow('').optional(),
  image: Joi.string().uri().allow('').optional(),
  isActive: Joi.boolean().optional(),
  sortOrder: Joi.number().integer().min(0).max(999).optional(),
  meta: Joi.object().optional()
});

const updateCategorySchema = Joi.object({
  name: Joi.string().trim().max(100).optional(),
  description: Joi.string().trim().max(500).allow('').optional(),
  parent: Joi.string().allow('', null).optional().messages({
    'string.base': 'Parent must be a valid category ID'
  }),
  icon: Joi.string().trim().max(50).allow('').optional(),
  image: Joi.string().uri().allow('').optional(),
  isActive: Joi.boolean().optional(),
  sortOrder: Joi.number().integer().min(0).max(999).optional(),
  meta: Joi.object().optional()
});

const listCategoriesSchema = Joi.object({
  parent: Joi.string().optional(),
  search: Joi.string().trim().allow('', null).optional(),
  isActive: Joi.boolean().optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(10),
  sort: Joi.string().valid('name', '-name', 'sortOrder', '-sortOrder', 'productsCount', '-productsCount').default('-sortOrder')
});

const getCategorySchema = Joi.object({
  slug: Joi.string().required(),
  withChildren: Joi.boolean().default(true),
  withProductsCount: Joi.boolean().default(true)
});

export { createCategorySchema, updateCategorySchema, listCategoriesSchema, getCategorySchema };
