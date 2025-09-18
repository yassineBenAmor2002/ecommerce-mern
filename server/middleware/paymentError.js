import ErrorResponse from '../utils/errorResponse.js';

export const handlePaymentError = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log to console for dev
  console.error('Payment Error Handler:', err);

  // Handle Stripe errors
  if (err.type === 'StripeCardError') {
    // A declined card, etc.
    const message = `Payment failed: ${err.message}`;
    error = new ErrorResponse(message, 402); // 402 Payment Required
  } else if (err.type === 'StripeRateLimitError') {
    // Too many requests made to the API too quickly
    const message = 'Too many requests. Please try again later.';
    error = new ErrorResponse(message, 429); // 429 Too Many Requests
  } else if (err.type === 'StripeInvalidRequestError') {
    // Invalid parameters were supplied to Stripe's API
    const message = 'Invalid payment parameters. Please check your information and try again.';
    error = new ErrorResponse(message, 400);
  } else if (err.type === 'StripeAPIError') {
    // An error occurred internally with Stripe's API
    const message = 'Payment service is currently unavailable. Please try again later.';
    error = new ErrorResponse(message, 503); // 503 Service Unavailable
  } else if (err.type === 'StripeConnectionError') {
    // Network communication with Stripe failed
    const message = 'Unable to connect to payment service. Please check your internet connection and try again.';
    error = new ErrorResponse(message, 503);
  } else if (err.type === 'StripeAuthenticationError') {
    // Authentication with Stripe's API failed (maybe you changed API keys recently)
    const message = 'Payment authentication failed. Please contact support.';
    error = new ErrorResponse(message, 500);
  } else if (err.code === 'payment_intent_authentication_failure') {
    // The payment attempt failed due to an authentication issue
    const message = 'Payment authentication failed. Please try a different payment method.';
    error = new ErrorResponse(message, 402);
  } else if (err.code === 'card_declined') {
    // The card has been declined
    const message = `Your card was declined: ${err.decline_code || 'Insufficient funds or card limit reached'}`;
    error = new ErrorResponse(message, 402);
  } else if (err.code === 'expired_card') {
    // The card has expired
    const message = 'Your card has expired. Please use a different payment method.';
    error = new ErrorResponse(message, 400);
  } else if (err.code === 'amount_too_small') {
    // The payment amount is too small
    const message = 'The payment amount is too small. Minimum amount is $0.50.';
    error = new ErrorResponse(message, 400);
  } else if (err.code === 'currency_not_supported') {
    // The currency is not supported
    const message = 'The selected currency is not supported. Please try a different payment method.';
    error = new ErrorResponse(message, 400);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Payment processing failed',
  });
};

export const withPaymentErrorHandling = (fn) => async (req, res, next) => {
  try {
    await fn(req, res, next);
  } catch (error) {
    next(error);
  }
};
