const express = require('express');
const { 
  uploadMenuFile, 
  getMenuFile, 
  deleteMenuFile 
} = require('../controllers/menu');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .get(getMenuFile)
  .delete(protect, authorize('admin'), deleteMenuFile);

router.route('/upload')
  .post(protect, authorize('admin'), uploadMenuFile);

module.exports = router;
