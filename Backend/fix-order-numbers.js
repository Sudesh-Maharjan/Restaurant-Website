/**
 * This script fixes existing orders by assigning order numbers to any orders that don't have them.
 * Run with: node fix-order-numbers.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Define the Order schema directly in this script to avoid issues with references
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
      },
      name: String,
      price: Number,
      quantity: Number,
      image: String,
    },
  ],
  total: Number,
  status: String,
  paid: Boolean,
  paymentMethod: String,
  address: String,
  phone: String,
  email: String,
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

async function fixOrderNumbers() {
  try {
    // Connect to the database
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/restaurant');
    console.log('MongoDB Connected');

    // Create a model from the schema
    const Order = mongoose.model('Order', OrderSchema);

    // Find all orders and update them with orderNumber if they don't have one
    const orders = await Order.find().sort({ createdAt: 1 });
    console.log(`Found ${orders.length} orders in total`);

    let nextOrderNumber = 1;
    let updatedCount = 0;

    for (const order of orders) {
      if (!order.orderNumber) {
        order.orderNumber = nextOrderNumber++;
        await order.save();
        updatedCount++;
        console.log(`Updated order ${order._id} with order number ${order.orderNumber}`);
      } else {
        if (order.orderNumber >= nextOrderNumber) {
          nextOrderNumber = order.orderNumber + 1;
        }
      }
    }

    console.log(`Updated ${updatedCount} orders successfully`);
  } catch (error) {
    console.error('Error fixing order numbers:', error);
  } finally {
    // Disconnect from the database
    await mongoose.disconnect();
    console.log('MongoDB Disconnected');
  }
}

fixOrderNumbers();

fixOrderNumbers();
