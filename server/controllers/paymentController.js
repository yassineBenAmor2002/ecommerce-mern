import Stripe from 'stripe';
import asyncHandler from 'express-async-handler';
import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import ErrorResponse from '../utils/errorResponse.js';
import { withPaymentErrorHandling } from '../middleware/paymentError.js';
import { PAYMENT_STATUS, ORDER_STATUS } from '../config/constants.js';
import { emailService } from '../services/index.js';

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// @desc    Create payment intent
// @route   POST /api/v1/payments/create-payment-intent
// @access  Private
export const createPaymentIntent = withPaymentErrorHandling(async (req, res, next) => {
  const { orderId } = req.body;

  try {
    // Get the order with populated product details
    const order = await Order.findById(orderId)
      .populate('orderItems.product', 'name price countInStock')
      .populate('user', 'name email');
    
    if (!order) {
      return next(new ErrorResponse('Order not found', 404));
    }

    // Verify the order belongs to the user
    if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ErrorResponse('Not authorized to pay for this order', 401));
    }

    // Check if order is already paid
    if (order.isPaid) {
      return next(new ErrorResponse('Order has already been paid', 400));
    }

    // Validate order items and stock
    for (const item of order.orderItems) {
      const product = await Product.findById(item.product);
      if (!product) {
        return next(new ErrorResponse(`Product ${item.product} not found`, 404));
      }
      if (product.countInStock < item.qty) {
        return next(new ErrorResponse(`Not enough stock for ${product.name}`, 400));
      }
    }

    // Calculate total amount including tax and shipping
    const totalAmount = Math.round(order.totalPrice * 100); // Convert to cents

    // Create or update payment intent
    let paymentIntent;
    if (order.paymentIntentId) {
      // Update existing payment intent
      paymentIntent = await stripe.paymentIntents.update(order.paymentIntentId, {
        amount: totalAmount,
        metadata: {
          orderId: order._id.toString(),
          userId: req.user.id,
          email: order.user.email,
        },
      });
    } else {
      // Create new payment intent
      paymentIntent = await stripe.paymentIntents.create({
        amount: totalAmount,
        currency: 'usd',
        metadata: {
          orderId: order._id.toString(),
          userId: req.user.id,
          email: order.user.email,
        },
        receipt_email: order.user.email,
        shipping: order.shippingAddress ? {
          name: order.shippingAddress.fullName,
          address: {
            line1: order.shippingAddress.address,
            city: order.shippingAddress.city,
            postal_code: order.shippingAddress.postalCode,
            country: order.shippingAddress.country,
          },
        } : undefined,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      // Save payment intent ID to order
      order.paymentIntentId = paymentIntent.id;
      await order.save();
    }

    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      orderId: order._id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return next(new ErrorResponse('Error creating payment intent', 500));
  }
});

// @desc    Process webhook from Stripe
// @route   POST /api/v1/payments/webhook
// @access  Public
export const webhookHandler = withPaymentErrorHandling(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Log webhook event
  console.log(`Received webhook event: ${event.type}`);

  try {
    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object);
        break;
      case 'charge.succeeded':
        await handleChargeSucceeded(event.data.object);
        break;
      case 'charge.refunded':
        await handleRefund(event.data.object);
        break;
      case 'payment_intent.canceled':
        await handlePaymentIntentCanceled(event.data.object);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  } catch (error) {
    console.error(`Error handling webhook event ${event.type}:`, error);
    // Don't return error to Stripe to prevent retries for non-critical errors
  }

  // Return a 200 response to acknowledge receipt of the event
  res.status(200).json({ received: true });
});

// Helper function to handle successful payment intent
const handlePaymentIntentSucceeded = async (paymentIntent) => {
  const { orderId, userId, email } = paymentIntent.metadata;
  
  // Find the order
  const order = await Order.findById(orderId)
    .populate('user', 'name email')
    .populate('orderItems.product', 'name price');
  
  if (!order) {
    console.error(`Order ${orderId} not found`);
    return;
  }

  // Skip if already processed
  if (order.isPaid) {
    console.log(`Order ${orderId} is already marked as paid`);
    return;
  }

  // Update order status
  order.isPaid = true;
  order.paidAt = Date.now();
  order.status = ORDER_STATUS.PROCESSING;
  
  // Update payment result
  order.paymentResult = {
    id: paymentIntent.id,
    status: PAYMENT_STATUS.COMPLETED,
    payment_method: paymentIntent.payment_method_types?.[0] || 'card',
    payment_provider: 'stripe',
    amount_paid: paymentIntent.amount / 100, // Convert back to dollars
    currency: paymentIntent.currency,
    transaction_id: paymentIntent.latest_charge || paymentIntent.id,
    transaction_time: new Date(),
    receipt_url: paymentIntent.charges?.data?.[0]?.receipt_url,
  };

  // Save the updated order
  await order.save();
  
  // Send order confirmation email using the queue
  try {
    await emailService.sendOrderConfirmation(order, order.user);
  } catch (error) {
    console.error('Error queueing order confirmation email:', error);
  }

  order.isPaid = true;
  order.paidAt = Date.now();
  order.status = 'processing';
  
  order.paymentResult = {
    id: paymentIntent.id,
    status: 'completed',
    payment_method: paymentIntent.payment_method_types[0],
    payment_provider: 'stripe',
    amount_paid: paymentIntent.amount / 100, // Convert back to dollars
    currency: paymentIntent.currency,
    transaction_id: paymentIntent.id,
    transaction_time: new Date(paymentIntent.created * 1000),
    receipt_url: paymentIntent.charges?.data[0]?.receipt_url,
    email_address: paymentIntent.receipt_email,
  };

  await order.save();
  
  // Clear the user's cart
  await Cart.findOneAndUpdate(
    { user: order.user },
    { $set: { items: [] } }
  );
};

// Helper function to handle failed payment intent
const handlePaymentIntentFailed = async (paymentIntent) => {
  const { orderId, userId, email } = paymentIntent.metadata;
  
  // Find the order
  const order = await Order.findById(orderId)
    .populate('user', 'name email');
  
  if (!order) {
    console.error(`Order ${orderId} not found`);
    return;
  }
  
  // Skip if already marked as failed
  if (order.paymentResult?.status === PAYMENT_STATUS.FAILED) {
    return;
  }
  
  // Get the error message
  const errorMessage = paymentIntent.last_payment_error?.message || 'Payment failed';
  
  // Update payment result
  order.paymentResult = {
    id: paymentIntent.id,
    status: PAYMENT_STATUS.FAILED,
    error: errorMessage,
    payment_method: paymentIntent.payment_method_types?.[0],
    payment_provider: 'stripe',
    amount: paymentIntent.amount / 100,
    currency: paymentIntent.currency,
    transaction_time: new Date(),
  };
  
  // Save the updated order
  await order.save();
  
  // Send payment failed email using the queue
  try {
    await emailService.sendPaymentFailed(order, order.user, errorMessage);
  } catch (error) {
    console.error('Error queueing payment failed email:', error);
  }
};

// Helper function to handle successful charge
const handleChargeSucceeded = async (charge) => {
  // This is already handled by payment_intent.succeeded
  console.log(`Charge succeeded: ${charge.id}`);
};

// Helper function to handle canceled payment intent
const handlePaymentIntentCanceled = async (paymentIntent) => {
  const { orderId } = paymentIntent.metadata;
  
  const order = await Order.findById(orderId);
  if (!order) return;
  
  // Only update if not already processed
  if (order.status !== ORDER_STATUS.CANCELLED) {
    order.status = ORDER_STATUS.CANCELLED;
    order.cancelledAt = new Date();
    order.cancellationReason = paymentIntent.cancellation_reason || 'Payment canceled';
    
    // Restore product stock
    for (const item of order.orderItems) {
      await Product.updateOne(
        { _id: item.product },
        { 
          $inc: { 
            countInStock: item.qty,
            sold: -item.qty
          } 
        }
      );
    }
    
    await order.save();
  }
};

// Helper function to handle refunds
const handleRefund = async (charge) => {
  // Find the order by charge ID
  const order = await Order.findOne({ 'paymentResult.transaction_id': charge.payment_intent });
  
  if (!order) {
    console.error(`Order not found for charge: ${charge.id}`);
    return;
    order.paymentResult.refunds = [];
  }
  
  order.paymentResult.refunds.push({
    amount: charge.amount_refunded / 100,
    reason: 'Refund processed',
    status: charge.refunded ? 'succeeded' : 'pending',
    receipt_number: charge.receipt_number,
  });

  await order.save();
};
