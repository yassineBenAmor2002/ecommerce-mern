import asyncHandler from 'express-async-handler';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import ErrorResponse from '../utils/errorResponse.js';
import { calculateCartTotals } from '../utils/cartUtils.js';

// @desc    Get user's cart
// @route   GET /api/v1/cart
// @access  Private
export const getCart = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user.id })
    .populate('items.product', 'name price images countInStock')
    .populate('shippingAddress');

  if (!cart) {
    // Create a new cart if one doesn't exist
    const newCart = await Cart.create({
      user: req.user.id,
      items: [],
    });
    return res.status(200).json({
      success: true,
      data: newCart,
    });
  }

  // Update cart totals
  await calculateCartTotals(cart);
  await cart.save();

  res.status(200).json({
    success: true,
    data: cart,
  });
});

// @desc    Add item to cart
// @route   POST /api/v1/cart/items
// @access  Private
export const addToCart = asyncHandler(async (req, res, next) => {
  const { productId, qty = 1, color, size } = req.body;

  // Get product
  const product = await Product.findById(productId);
  if (!product) {
    return next(new ErrorResponse('Product not found', 404));
  }

  // Check if product is in stock
  if (product.countInStock <= 0) {
    return next(new ErrorResponse('Product is out of stock', 400));
  }

  // Find user's cart or create new one
  let cart = await Cart.findOne({ user: req.user.id });
  
  if (!cart) {
    cart = await Cart.create({
      user: req.user.id,
      items: [],
    });
  }

  // Check if item already in cart
  const itemIndex = cart.items.findIndex(
    (item) =>
      item.product.toString() === productId &&
      item.color?.code === color?.code &&
      item.size === size
  );

  if (itemIndex > -1) {
    // Update quantity if item exists
    const newQty = cart.items[itemIndex].qty + parseInt(qty);
    
    // Check stock
    if (newQty > product.countInStock) {
      return next(
        new ErrorResponse(
          `Only ${product.countInStock} items available in stock`,
          400
        )
      );
    }
    
    cart.items[itemIndex].qty = newQty;
  } else {
    // Add new item to cart
    cart.items.push({
      product: productId,
      name: product.name,
      image: product.images[0]?.url || '/images/no-image.jpg',
      price: product.salePrice || product.price,
      countInStock: product.countInStock,
      qty: parseInt(qty),
      color,
      size,
    });
  }

  // Calculate cart totals
  await calculateCartTotals(cart);
  await cart.save();

  // Populate product details
  await cart.populate('items.product', 'name price images countInStock');

  res.status(200).json({
    success: true,
    data: cart,
  });
});

// @desc    Update cart item quantity
// @route   PUT /api/v1/cart/items/:itemId
// @access  Private
export const updateCartItem = asyncHandler(async (req, res, next) => {
  const { qty } = req.body;
  const { itemId } = req.params;

  const cart = await Cart.findOne({ user: req.user.id });
  if (!cart) {
    return next(new ErrorResponse('Cart not found', 404));
  }

  const itemIndex = cart.items.findIndex(
    (item) => item._id.toString() === itemId
  );

  if (itemIndex === -1) {
    return next(new ErrorResponse('Item not found in cart', 404));
  }

  // Get product to check stock
  const product = await Product.findById(cart.items[itemIndex].product);
  if (!product) {
    return next(new ErrorResponse('Product not found', 404));
  }

  // Update quantity
  const newQty = parseInt(qty);
  
  // Check stock
  if (newQty > product.countInStock) {
    return next(
      new ErrorResponse(
        `Only ${product.countInStock} items available in stock`,
        400
      )
    );
  }

  if (newQty <= 0) {
    // Remove item if quantity is 0 or less
    cart.items.splice(itemIndex, 1);
  } else {
    cart.items[itemIndex].qty = newQty;
  }

  // Calculate cart totals
  await calculateCartTotals(cart);
  await cart.save();

  // Populate product details
  await cart.populate('items.product', 'name price images countInStock');

  res.status(200).json({
    success: true,
    data: cart,
  });
});

// @desc    Remove item from cart
// @route   DELETE /api/v1/cart/items/:itemId
// @access  Private
export const removeCartItem = asyncHandler(async (req, res, next) => {
  const { itemId } = req.params;

  const cart = await Cart.findOne({ user: req.user.id });
  if (!cart) {
    return next(new ErrorResponse('Cart not found', 404));
  }

  const itemIndex = cart.items.findIndex(
    (item) => item._id.toString() === itemId
  );

  if (itemIndex === -1) {
    return next(new ErrorResponse('Item not found in cart', 404));
  }

  // Remove item from cart
  cart.items.splice(itemIndex, 1);

  // Calculate cart totals
  await calculateCartTotals(cart);
  await cart.save();

  // Populate product details
  await cart.populate('items.product', 'name price images countInStock');

  res.status(200).json({
    success: true,
    data: cart,
  });
});

// @desc    Apply coupon to cart
// @route   POST /api/v1/cart/coupon
// @access  Private
export const applyCoupon = asyncHandler(async (req, res, next) => {
  const { code } = req.body;

  // In a real app, you would validate the coupon against a database
  // This is a simplified example
  const coupon = {
    code: 'WELCOME10',
    discount: 10, // 10% off
    minPurchase: 50, // Minimum purchase of $50
    maxDiscount: 20, // Maximum discount of $20
    expiryDate: new Date('2024-12-31'),
  };

  // Check if coupon is valid
  if (code !== coupon.code) {
    return next(new ErrorResponse('Invalid coupon code', 400));
  }

  if (new Date() > coupon.expiryDate) {
    return next(new ErrorResponse('Coupon has expired', 400));
  }

  // Get user's cart
  let cart = await Cart.findOne({ user: req.user.id });
  if (!cart) {
    return next(new ErrorResponse('Cart not found', 404));
  }

  // Calculate cart total before discount
  const subtotal = cart.items.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );

  // Check minimum purchase
  if (subtotal < coupon.minPurchase) {
    return next(
      new ErrorResponse(
        `Minimum purchase of $${coupon.minPurchase} required to use this coupon`,
        400
      )
    );
  }

  // Calculate discount amount
  let discountAmount = (subtotal * coupon.discount) / 100;
  
  // Apply maximum discount if set
  if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
    discountAmount = coupon.maxDiscount;
  }

  // Apply coupon to cart
  cart.coupon = {
    code: coupon.code,
    discount: coupon.discount,
    discountAmount,
  };

  // Calculate cart totals
  await calculateCartTotals(cart);
  await cart.save();

  // Populate product details
  await cart.populate('items.product', 'name price images countInStock');

  res.status(200).json({
    success: true,
    data: cart,
  });
});

// @desc    Remove coupon from cart
// @route   DELETE /api/v1/cart/coupon
// @access  Private
export const removeCoupon = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user.id });
  if (!cart) {
    return next(new ErrorResponse('Cart not found', 404));
  }

  // Remove coupon
  cart.coupon = undefined;

  // Recalculate cart totals
  await calculateCartTotals(cart);
  await cart.save();

  // Populate product details
  await cart.populate('items.product', 'name price images countInStock');

  res.status(200).json({
    success: true,
    data: cart,
  });
});

// @desc    Update shipping address
// @route   PUT /api/v1/cart/shipping
// @access  Private
export const updateShippingAddress = asyncHandler(async (req, res, next) => {
  const {
    firstName,
    lastName,
    address,
    apartment,
    city,
    country,
    state,
    postalCode,
    phone,
    isDefault,
  } = req.body;

  const cart = await Cart.findOne({ user: req.user.id });
  if (!cart) {
    return next(new ErrorResponse('Cart not found', 404));
  }

  // Update shipping address
  cart.shippingAddress = {
    firstName,
    lastName,
    address,
    apartment,
    city,
    country,
    state,
    postalCode,
    phone,
    isDefault: isDefault || false,
  };

  await cart.save();

  // Populate product details
  await cart.populate('items.product', 'name price images countInStock');

  res.status(200).json({
    success: true,
    data: cart,
  });
});

// @desc    Update payment method
// @route   PUT /api/v1/cart/payment
// @access  Private
// @desc    Update payment method
// @route   PUT /api/v1/cart/payment
// @access  Private
export const updatePaymentMethod = asyncHandler(async (req, res, next) => {
  const { paymentMethod } = req.body;

  // Validate payment method
  const validPaymentMethods = ['credit_card', 'paypal', 'bank_transfer'];
  if (!validPaymentMethods.includes(paymentMethod)) {
    return next(new ErrorResponse('Invalid payment method', 400));
  }

  const cart = await Cart.findOne({ user: req.user.id });
  if (!cart) {
    return next(new ErrorResponse('Cart not found', 404));
  }

  // Update payment method
  cart.paymentMethod = paymentMethod;
  await cart.save();

  // Populate product details
  await cart.populate('items.product', 'name price images countInStock');

  res.status(200).json({
    success: true,
    data: cart,
  });
});

// @desc    Clear cart
// @route   DELETE /api/v1/cart
// @access  Private
export const clearCart = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user.id });
  if (!cart) {
    return next(new ErrorResponse('Cart not found', 404));
  }

  // Clear cart items and reset totals
  cart.items = [];
  cart.coupon = undefined;
  cart.subtotal = 0;
  cart.tax = 0;
  cart.shipping = 0;
  cart.total = 0;

  await cart.save();

  res.status(200).json({
    success: true,
    data: {},
  });
});
