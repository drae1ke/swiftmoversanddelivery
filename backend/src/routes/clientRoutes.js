const express = require('express');

const User = require('../models/User');
const Order = require('../models/Order');
const { authenticate, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Get current client's profile
router.get('/profile', authenticate, authorizeRoles('client'), async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (err) {
    console.error('Client profile error:', err.message);
    res.status(500).json({ message: 'Error fetching profile' });
  }
});

// Get all orders for current client
router.get('/orders', authenticate, authorizeRoles('client'), async (req, res) => {
  try {
    const orders = await Order.find({ client: req.user.id })
      .sort({ createdAt: -1 })
      .populate({
        path: 'driver',
        populate: {
          path: 'user',
          select: 'fullName email',
        },
      });

    res.json(orders);
  } catch (err) {
    console.error('Client orders error:', err.message);
    res.status(500).json({ message: 'Error fetching orders' });
  }
});

// Get single order details for current client
router.get('/orders/:orderId', authenticate, authorizeRoles('client'), async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.orderId,
      client: req.user.id,
    }).populate({
      path: 'driver',
      populate: {
        path: 'user',
        select: 'fullName email',
      },
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (err) {
    console.error('Client order detail error:', err.message);
    res.status(500).json({ message: 'Error fetching order' });
  }
});

// Get client dashboard stats
router.get('/dashboard', authenticate, authorizeRoles('client'), async (req, res) => {
  try {
    const clientOrders = await Order.find({ client: req.user.id });

    const totalOrders = clientOrders.length;
    const deliveredOrders = clientOrders.filter((o) => o.status === 'delivered');
    const pendingOrders = clientOrders.filter((o) => o.status === 'pending');
    const inTransitOrders = clientOrders.filter((o) => o.status === 'in-transit');

    const totalSpent = deliveredOrders.reduce((sum, o) => sum + o.priceKes, 0);

    const recentOrders = clientOrders.sort((a, b) => b.createdAt - a.createdAt).slice(0, 5);

    res.json({
      stats: {
        totalOrders,
        deliveredOrders: deliveredOrders.length,
        pendingOrders: pendingOrders.length,
        inTransitOrders: inTransitOrders.length,
        totalSpent,
      },
      recentOrders,
    });
  } catch (err) {
    console.error('Client dashboard error:', err.message);
    res.status(500).json({ message: 'Error loading dashboard' });
  }
});

// Update client profile
router.patch('/profile', authenticate, authorizeRoles('client'), async (req, res) => {
  try {
    const { fullName } = req.body;

    const update = {};
    if (fullName && typeof fullName === 'string') {
      update.fullName = fullName.trim();
    }

    const user = await User.findByIdAndUpdate(req.user.id, { $set: update }, { new: true }).select(
      '-passwordHash'
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (err) {
    console.error('Client profile update error:', err.message);
    res.status(500).json({ message: 'Error updating profile' });
  }
});

// Get order tracking status
router.get('/track/:orderId', authenticate, authorizeRoles('client'), async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.orderId,
      client: req.user.id,
    }).populate({
      path: 'driver',
      populate: {
        path: 'user',
        select: 'fullName email',
      },
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({
      orderId: order._id,
      status: order.status,
      pickupAddress: order.pickupAddress,
      dropoffAddress: order.dropoffAddress,
      estimatedPrice: order.priceKes,
      driver: order.driver
        ? {
            id: order.driver._id,
            vehicleType: order.driver.vehicleType,
            vehicleDescription: order.driver.vehicleDescription,
            plateNumber: order.driver.plateNumber,
            rating: order.driver.rating,
            user: order.driver.user,
          }
        : null,
      deliveredAt: order.deliveredAt,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    });
  } catch (err) {
    console.error('Order tracking error:', err.message);
    res.status(500).json({ message: 'Error tracking order' });
  }
});

module.exports = router;
