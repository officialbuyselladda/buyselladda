import Joi from 'joi';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const imageSchema = Joi.object({
  public_id: Joi.string().trim().allow('', null),
  url: Joi.string().uri().required(),
});

const locationCoordsSchema = Joi.object({
  type: Joi.string().valid('Point').default('Point'),
  coordinates: Joi.array().items(Joi.number()).length(2).required(),
});

const createProductValidation = Joi.object({
  title: Joi.string().trim().min(3).max(120).required(),
  description: Joi.string().trim().min(10).max(5000).required(),
  price: Joi.number().min(1).max(100000000).required(),
  category: Joi.string()
    .valid('Electronics', 'Vehicles', 'Property', 'Jobs', 'Services', 'Others')
    .required(),
  condition: Joi.string().valid('New', 'Used').optional(),
  images: Joi.array().items(imageSchema).min(1).required(),
  location: Joi.string().trim().min(2).max(200).required(),
  locationCoords: locationCoordsSchema.optional(),
  isBoosted: Joi.boolean().optional(),
});

const updateProductValidation = Joi.object({
  title: Joi.string().trim().min(3).max(120).optional(),
  description: Joi.string().trim().min(10).max(5000).optional(),
  price: Joi.number().min(1).max(100000000).optional(),
  category: Joi.string()
    .valid('Electronics', 'Vehicles', 'Property', 'Jobs', 'Services', 'Others')
    .optional(),
  condition: Joi.string().valid('New', 'Used').optional(),
  images: Joi.array().items(imageSchema).min(1).optional(),
  location: Joi.string().trim().min(2).max(200).optional(),
  locationCoords: locationCoordsSchema.optional(),
  isBoosted: Joi.boolean().optional(),
}).min(1);

const productIdParamValidation = Joi.object({
  id: Joi.string().pattern(objectIdRegex).required(),
});

const productListQueryValidation = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  cursor: Joi.string().pattern(objectIdRegex).optional(),
  category: Joi.string()
    .valid('Electronics', 'Vehicles', 'Property', 'Jobs', 'Services', 'Others')
    .optional(),
  search: Joi.string().trim().allow('', null).optional(),
  location: Joi.string().trim().allow('', null).optional(),
  lat: Joi.number().optional(),
  lng: Joi.number().optional(),
  radius: Joi.number().min(1).max(500).optional(),
}).unknown(false);

const myProductsQueryValidation = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  cursor: Joi.string().pattern(objectIdRegex).optional(),
  status: Joi.string().valid('pending', 'approved', 'rejected', 'suspicious').optional(),
}).unknown(false);

const recommendationsQueryValidation = Joi.object({
  limit: Joi.number().integer().min(1).max(30).default(10),
  search: Joi.string().trim().allow('', null).optional(),
  category: Joi.string()
    .valid('Electronics', 'Vehicles', 'Property', 'Jobs', 'Services', 'Others')
    .optional(),
  excludeProductId: Joi.string().pattern(objectIdRegex).optional(),
  similarTo: Joi.string().pattern(objectIdRegex).optional(),
}).unknown(false);

export {
  createProductValidation,
  updateProductValidation,
  productIdParamValidation,
  productListQueryValidation,
  myProductsQueryValidation,
  recommendationsQueryValidation,
};
