import Joi from 'joi';

export const createContactMessageValidation = Joi.object({
  type: Joi.string().valid('contact', 'report').default('contact'),
  name: Joi.string().trim().min(2).max(120).required(),
  email: Joi.string().trim().email().required(),
  message: Joi.string().trim().min(5).max(3000).required(),
  problemType: Joi.string().trim().max(60).allow('', null),
  adReference: Joi.string().trim().max(300).allow('', null),
});
