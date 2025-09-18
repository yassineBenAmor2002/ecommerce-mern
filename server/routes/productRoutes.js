import express from 'express';
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  productPhotoUpload,
  getTopProducts,
  getProductsByCategory,
  updateProductStock,
  bulkCreateProducts,
  bulkUpdateProducts,
  bulkDeleteProducts,
  getProductStats,
  getProductSalesAnalytics,
  getInventoryValuation,
  getFeaturedProducts
} from '../controllers/productController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/top', getTopProducts);
router.get('/featured', getFeaturedProducts);
router.get('/category/:categoryId', getProductsByCategory);
router.get('/:id', getProduct);

// Protected routes (require authentication and authorization)
router.use(protect);

// Admin-only routes
router.use(authorize('admin'));

// Single product operations
router.post('/', createProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);
router.put('/:id/photo', productPhotoUpload);
router.put('/:id/stock', updateProductStock);

// Bulk operations
router.post('/bulk', bulkCreateProducts);
router.put('/bulk', bulkUpdateProducts);
router.delete('/bulk', bulkDeleteProducts);

// Analytics and statistics
router.get('/stats', getProductStats);
router.get('/analytics/sales', getProductSalesAnalytics);
router.get('/analytics/inventory-valuation', getInventoryValuation);

export default router;
