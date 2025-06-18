const Settings = require('../models/Settings');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

// Setup multer storage for logo uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/logo';
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(
      null,
      `logo-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

// Check file type
const fileFilter = (req, file, cb) => {
  // Allowed file types
  const filetypes = /jpeg|jpg|png|svg|webp/;
  // Check extension
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime type
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Error: Only image files are allowed!'), false);
  }
};

// Initialize upload
const upload = multer({
  storage,
  limits: { fileSize: 2000000 }, // 2MB
  fileFilter,
});

// @desc    Get settings
// @route   GET /api/settings
// @access  Public
exports.getSettings = async (req, res, next) => {
  try {
    // There should only be one settings document in the database
    let settings = await Settings.findOne();

    // If no settings exist, create default settings
    if (!settings) {
      settings = await Settings.create({
        restaurantName: 'Bella Vista',
        address: '123 Main St, New York, NY 10001',
        phone: '(123) 456-7890',
        email: 'info@bellavista.com',
        openingHours: 'Mon-Fri: 10am-10pm, Sat-Sun: 11am-11pm',
        logo: '/placeholder-logo.svg',
        aboutUs: 'Bella Vista is a traditional Italian restaurant serving authentic dishes made with fresh ingredients.',
      });
    }

    res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update settings
// @route   PUT /api/settings
// @access  Private/Admin
exports.updateSettings = async (req, res, next) => {
  try {
    // Find existing settings
    let settings = await Settings.findOne();

    // If no settings exist, create default settings
    if (!settings) {
      settings = await Settings.create(req.body);
      return res.status(201).json({
        success: true,
        data: settings,
      });
    }

    // Update settings with data from request body
    settings = await Settings.findByIdAndUpdate(settings._id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Upload logo
// @route   POST /api/settings/logo
// @access  Private/Admin
exports.uploadLogo = async (req, res, next) => {
  try {
    upload.single('logo')(req, res, async (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message,
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Please upload a file',
        });
      }

      // Find existing settings
      let settings = await Settings.findOne();

      if (!settings) {
        return res.status(404).json({
          success: false,
          message: 'Settings not found',
        });
      }

      // Delete old logo if it exists and is not the default
      if (settings.logo && settings.logo !== '/placeholder-logo.svg') {
        const oldLogoPath = path.join(__dirname, '..', settings.logo.replace(/^\//, ''));
        if (fs.existsSync(oldLogoPath)) {
          fs.unlinkSync(oldLogoPath);
        }
      }

      // Update logo path
      const logoPath = `/uploads/logo/${req.file.filename}`;
      settings = await Settings.findByIdAndUpdate(settings._id, { logo: logoPath }, {
        new: true,
        runValidators: true,
      });

      res.status(200).json({
        success: true,
        data: settings,
      });
    });
  } catch (err) {
    next(err);
  }
};
