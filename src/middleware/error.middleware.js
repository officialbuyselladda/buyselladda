const errorHandler = (err, req, res, next) => {
  // Log full error for debugging
  console.error('=== ERROR HANDLER ===');
  console.error('Message:', err.message);
  console.error('Stack:', err.stack);
  console.error('Original:', err.originalError || 'N/A');
  console.error('Request URL:', req.originalUrl);
  console.error('====================');

  let statusCode = err.statusCode || 500;
  let message = 'Something went wrong';

  // Specific MongoDB errors
  if (err.name === 'MongoServerError') {
    if (err.code === 11000) {
      statusCode = 409;
      message = 'Duplicate entry';
    } else if (err.code === 66) {
      statusCode = 503;
      message = 'Database index error';
    } else {
      statusCode = 503;
      message = 'Database service unavailable';
    }
  } else if (err.name === 'MongoNetworkError') {
    statusCode = 503;
    message = 'Database connection failed';
  } else if (err.message.includes('$geoNear') || err.message.includes('2dsphere')) {
    statusCode = 503;
    message = 'Geospatial query unavailable - using nationwide search';
  } else if (err.message.includes('aggregate') || err.message.includes('pipeline')) {
    statusCode = 503;
    message = 'Data aggregation service temporarily unavailable';
  } else if (err.name === 'CastError') {
    statusCode = 404;
    message = 'Resource not found';
  } else if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  // Auth specific errors
  } else if (err.message === 'User already exists') {
    statusCode = 409;
    message = 'User already exists';
  } else if (err.message === 'Invalid credentials') {
    statusCode = 401;
    message = 'Invalid credentials';
  // Joi validation from controllers
  } else if (err.message && err.message.includes('"' ) && err.statusCode === 400) {
    statusCode = 400;
    message = err.message;
  } else if (statusCode < 500 && err.message && !err.message.includes('secret')) {
    // Preserve safe business messages for 4xx errors (non-sensitive)
    message = err.message;
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { errorName: err.name, details: err.message }),
  });
};

export default errorHandler;

