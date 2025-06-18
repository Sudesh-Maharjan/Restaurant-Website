const express = require('express');
const { 
  getOrders, 
  getOrder, 
  createOrder, 
  updateOrderStatus, 
  updatePaymentStatus,
  deleteOrder,
  getMyOrders
} = require('../controllers/order');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all orders - admin only
router.route('/')
  .get(protect, authorize('admin'), getOrders)
  .post(createOrder);

// Get user's own orders
router.route('/my-orders')
  .get(protect, getMyOrders);

router.route('/:id')
  .get(protect, getOrder)
  .delete(protect, authorize('admin'), deleteOrder);

// Update order status - admin only
router.route('/:id/status')
  .put(protect, authorize('admin'), updateOrderStatus);

// Update payment status - admin only
router.route('/:id/payment')
  .put(protect, authorize('admin'), updatePaymentStatus);

module.exports = router;
