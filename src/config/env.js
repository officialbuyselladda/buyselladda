import dotenv from 'dotenv';
import Joi from 'joi';

dotenv.config();

const envSchema = Joi.object({
  NODE_ENV: Joi.string().valid('production', 'development', 'test').default('development'),
  PORT: Joi.number().default(5000),
  HTTPS_PORT: Joi.number().default(5443),
  MONGODB_URI: Joi.string().required(),
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRE: Joi.string().default('30d'),
  CLOUDINARY_CLOUD_NAME: Joi.string().required(),
  CLOUDINARY_API_KEY: Joi.string().required(),
  CLOUDINARY_API_SECRET: Joi.string().required(),
  GOOGLE_MAPS_API_KEY: Joi.string().default(''),

  EMAIL_HOST: Joi.string().required(),
  EMAIL_PORT: Joi.number().default(587),
  EMAIL_SECURE: Joi.boolean().truthy('true').truthy('1').falsy('false').falsy('0').default(false),
  EMAIL_USER: Joi.string().email().required(),
  EMAIL_PASS: Joi.string().required(),
  EMAIL_FROM: Joi.string().email().optional(),
}).unknown();

const { error, value } = envSchema.validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

export default value;

