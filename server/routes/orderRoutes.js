const express = require('express');
const Order = require('../models/Order');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// @route   POST /api/orders
// @desc    Place a new order
// @access  Public (Customer)
router.post('/', async (req, res) => {
  try {
    const { items, totalAmount, customerName, tableNumber } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No items in order' });
    }

    if (!customerName || !tableNumber) {
      return res.status(400).json({ message: 'Customer name and table number are required' });
    }

    const order = await Order.create({
      items,
      totalAmount,
      customerName,
      tableNumber,
      status: 'Placed',
      paymentStatus: 'Pending',
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/orders
// @desc    Get all orders (with optional status filter)
// @access  Private (Admin)
router.get('/', protect, async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};

    if (status && status !== 'All') {
      filter.status = status;
    }

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .populate('items.food', 'name image');

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/orders/:id
// @desc    Get single order (for customer tracking)
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/orders/:id/status
// @desc    Update order status
// @access  Private (Admin)
router.put('/:id/status', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const { status } = req.body;
    const validStatuses = ['Placed', 'Preparing', 'Ready', 'Delivered'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    order.status = status;
    const updatedOrder = await order.save();

    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/orders/:id/pay
// @desc    Mark order as paid
// @access  Public (Customer)
router.put('/:id/pay', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.paymentStatus = 'Paid';
    const updatedOrder = await order.save();

    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
