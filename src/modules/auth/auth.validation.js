import Joi from 'joi';

const registerValidation = Joi.object({
  name: Joi.string().trim().min(2).max(30).required(),
  email: Joi.string().trim().email().required(),
  password: Joi.string()
    .min(8)
    .max(64)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/)
    .required()
    .messages({
      'string.pattern.base': 'Password must include uppercase, lowercase, number, and special character',
    }),
});

const loginValidation = Joi.object({
  email: Joi.string().trim().email().required(),
  password: Joi.string().min(1).required(),
});

export { registerValidation, loginValidation };

