const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
  restaurantName: {
    type: String,
    required: [true, 'Restaurant name is required'],
    trim: true,
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true,
  },
  city: {
    type: String,
    default: 'New York',
    trim: true,
  },
  state: {
    type: String,
    default: 'NY',
    trim: true,
  },
  zipCode: {
    type: String,
    default: '10001',
    trim: true,
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email',
    ],
    trim: true,
    lowercase: true,
  },
  openingHours: {
    type: String,
    required: [true, 'Opening hours are required'],
  },
  hours: {
    monFri: {
      type: String,
      default: 'Monday - Friday: 11:30 AM - 10:00 PM',
    },
    satSun: {
      type: String,
      default: 'Saturday - Sunday: 12:00 PM - 11:00 PM',
    }
  },
  logo: {
    type: String,
    default: '/placeholder-logo.svg',
  },
  socialMedia: {
    facebook: {
      type: String,
      default: '',
    },
    instagram: {
      type: String,
      default: '',
    },
    twitter: {
      type: String,
      default: '',
    },
  },
  aboutUs: {
    type: String,
    default: '',
  },  currency: {
    type: String,
    enum: ['USD', 'GBP', 'NPR'],
    default: 'USD',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Settings', SettingsSchema);
