// Order statuses
export const ORDER_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
  FAILED: 'failed',
};

// Payment statuses
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded',
  PARTIALLY_REFUNDED: 'partially_refunded',
};

// Payment methods
export const PAYMENT_METHODS = {
  CREDIT_CARD: 'credit_card',
  PAYPAL: 'paypal',
  BANK_TRANSFER: 'bank_transfer',
  CASH_ON_DELIVERY: 'cash_on_delivery',
};

// Shipping methods
export const SHIPPING_METHODS = {
  STANDARD: 'standard',
  EXPRESS: 'express',
  OVERNIGHT: 'overnight',
  PICKUP: 'pickup',
};

// Default pagination values
export const PAGINATION = {
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
  DEFAULT_PAGE: 1,
};

// Default tax and shipping rates
// These should be overridden by environment variables in production
export const TAX_RATE = process.env.TAX_RATE ? parseFloat(process.env.TAX_RATE) : 0.2; // 20%
export const SHIPPING_RATE = process.env.SHIPPING_RATE ? parseFloat(process.env.SHIPPING_RATE) : 5.99; // $5.99

// Free shipping threshold
export const FREE_SHIPPING_THRESHOLD = process.env.FREE_SHIPPING_THRESHOLD 
  ? parseFloat(process.env.FREE_SHIPPING_THRESHOLD) 
  : 50; // $50

// Currency settings
export const CURRENCY = {
  CODE: process.env.CURRENCY_CODE || 'USD',
  SYMBOL: process.env.CURRENCY_SYMBOL || '$',
  DECIMALS: process.env.CURRENCY_DECIMALS ? parseInt(process.env.CURRENCY_DECIMALS) : 2,
};

// Order number prefix
export const ORDER_NUMBER_PREFIX = process.env.ORDER_NUMBER_PREFIX || 'ORD';

// Default cache TTL (in seconds)
export const CACHE_TTL = {
  SHORT: 60, // 1 minute
  MEDIUM: 3600, // 1 hour
  LONG: 86400, // 1 day
};

// Rate limiting
// These values should be overridden by environment variables in production
export const RATE_LIMIT = {
  WINDOW_MS: process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000, // 15 minutes
  MAX_REQUESTS: process.env.RATE_LIMIT_MAX_REQUESTS || 100, // Limit each IP to 100 requests per windowMs
};

// File upload limits
export const UPLOAD_LIMITS = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
};

// Default user roles
export const USER_ROLES = {
  ADMIN: 'admin',
  CUSTOMER: 'customer',
  GUEST: 'guest',
};

// Password requirements
export const PASSWORD_REQUIREMENTS = {
  MIN_LENGTH: 8,
  REQUIRE_NUMBERS: true,
  REQUIRE_SYMBOLS: true,
  REQUIRE_UPPERCASE: true,
  REQUIRE_LOWERCASE: true,
};

// Session settings
export const SESSION = {
  SECRET: process.env.SESSION_SECRET || 'your-session-secret',
  COOKIE_MAX_AGE: 30 * 24 * 60 * 60 * 1000, // 30 days
  SAVE_UNINITIALIZED: false,
  RESAVE: false,
  SECURE: process.env.NODE_ENV === 'production',
  HTTP_ONLY: true,
  SAME_SITE: 'lax',
};

// CORS settings
export const CORS_OPTIONS = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      'http://localhost:3000',
      'http://localhost:3001',
      'https://stripe.com',
    ];

    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'stripe-signature',
    'Accept',
    'Origin',
  ],
};

// Export all constants as default
export default {
  ORDER_STATUS,
  PAYMENT_STATUS,
  PAYMENT_METHODS,
  SHIPPING_METHODS,
  PAGINATION,
  TAX_RATE,
  SHIPPING_RATE,
  FREE_SHIPPING_THRESHOLD,
  CURRENCY,
  ORDER_NUMBER_PREFIX,
  CACHE_TTL,
  RATE_LIMIT,
  UPLOAD_LIMITS,
  USER_ROLES,
  PASSWORD_REQUIREMENTS,
  SESSION,
  CORS_OPTIONS,
};
