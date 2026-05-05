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
      // Check if it's a product duplicate (contains 'contentHash' or 'user_1_contentHash')
      if (err.message && (err.message.includes('contentHash') || err.message.includes('user_1_contentHash'))) {
        statusCode = 409;
        message = 'A similar product already exists. Please modify your title or description and try again.';
      } else {
        statusCode = 409;
        message = 'This email is already registered. Please login or use a different email.';
      }
    } else if (err.code === 66) {
      statusCode = 503;
      message = 'Database index error. Please try again.';
    } else {
      statusCode = 503;
      message = 'Database service unavailable. Please try again later.';
    }
  } else if (err.name === 'MongoNetworkError') {
    statusCode = 503;
    message = 'Cannot connect to database. Please check your internet connection.';
  } else if (err.name === 'MongooseError') {
    statusCode = 503;
    message = 'Database connection error. Please try again later.';
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
    message = err.message || 'Validation failed. Please check your input.';
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid or expired token. Please login again.';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Your session has expired. Please login again.';
  // Auth specific errors
  } else if (err.message === 'User already exists') {
    statusCode = 409;
    message = 'This email is already registered. Please login or use a different email.';
  } else if (err.message === 'Invalid credentials') {
    statusCode = 401;
    message = 'Invalid email or password. Please try again.';
  } else if (err.message === 'Password required') {
    statusCode = 400;
    message = 'Password is required. Please provide your password.';
  } else if (err.message === 'Duplicate product detected') {
    statusCode = 409;
    message = 'A similar product already exists. Please modify your title or description and try again.';
  } else if (err.message && err.message.includes('duplicate key')) {
    // Generic duplicate key error - check context
    if (err.message.includes('contentHash') || err.message.includes('user_1')) {
      statusCode = 409;
      message = 'A similar product already exists. Please modify your title or description and try again.';
    } else {
      statusCode = 409;
      message = 'This email is already registered. Please login or use a different email.';
    }
  } else if (err.message.includes('password') && err.message.includes('invalid')) {
    statusCode = 400;
    message = 'Invalid password format. Password must be at least 6 characters.';
  // Joi validation from controllers
  } else if (err.message && err.message.includes('"') && err.statusCode === 400) {
    statusCode = 400;
    message = err.message;
  } else if (statusCode < 500 && err.message && !err.message.includes('secret')) {
    // Preserve safe business messages for 4xx errors (non-sensitive)
    message = err.message;
  } else if (statusCode === 500 && process.env.NODE_ENV !== 'development') {
    // For production 500 errors, give a friendly message
    message = 'Server error. Please try again later.';
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { errorName: err.name, details: err.message }),
  });
};

export default errorHandler;
