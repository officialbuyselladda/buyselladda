import rateLimit from 'express-rate-limit';

const defaultHandler = (req, res, next, options) => {
  res.status(options.statusCode).json({
    success: false,
    message: options.message?.message || 'Too many requests, please try again later.',
  });
};

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  handler: defaultHandler,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
  },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: defaultHandler,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again later.',
  },
});

export const createProductPostLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5, // max 5 product posts in 10 min per user
  keyGenerator: (req) => req.user?._id?.toString() || req.ip,
  standardHeaders: true,
  legacyHeaders: false,
  handler: defaultHandler,
  message: {
    success: false,
    message: 'Posting limit exceeded: You can post up to 5 products in 10 minutes. Please try again later.',
  },
});

export default limiter;

