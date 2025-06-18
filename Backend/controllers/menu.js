const path = require('path');
const fs = require('fs');
const MenuFile = require('../models/MenuFile');
const multer = require('multer');

// Setup multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/menu';
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(
      null,
      `menu-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

// Check file type
const fileFilter = (req, file, cb) => {
  // Allowed file types
  const filetypes = /jpeg|jpg|png|pdf/;
  // Check extension
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime type
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Error: Only PDF and image files are allowed!'), false);
  }
};

// Initialize upload
const upload = multer({
  storage,
  limits: { fileSize: 5000000 }, // 5MB
  fileFilter,
});

// @desc    Upload menu file
// @route   POST /api/menu/upload
// @access  Private/Admin
exports.uploadMenuFile = async (req, res, next) => {
  try {
    // Use multer middleware
    upload.single('file')(req, res, async (err) => {
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

      // Determine file type
      const fileType = req.file.mimetype.includes('pdf') ? 'pdf' : 'image';

      // Delete previous menu file if exists
      const previousMenuFile = await MenuFile.findOne();
      if (previousMenuFile) {
        // Delete file from server
        if (previousMenuFile.url) {
          const filePath = path.join(__dirname, '..', previousMenuFile.url.replace(/^\//, ''));
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }
        await previousMenuFile.deleteOne();
      }

      // Create new menu file record
      const menuFile = await MenuFile.create({
        type: fileType,
        url: `/uploads/menu/${req.file.filename}`,
        name: req.file.originalname,
      });

      res.status(201).json({
        success: true,
        data: menuFile,
      });
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get current menu file
// @route   GET /api/menu
// @access  Public
exports.getMenuFile = async (req, res, next) => {
  try {
    const menuFile = await MenuFile.findOne();

    if (!menuFile) {
      return res.status(404).json({
        success: false,
        message: 'No menu file found',
      });
    }

    res.status(200).json({
      success: true,
      data: menuFile,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete menu file
// @route   DELETE /api/menu
// @access  Private/Admin
exports.deleteMenuFile = async (req, res, next) => {
  try {
    const menuFile = await MenuFile.findOne();

    if (!menuFile) {
      return res.status(404).json({
        success: false,
        message: 'No menu file found',
      });
    }

    // Delete file from server
    if (menuFile.url) {
      const filePath = path.join(__dirname, '..', menuFile.url.replace(/^\//, ''));
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await menuFile.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (err) {
    next(err);
  }
};
