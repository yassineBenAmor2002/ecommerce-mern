import express from 'express';
import { protect } from '../middleware/auth.js';
import { createPaymentIntent, webhookHandler } from '../controllers/paymentController.js';

const router = express.Router();

// Protected routes (require authentication)
router.use(protect);

// Create payment intent
router.post('/create-payment-intent', createPaymentIntent);

// Webhook handler (public route for Stripe)
router.post('/webhook', express.raw({ type: 'application/json' }), webhookHandler);

export default router;
