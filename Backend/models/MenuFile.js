const mongoose = require('mongoose');

const MenuFileSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['pdf', 'image'],
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('MenuFile', MenuFileSchema);
