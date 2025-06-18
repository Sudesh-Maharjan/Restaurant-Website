const WebSocket = require('ws');
const http = require('http');
const Order = require('../models/Order');
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');

// Email configuration
let transporter;
try {
  if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    console.log('Email transporter configured');
  } else {
    console.log('Email credentials not found in environment variables');
  }
} catch (error) {
  console.error('Error setting up email transporter:', error);
}

const setupWebsockets = (server) => {
  const wss = new WebSocket.Server({ server });
    // Store connected clients
  const clients = {
    admin: new Set(),
    customer: new Set(),
  };

  // Load notification sound if available
  let notificationSound;
  try {
    const soundPath = path.join(__dirname, 'notification.mp3');
    if (fs.existsSync(soundPath)) {
      notificationSound = fs.readFileSync(soundPath).toString('base64');
      console.log('Notification sound loaded successfully');
    } else {
      console.log('Notification sound file not found');
    }
  } catch (error) {
    console.error('Error loading notification sound:', error);
  }

  wss.on('connection', (ws, req) => {
    console.log('WebSocket client connected');
    
    // Handle connection message to identify client type
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message);
        
        if (data.type === 'register') {
          // Register client type (admin or customer)
          ws.clientType = data.clientType;
          ws.userId = data.userId;
          
          if (data.clientType === 'admin') {
            clients.admin.add(ws);
            console.log('Admin client registered');
          } else if (data.clientType === 'customer') {
            clients.customer.add(ws);
            ws.userId = data.userId;
            console.log('Customer client registered with ID:', data.userId);
          }
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    });

    // Handle disconnection
    ws.on('close', () => {
      if (ws.clientType === 'admin') {
        clients.admin.delete(ws);
      } else if (ws.clientType === 'customer') {
        clients.customer.delete(ws);
      }
      console.log('WebSocket client disconnected');
    });
  });
  // Function to broadcast order events
  const broadcastOrderEvent = async (event, order) => {
    try {
      // Populate order with customer details if available
      const populatedOrder = await Order.findById(order._id)
        .populate('customer')
        .exec();
      
      const message = JSON.stringify({
        type: 'order',
        event,
        order: populatedOrder,
        ...(notificationSound && { sound: notificationSound })
      });

      // Send to all admin clients
      clients.admin.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });

      // Send to specific customer if this is their order
      if (populatedOrder.customer) {
        clients.customer.forEach((client) => {
          if (
            client.readyState === WebSocket.OPEN && 
            client.userId && 
            client.userId === populatedOrder.customer._id.toString()
          ) {
            client.send(message);
          }
        });
      }

      // Send email notification
      if (event === 'created' && populatedOrder.customer && populatedOrder.customer.email) {
        await sendOrderConfirmationEmail(populatedOrder);
      } else if (event === 'statusUpdated' && populatedOrder.customer && populatedOrder.customer.email) {
        await sendOrderStatusUpdateEmail(populatedOrder);
      }
    } catch (error) {
      console.error('Error broadcasting order event:', error);
    }
  };
  // Email sending functions
  const sendOrderConfirmationEmail = async (order) => {
    try {
      if (!transporter) {
        console.log('Email transporter not available - skipping confirmation email');
        return;
      }
      
      const customerEmail = order.customer.email;
      
      const emailContent = `
        <h1>Order Confirmation</h1>
        <p>Dear ${order.customer.name},</p>
        <p>Thank you for your order! We've received your order and are processing it.</p>
        <h2>Order Details:</h2>
        <p><strong>Order ID:</strong> ${order._id}</p>
        <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
        <p><strong>Total Amount:</strong> $${order.total.toFixed(2)}</p>
        <p><strong>Payment Status:</strong> ${order.paid ? 'Paid' : 'Pending Payment'}</p>
        
        <h3>Ordered Items:</h3>
        <ul>
          ${order.items.map(item => `
            <li>${item.name} x ${item.quantity} - $${(item.price * item.quantity).toFixed(2)}</li>
          `).join('')}
        </ul>
        
        <p>You can check your order status on our website.</p>
        <p>Thanks for choosing our restaurant!</p>
      `;
      
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: customerEmail,
        subject: 'Order Confirmation - Your Order Has Been Received',
        html: emailContent,
      };
      
      await transporter.sendMail(mailOptions);
      console.log('Order confirmation email sent to:', customerEmail);
    } catch (error) {
      console.error('Error sending order confirmation email:', error);
    }
  };
  const sendOrderStatusUpdateEmail = async (order) => {
    try {
      if (!transporter) {
        console.log('Email transporter not available - skipping status update email');
        return;
      }
      
      const customerEmail = order.customer.email;
      
      const statusMessages = {
        pending: 'We have received your order and are processing it.',
        preparing: 'Your order is now being prepared in our kitchen.',
        ready: 'Your order is ready for pickup or delivery.',
        delivered: 'Your order has been delivered. Enjoy!',
        cancelled: 'Your order has been cancelled. Please contact us if you have any questions.'
      };
      
      const emailContent = `
        <h1>Order Status Update</h1>
        <p>Dear ${order.customer.name},</p>
        <p>Your order status has been updated to: <strong>${order.status.toUpperCase()}</strong></p>
        <p>${statusMessages[order.status] || ''}</p>
        
        <h2>Order Details:</h2>
        <p><strong>Order ID:</strong> ${order._id}</p>
        <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
        <p><strong>Total Amount:</strong> $${order.total.toFixed(2)}</p>
        
        <p>You can check your order status on our website.</p>
        <p>Thanks for choosing our restaurant!</p>
      `;
      
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: customerEmail,
        subject: `Order Update - Your Order is ${order.status.toUpperCase()}`,
        html: emailContent,
      };
      
      await transporter.sendMail(mailOptions);
      console.log('Order status update email sent to:', customerEmail);
    } catch (error) {
      console.error('Error sending order status update email:', error);
    }
  };

  return {
    broadcastOrderEvent,
  };
};

module.exports = setupWebsockets;
