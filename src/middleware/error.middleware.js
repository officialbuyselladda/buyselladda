const errorHandler = (err, req, res, next) => {
  // Log full error for debugging
  console.error('=== ERROR HANDLER ===');
  console.error('Message:', err.message);
  console.error('Stack:', err.stack);
  console.error('Original:', err.originalError || 'N/A');
  console.error('====================');

  let error = { ...err };
  error.message = err.message;

  if (err.name === 'CastError') {
    const castError = {
      success: false,
      statusCode: 404,
      message: 'Resource not found',
    };
    res.status(castError.statusCode).json(castError);
    return;
  }

  // Handle ValidationError, JsonWebTokenError, etc.
  if (err.name === 'ValidationError') {
    error.message = 'Validation failed';
    error.statusCode = 400;
  } else if (err.name === 'JsonWebTokenError') {
    error.message = 'Invalid token';
    error.statusCode = 401;
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Server Error',
  });
};

export default errorHandler;

