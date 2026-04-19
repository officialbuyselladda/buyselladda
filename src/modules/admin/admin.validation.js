import Joi from 'joi';

const deleteUserValidation = Joi.object({
  id: Joi.string().required(),
});

const deleteProductValidation = Joi.object({
  id: Joi.string().required(),
});

const approveProductValidation = Joi.object({
  id: Joi.string().required(),
});

const rejectProductValidation = Joi.object({
  id: Joi.string().required(),
});

const listValidation = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  status: Joi.string().valid('all', 'pending', 'approved', 'rejected').allow(null, '').optional(),
  role: Joi.string().valid('all', 'user', 'admin').allow(null, '').optional(),
  search: Joi.string().trim().allow('', null).default(null).optional(),
});

const userDetailValidation = Joi.object({
  id: Joi.string().required(),
});

export { deleteUserValidation, deleteProductValidation, approveProductValidation, rejectProductValidation, listValidation, userDetailValidation };

