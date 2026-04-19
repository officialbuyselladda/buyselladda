const errorHandler = (err, req, res, next) => {
  // Log full error for debugging
  console.error('=== ERROR HANDLER ===');
  console.error('Message:', err.message);
  console.error('Stack:', err.stack);
  console.error('Original:', err.originalError || 'N/A');
  console.error('====================');

  let statusCode = err.statusCode || 500;
  let message = 'Something went wrong';

  // Known operational errors
  if (err.name === 'CastError') {
    statusCode = 404;
    message = 'Resource not found';
  } else if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  } else if (statusCode < 500 && err.message) {
    // Preserve safe business messages for 4xx errors
    message = err.message;
  }

  res.status(statusCode).json({
    success: false,
    message,
  });
};

export default errorHandler;

