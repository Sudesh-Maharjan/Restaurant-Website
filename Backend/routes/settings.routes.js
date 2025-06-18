const express = require('express');
const { 
  getSettings,
  updateSettings,
  uploadLogo
} = require('../controllers/settings');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .get(getSettings)
  .put(protect, authorize('admin'), updateSettings);

router.route('/logo')
  .post(protect, authorize('admin'), uploadLogo);

module.exports = router;
