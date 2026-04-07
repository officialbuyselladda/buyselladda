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

export { deleteUserValidation, deleteProductValidation, approveProductValidation, rejectProductValidation };

