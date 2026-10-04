import dotenv from 'dotenv';
import Joi from 'joi';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '../../.env');

// PM2 may start the process from a different working directory on the VPS.
// Resolve .env from the backend itself so the configured port is always loaded.
dotenv.config({ path: envPath });

const envSchema = Joi.object({
  NODE_ENV: Joi.string().valid('production', 'development', 'test').default('development'),
  PORT: Joi.number().default(5000),
  HTTPS_PORT: Joi.number().default(5443),
  MONGODB_URI: Joi.string().required(),
  REDIS_URL: Joi.string().default('redis://127.0.0.1:6379'),
  PUBLIC_BASE_URL: Joi.string().uri().optional(),
  UPLOAD_DIR: Joi.string().default('uploads'),
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRE: Joi.string().default('30d'),
  CLOUDINARY_CLOUD_NAME: Joi.string().allow('').optional(),
  CLOUDINARY_API_KEY: Joi.string().allow('').optional(),
  CLOUDINARY_API_SECRET: Joi.string().allow('').optional(),
  GOOGLE_MAPS_API_KEY: Joi.string().default(''),

  EMAIL_HOST: Joi.string().required(),
  EMAIL_PORT: Joi.number().default(587),
  EMAIL_SECURE: Joi.boolean().truthy('true').truthy('1').falsy('false').falsy('0').default(false),
  EMAIL_USER: Joi.string().email().required(),
  EMAIL_PASS: Joi.string().required(),
  EMAIL_FROM: Joi.string().email().optional(),
  EMAIL_REPLY_TO: Joi.string().email().optional(),
  AUTO_APPROVE_PENDING_ADS: Joi.boolean().truthy('true').truthy('1').falsy('false').falsy('0').default(true),
  AUTO_APPROVE_PENDING_ADS_AFTER_MINUTES: Joi.number().positive().default(10),
  AUTO_APPROVE_PENDING_ADS_INTERVAL_SECONDS: Joi.number().positive().default(60),
}).unknown();

const { error, value } = envSchema.validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

export default value;

