import asyncHandler from 'express-async-handler';
import Stripe from 'stripe';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Cart from '../models/Cart.js';
import ErrorResponse from '../utils/errorResponse.js';
import { formatCurrency } from '../utils/format.js';
import { ORDER_STATUS, PAYMENT_STATUS, PAYMENT_METHODS } from '../config/constants.js';
import { emailService } from '../services/index.js';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// @desc    Create new order from cart
// @route   POST /api/orders
// @access  Private
export const createOrder = asyncHandler(async (req, res, next) => {
  // Get cart
  const cart = await Cart.findOne({ user: req.user._id })
    .populate('items.product', 'name price countInStock')
    .populate('shippingAddress');

  if (!cart || cart.items.length === 0) {
    return next(new ErrorResponse('No items in cart', 400));
  }

  // Calculate order totals
  const itemsPrice = cart.items.reduce((acc, item) => {
    return acc + item.price * item.qty;
  }, 0);

  const taxPrice = itemsPrice * 0.2; // 20% tax
  const shippingPrice = itemsPrice > 50 ? 0 : 10; // Free shipping over $50
  const totalPrice = itemsPrice + taxPrice + shippingPrice;

  // Create order items array
  const orderItems = cart.items.map(item => ({
    name: item.product.name,
    qty: item.qty,
    image: item.product.images[0],
    price: item.price,
    product: item.product._id,
    color: item.color,
    size: item.size,
  }));

  // Create order
  const order = new Order({
    user: req.user._id,
    orderItems,
    shippingAddress: cart.shippingAddress,
    paymentMethod: cart.paymentMethod || PAYMENT_METHODS.CREDIT_CARD,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    status: ORDER_STATUS.PENDING,
  });

  // Validate and update product stock
  for (const item of order.orderItems) {
    const product = await Product.findById(item.product);
    
    if (!product) {
      throw new ErrorResponse(`Product ${item.product} not found`, 404);
    }

    if (product.countInStock < item.qty) {
      throw new ErrorResponse(`Not enough stock for ${product.name}`, 400);
    }

    // Update product stock
    product.countInStock -= item.qty;
    product.sold += item.qty;
    await product.save();
  }

  // Save order
  const createdOrder = await order.save();
  
  // Clear the user's cart
  await Cart.findOneAndUpdate(
    { user: req.user._id },
    { $set: { items: [] } }
  );
  
  // Send order confirmation email using the queue
  try {
    await emailService.sendOrderConfirmation(createdOrder, req.user);
  } catch (error) {
    console.error('Error queueing order confirmation email:', error);
  }

  // If payment method is credit card, create payment intent
  if (createdOrder.paymentMethod === PAYMENT_METHODS.CREDIT_CARD) {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(createdOrder.totalPrice * 100), // Convert to cents
        currency: 'usd',
        metadata: {
          orderId: createdOrder._id.toString(),
          userId: req.user._id.toString(),
        },
        description: `Order #${createdOrder.orderNumber}`,
      });

      // Update order with payment intent
      createdOrder.paymentIntentId = paymentIntent.id;
      await createdOrder.save();

      res.status(201).json({
        success: true,
        order: createdOrder,
        clientSecret: paymentIntent.client_secret,
      });
      return;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      return next(new ErrorResponse('Error processing payment', 500));
    }
  }
  
  res.status(201).json({
    success: true,
    order: createdOrder,
  });
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'name email');

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Check if user is authorized to view this order
  if (order.user._id.toString() !== req.user._id.toString() && !req.user.isAdmin) {
    res.status(401);
    throw new Error('Not authorized to view this order');
  }

  res.json(order);
});

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
export const updateOrderToPaid = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Check if user is authorized to update this order
  if (order.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
    res.status(401);
    throw new Error('Not authorized to update this order');
  }

  order.isPaid = true;
  order.paidAt = Date.now();
  order.paymentResult = {
    id: req.body.id,
    status: req.body.status,
    update_time: req.body.update_time,
    email_address: req.body.payer.email_address,
  };

  const updatedOrder = await order.save();
  
  // Send payment confirmation email
  try {
    await emailService.sendTemplateEmail('PAYMENT_CONFIRMATION', {
      order: updatedOrder,
      user: req.user,
      paymentDetails: updatedOrder.paymentResult
    });
  } catch (error) {
    console.error('Error queueing payment confirmation email:', error);
  }
  
  res.json(updatedOrder);
});

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
export const updateOrderToDelivered = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  order.isDelivered = true;
  order.deliveredAt = Date.now();

  const updatedOrder = await order.save();
  
  // Send shipping confirmation email
  try {
    await emailService.sendTemplateEmail('ORDER_SHIPPED', {
      order: updatedOrder,
      user: req.user,
      trackingInfo: updatedOrder.trackingInfo || {}
    });
  } catch (error) {
    console.error('Error queueing shipping confirmation email:', error);
  }
  
  res.json(updatedOrder);
});

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
export const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({})
    .populate('user', 'id name')
    .sort({ createdAt: -1 });
  
  res.json(orders);
});

// @desc    Get logged in user's orders
// @route   GET /api/orders/myorders
// @access  Private
export const getMyOrders = asyncHandler(async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate('user', 'name email')
      .populate({
        path: 'orderItems.product',
        select: 'name image price',
      });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error('Error in getMyOrders:', error);
    next(new ErrorResponse('Server error while fetching orders', 500));
  }
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;
  
  const validStatuses = [
    'pending',
    'processing',
    'shipped',
    'delivered',
    'cancelled',
    'refunded',
  ];

  if (!validStatuses.includes(status)) {
    res.status(400);
    throw new Error('Invalid order status');
  }

  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Update order status
  order.status = status;
  
  // Set deliveredAt if status is delivered
  if (status === 'delivered' && !order.deliveredAt) {
    order.deliveredAt = Date.now();
  }
  
  // Set paidAt if status is processing and not yet paid
  if (status === 'processing' && !order.paidAt) {
    order.isPaid = true;
    order.paidAt = Date.now();
  }

  const updatedOrder = await order.save();

  // Send status update email to customer
  try {
    const email = new Email({
      to: order.user.email,
      subject: `Order #${order._id} Status Update`,
      template: 'orderStatusUpdate',
      context: {
        name: order.user.name,
        order: updatedOrder,
        status: status.charAt(0).toUpperCase() + status.slice(1),
        orderUrl: `${process.env.FRONTEND_URL}/orders/${order._id}`,
        supportEmail: process.env.EMAIL_SUPPORT,
      },
    });
    
    await email.send();
  } catch (error) {
    console.error('Failed to send status update email:', error);
    // Don't fail the request if email fails
  }

  res.json(updatedOrder);
});

// @desc    Get monthly sales report
// @route   GET /api/orders/sales
// @access  Private/Admin
export const getSalesReport = asyncHandler(async (req, res, next) => {
  const { startDate, endDate } = req.query;
  
  const match = {};
  
  // Add date filter if provided
  if (startDate && endDate) {
    match.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  }

  const sales = await Order.aggregate([
    {
      $match: {
        ...match,
        isPaid: true,
      },
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
        },
        totalSales: { $sum: '$totalPrice' },
        numOrders: { $sum: 1 },
        averageOrder: { $avg: '$totalPrice' },
      },
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1 },
    },
  ]);

  res.json(sales);
});

// @desc    Get order statistics
// @route   GET /api/orders/stats
// @access  Private/Admin
export const getOrderStats = asyncHandler(async (req, res, next) => {
  const stats = await Order.aggregate([
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalSales: { $sum: '$totalPrice' },
        avgOrderValue: { $avg: '$totalPrice' },
        minOrder: { $min: '$totalPrice' },
        maxOrder: { $max: '$totalPrice' },
      },
    },
  ]);

  const statusStats = await Order.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        total: { $sum: '$totalPrice' },
      },
    },
  ]);

  res.json({
    ...stats[0],
    statusStats,
  });
});
