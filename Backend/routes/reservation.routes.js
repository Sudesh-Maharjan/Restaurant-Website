const express = require('express');
const { 
  createReservation, 
  getReservations, 
  getReservation, 
  updateReservationStatus, 
  deleteReservation 
} = require('../controllers/reservation');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public route for creating reservations
router.route('/')
  .post(createReservation)
  .get(protect, authorize('admin'), getReservations);

// Admin routes for managing reservations
router.route('/:id')
  .get(protect, authorize('admin'), getReservation)
  .delete(protect, authorize('admin'), deleteReservation);

router.route('/:id/status')
  .put(protect, authorize('admin'), updateReservationStatus);

module.exports = router;
