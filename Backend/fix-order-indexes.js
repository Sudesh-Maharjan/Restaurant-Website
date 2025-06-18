/**
 * This script checks and fixes MongoDB indexes for the Order collection
 * Run with: node fix-order-indexes.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

async function fixOrderIndexes() {
  try {
    // Connect to the database
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/restaurant');
    console.log('MongoDB Connected');

    // Get the Orders collection
    const db = mongoose.connection.db;
    const ordersCollection = db.collection('orders');

    // List all indexes
    const indexes = await ordersCollection.indexes();
    console.log('Current indexes:', indexes);

    // Check if orderNumber_1 index exists
    const orderNumberIndex = indexes.find(index => 
      index.name === 'orderNumber_1' || 
      (index.key && index.key.orderNumber)
    );

    if (orderNumberIndex) {
      console.log('Found orderNumber index:', orderNumberIndex);
      
      // Drop the index if it exists
      await ordersCollection.dropIndex(orderNumberIndex.name);
      console.log(`Dropped index ${orderNumberIndex.name}`);
    }

    // Create a new index that allows null values (sparse)
    await ordersCollection.createIndex({ orderNumber: 1 }, { 
      unique: true, 
      sparse: true,  // Only index documents where orderNumber exists
      name: 'orderNumber_1'
    });
    console.log('Created new sparse index for orderNumber');

    // Update all documents to ensure they have an orderNumber
    const orders = await ordersCollection.find({ orderNumber: { $exists: false } }).toArray();
    console.log(`Found ${orders.length} orders without orderNumber`);

    if (orders.length > 0) {
      // Get the highest existing order number
      const highestOrder = await ordersCollection.find({}, { orderNumber: 1 })
        .sort({ orderNumber: -1 })
        .limit(1)
        .toArray();
        
      let nextOrderNumber = (highestOrder[0]?.orderNumber || 0) + 1;

      // Update orders
      for (const order of orders) {
        await ordersCollection.updateOne(
          { _id: order._id },
          { $set: { orderNumber: nextOrderNumber++ } }
        );
        console.log(`Updated order ${order._id} with orderNumber ${nextOrderNumber - 1}`);
      }
    }

    // List updated indexes
    const updatedIndexes = await ordersCollection.indexes();
    console.log('Updated indexes:', updatedIndexes);

  } catch (error) {
    console.error('Error fixing order indexes:', error);
  } finally {
    // Disconnect from the database
    await mongoose.disconnect();
    console.log('MongoDB Disconnected');
  }
}

fixOrderIndexes();
