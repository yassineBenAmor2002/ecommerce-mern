import express from 'express';
import {
  createOrder,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
  getMyOrders,
  getOrders,
  updateOrderStatus,
  getSalesReport,
  getOrderStats,
} from '../controllers/orderController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// Protected routes (require authentication)
router.use(protect);

// User order routes
router.route('/')
  .post(createOrder);

router.route('/myorders')
  .get(getMyOrders);

router.route('/:id')
  .get(getOrderById);

router.route('/:id/pay')
  .put(updateOrderToPaid);

// Admin routes (require admin role)
router.use(admin);

router.route('/')
  .get(getOrders);

router.route('/:id/deliver')
  .put(updateOrderToDelivered);

router.route('/:id/status')
  .put(updateOrderStatus);

router.route('/analytics/sales')
  .get(getSalesReport);

router.route('/analytics/stats')
  .get(getOrderStats);

export default router;
