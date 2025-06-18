const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  orderNumber: {
    type: Number,
    unique: true,
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
  },
  items: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
      name: {
        type: String,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
      },
      image: {
        type: String,
      },
    },
  ],
  total: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'preparing', 'ready', 'delivered', 'cancelled'],
    default: 'pending',
  },
  paid: {
    type: Boolean,
    default: false,
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'paypal', ''],
    default: '',
  },
  address: {
    type: String,
    required: false,
  },
  phone: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: false,
  },
  notes: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field before saving and assign orderNumber if not already set
OrderSchema.pre('save', async function(next) {
  this.updatedAt = Date.now();
  
  // If orderNumber is not set, generate a new one
  if (!this.orderNumber) {
    try {
      // Find the highest order number and increment by 1
      const highestOrder = await this.constructor.findOne({}, { orderNumber: 1 }, { sort: { orderNumber: -1 } });
      this.orderNumber = highestOrder && highestOrder.orderNumber ? highestOrder.orderNumber + 1 : 1;
    } catch (error) {
      console.error('Error generating order number:', error);
      return next(error);
    }
  }
  
  next();
});

// Populate the customer reference when getting an order
OrderSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'customer',
    select: 'name email phone'
  });
  next();
});

module.exports = mongoose.model('Order', OrderSchema);
