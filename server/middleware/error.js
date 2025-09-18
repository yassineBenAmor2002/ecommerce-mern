// Error handling middleware
const errorHandler = (err, req, res, next) => {
  // Default error status code and message
  let error = { ...err };
  error.message = err.message;

  // Log to console for development
  console.error(err.stack);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = `Resource not found with id of ${err.value}`;
    error = new Error(message);
    error.statusCode = 404;
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = new Error(message);
    error.statusCode = 400;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message);
    error = new Error(message);
    error.statusCode = 400;
  }
  
  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = new Error(message);
    error.statusCode = 401;
  }
  
  if (err.name === 'TokenExpiredError') {
    const message = 'Token has expired';
    error = new Error(message);
    error.statusCode = 401;
  }
  
  // Passport errors
  if (err.oauthError) {
    error.statusCode = 401;
    error.message = err.message || 'Authentication failed';
  }

  const statusCode = error.statusCode || 500;
  const message = error.message || 'Server Error';
  
  // If this is an API request, return JSON
  if (req.originalUrl.startsWith('/api/')) {
    return res.status(statusCode).json({
      success: false,
      error: message
    });
  }
  
  // For OAuth callbacks, redirect to the frontend with error
  if (req.originalUrl.includes('/auth/')) {
    const redirectUrl = `${process.env.FRONTEND_URL}/login?error=${encodeURIComponent(message)}`;
    return res.redirect(redirectUrl);
  }
  
  // Default error response
  res.status(statusCode).json({
    success: false,
    error: message
  });
};

// Handle Passport authentication errors
export const handlePassportError = (err, req, res, next) => {
  if (err) {
    console.error('Passport Error:', err);
    
    // Handle different types of Passport errors
    if (err.oauthError) {
      // OAuth error
      const error = new Error(err.oauthError.message || 'OAuth authentication failed');
      error.statusCode = 401;
      return next(error);
    }
    
    // Default authentication error
    const error = new Error(err.message || 'Authentication failed');
    error.statusCode = 401;
    return next(error);
  }
  next();
};

export default errorHandler;
