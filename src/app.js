import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimiter from './middleware/rateLimiter.js';
import errorHandler from './middleware/error.middleware.js';
import routes from './routes.js';
import envConfig from './config/env.js';

const app = express();

// Dynamic CORS origin for production
const isProduction = process.env.NODE_ENV === 'production';
const allowedOrigins = isProduction 
  ? ['https://dealkro.in', 'https://www.dealkro.in'] 
  : ['http://localhost:5173', 'http://localhost:3000', 'http://72.60.102.36:5173'];

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(morgan('dev'));
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      return callback(new Error('Not allowed by CORS'), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(rateLimiter);

// Routes
app.use('/api', routes);

// Error handler
app.use(errorHandler);

export default app;

