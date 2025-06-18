const Order = require('../models/Order');
const Customer = require('../models/Customer');

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
exports.getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate('customer')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get customer orders
// @route   GET /api/orders/my-orders
// @access  Private
exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ customer: req.user.id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: `No order found with id of ${req.params.id}`,
      });
    }

    // Check if user is admin or the order belongs to the user
    if (req.user.role !== 'admin' && 
        order.customer && 
        order.customer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: `Not authorized to access this order`,
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Public
exports.createOrder = async (req, res, next) => {
  try {
    // Create the order
    const orderData = {
      ...req.body,
      paid: req.body.paid || false,
    };
    
    const order = await Order.create(orderData);

    // Update customer stats if customer exists
    if (order.customer) {
      try {
        const customer = await Customer.findById(order.customer);
        if (customer) {
          customer.totalOrders = (customer.totalOrders || 0) + 1;
          customer.totalSpent = (customer.totalSpent || 0) + order.total;
          customer.lastOrderDate = Date.now();
          await customer.save();
        }
      } catch (customerErr) {
        console.error('Error updating customer stats:', customerErr);
      }
    }

    // Broadcast the order creation via WebSockets
    const wsService = req.app.get('wsService');
    if (wsService) {
      wsService.broadcastOrderEvent('created', order);
    }

    res.status(201).json({
      success: true,
      data: order,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a status',
      });
    }

    let order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: `No order found with id of ${req.params.id}`,
      });
    }

    order.status = status;
    await order.save();

    // Broadcast the order status update via WebSockets
    const wsService = req.app.get('wsService');
    if (wsService) {
      wsService.broadcastOrderEvent('statusUpdated', order);
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update order payment status
// @route   PUT /api/orders/:id/payment
// @access  Private/Admin
exports.updatePaymentStatus = async (req, res, next) => {
  try {
    const { paid, paymentMethod } = req.body;
    
    let order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: `No order found with id of ${req.params.id}`,
      });
    }

    order.paid = paid;
    if (paymentMethod) {
      order.paymentMethod = paymentMethod;
    }
    
    await order.save();

    // Broadcast the payment status update via WebSockets
    const wsService = req.app.get('wsService');
    if (wsService) {
      wsService.broadcastOrderEvent('paymentUpdated', order);
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete order
// @route   DELETE /api/orders/:id
// @access  Private/Admin
exports.deleteOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: `No order found with id of ${req.params.id}`,
      });
    }

    await order.remove();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (err) {
    next(err);
  }
};
