import express from 'express';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  applyCoupon,
  removeCoupon,
  updateShippingAddress,
  updatePaymentMethod,
  clearCart,
} from '../controllers/cartController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected (require authentication)
router.use(protect);

// GET /api/v1/cart - Get user's cart
// POST /api/v1/cart/items - Add item to cart
// PUT /api/v1/cart/items/:itemId - Update cart item quantity
// DELETE /api/v1/cart/items/:itemId - Remove item from cart
// POST /api/v1/cart/coupon - Apply coupon to cart
// DELETE /api/v1/cart/coupon - Remove coupon from cart
// PUT /api/v1/cart/shipping - Update shipping address
// PUT /api/v1/cart/payment - Update payment method
// DELETE /api/v1/cart - Clear cart
router
  .route('/')
  .get(getCart)
  .delete(clearCart);

router
  .route('/items')
  .post(addToCart);

router
  .route('/items/:itemId')
  .put(updateCartItem)
  .delete(removeCartItem);

router
  .route('/coupon')
  .post(applyCoupon)
  .delete(removeCoupon);

router
  .route('/shipping')
  .put(updateShippingAddress);

router
  .route('/payment')
  .put(updatePaymentMethod);

export default router;
