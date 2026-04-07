import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimiter from './middleware/rateLimiter.js';
import errorHandler from './middleware/error.middleware.js';
import routes from './routes.js';
import envConfig from './config/env.js';

const app = express();

// Middleware
app.use(helmet());
app.use(morgan('dev'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(rateLimiter);

// Routes
app.use('/api', routes);

// Error handler
app.use(errorHandler);

export default app;

