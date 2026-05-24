import Joi from 'joi';

const registerValidation = Joi.object({
  name: Joi.string().trim().min(2).max(30).required()
    .messages({
      'string.empty': 'Name is required',
      'string.min': 'Name must be at least {#limit} characters',
      'string.max': 'Name cannot exceed {#limit} characters',
    }),
  email: Joi.string().trim().email().required()
    .messages({
      'string.empty': 'Email is required',
      'string.email': 'Please enter a valid email address',
    }),
  password: Joi.string()
    .min(6)
    .max(64)
    .required()
    .messages({
      'string.empty': 'Password is required',
      'string.min': 'Password must be at least {#limit} characters',
      'string.max': 'Password cannot exceed {#limit} characters',
    }),
  phone: Joi.string().trim().allow('', null).optional(),
});

const loginValidation = Joi.object({
  email: Joi.string().trim().email().required()
    .messages({
      'string.empty': 'Email is required',
      'string.email': 'Please enter a valid email address',
    }),
  password: Joi.string().min(1).required()
    .messages({
      'string.empty': 'Password is required',
  }),
});

const forgotPasswordValidation = Joi.object({
  email: Joi.string().trim().email().required()
    .messages({
      'string.empty': 'Email is required',
      'string.email': 'Please enter a valid email address',
    }),
});

const resetPasswordValidation = Joi.object({
  password: Joi.string().min(6).max(64).required()
    .messages({
      'string.empty': 'Password is required',
      'string.min': 'Password must be at least {#limit} characters',
      'string.max': 'Password cannot exceed {#limit} characters',
    }),
});

const changePasswordValidation = Joi.object({
  currentPassword: Joi.string().min(1).required()
    .messages({
      'string.empty': 'Current password is required',
    }),
  newPassword: Joi.string().min(6).max(64).required()
    .invalid(Joi.ref('currentPassword'))
    .messages({
      'any.invalid': 'New password must be different from current password',
      'string.empty': 'New password is required',
      'string.min': 'New password must be at least {#limit} characters',
      'string.max': 'New password cannot exceed {#limit} characters',
    }),
});

export { registerValidation, loginValidation, forgotPasswordValidation, resetPasswordValidation, changePasswordValidation };

