import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import rateLimiter from './middleware/rateLimiter.js';
import errorHandler from './middleware/error.middleware.js';
import routes from './routes.js';
import envConfig from './config/env.js';

const app = express();
app.set('trust proxy', 1);
app.set('etag', false);

const defaultAllowedOrigins = [
  'https://buyselladda.com',
  'https://www.buyselladda.com',
  'http://buyselladda.com',
  'http://www.buyselladda.com',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
  'http://72.60.102.36',
  'http://72.60.102.36:5173',
  'http://72.60.102.36:5003',
];

const allowedOrigins = new Set([
  ...defaultAllowedOrigins,
  ...(process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
]);

const isAllowedOrigin = (origin = '') => {
  if (!origin) return true;
  if (allowedOrigins.has(origin)) return true;
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
};

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(morgan('dev'));
app.use(cors({
  origin: function (origin, callback) {
    return callback(null, isAllowedOrigin(origin));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control', 'Pragma', 'Expires']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(rateLimiter);
app.use('/uploads', express.static(path.resolve(process.cwd(), envConfig.UPLOAD_DIR || 'uploads'), {
  maxAge: '30d',
  immutable: true,
}));

// Routes
app.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});
app.use('/api', routes);

// Error handler
app.use(errorHandler);

export default app;

