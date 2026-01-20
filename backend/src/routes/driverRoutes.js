const express = require('express');

const Order = require('../models/Order');
const Driver = require('../models/Driver');
const { authenticate, authorizeRoles } = require('../middleware/auth');
const { sendOrderArrivalEmail } = require('../services/emailService');

const router = express.Router();

// Driver dashboard summary
router.get('/dashboard', authenticate, authorizeRoles('driver'), async (req, res) => {
  try {
    const driver = await Driver.findOne({ user: req.user.id }).populate('user');
    if (!driver) {
      return res.status(404).json({ message: 'Driver profile not found' });
    }

    const [completedOrders, allOrders] = await Promise.all([
      Order.find({ driver: driver._id, status: 'delivered' }),
      Order.find({ driver: driver._id }),
    ]);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const earningsToday = completedOrders
      .filter((o) => o.deliveredAt && o.deliveredAt >= today)
      .reduce((sum, o) => sum + o.priceKes, 0);

    const earningsWeek = completedOrders.reduce((sum, o) => sum + o.priceKes, 0); // simple for now
    const earningsMonth = earningsWeek; // placeholder aggregation

    const pendingOrders = await Order.find({ driver: driver._id, status: { $in: ['assigned', 'in-transit'] } })
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({
      driver: {
        id: driver._id,
        vehicleType: driver.vehicleType,
        vehicleDescription: driver.vehicleDescription,
        plateNumber: driver.plateNumber,
        rating: driver.rating,
        totalTrips: driver.totalTrips,
        completionRate: driver.completionRate,
        onTimeRate: driver.onTimeRate,
        customerSatisfaction: driver.customerSatisfaction,
        isOnline: driver.isOnline,
        createdAt: driver.createdAt,
        user: driver.user
          ? {
              id: driver.user._id,
              fullName: driver.user.fullName,
              email: driver.user.email,
              createdAt: driver.user.createdAt,
            }
          : null,
      },
      earnings: {
        today: earningsToday,
        week: earningsWeek,
        month: earningsMonth,
        pending: pendingOrders.reduce((sum, o) => sum + o.priceKes, 0),
      },
      pendingOrders,
      completedOrders,
    });
  } catch (err) {
    console.error('Driver dashboard error:', err.message);
    res.status(500).json({ message: 'Error loading driver dashboard' });
  }
});

// Update driver profile (vehicle details)
router.patch('/profile', authenticate, authorizeRoles('driver'), async (req, res) => {
  try {
    const { vehicleType, vehicleDescription, plateNumber } = req.body;

    const update = {};
    if (vehicleType) {
      const allowedTypes = ['bicycle', 'bike', 'car', 'van', 'lorry'];
      if (!allowedTypes.includes(vehicleType)) {
        return res.status(400).json({ message: 'Invalid vehicle type' });
      }
      update.vehicleType = vehicleType;
    }
    if (typeof vehicleDescription === 'string') {
      update.vehicleDescription = vehicleDescription;
    }
    if (typeof plateNumber === 'string') {
      update.plateNumber = plateNumber;
    }

    const driver = await Driver.findOneAndUpdate(
      { user: req.user.id },
      { $set: update },
      { new: true }
    ).populate('user');

    if (!driver) {
      return res.status(404).json({ message: 'Driver profile not found' });
    }

    res.json({
      id: driver._id,
      vehicleType: driver.vehicleType,
      vehicleDescription: driver.vehicleDescription,
      plateNumber: driver.plateNumber,
      rating: driver.rating,
      totalTrips: driver.totalTrips,
      completionRate: driver.completionRate,
      onTimeRate: driver.onTimeRate,
      customerSatisfaction: driver.customerSatisfaction,
      isOnline: driver.isOnline,
      createdAt: driver.createdAt,
      user: driver.user
        ? {
            id: driver.user._id,
            fullName: driver.user.fullName,
            email: driver.user.email,
            createdAt: driver.user.createdAt,
          }
        : null,
    });
  } catch (err) {
    console.error('Update driver profile error:', err.message);
    res.status(500).json({ message: 'Error updating driver profile' });
  }
});

// Update order status and notify client on delivery
router.patch('/orders/:id/status', authenticate, authorizeRoles('driver'), async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ['assigned', 'in-transit', 'delivered'];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const driver = await Driver.findOne({ user: req.user.id });
    if (!driver) {
      return res.status(404).json({ message: 'Driver profile not found' });
    }

    const order = await Order.findOne({ _id: req.params.id, driver: driver._id }).populate('client');
    if (!order) {
      return res.status(404).json({ message: 'Order not found for this driver' });
    }

    order.status = status;
    if (status === 'delivered') {
      order.deliveredAt = new Date();
    }

    await order.save();

    if (status === 'delivered' && order.client && order.client.email) {
      // Fire and forget email; errors are logged but do not block response
      sendOrderArrivalEmail({
        to: order.client.email,
        order,
      }).catch((err) => {
        console.error('Error sending arrival email:', err.message);
      });
    }

    res.json(order);
  } catch (err) {
    console.error('Update order status error:', err.message);
    res.status(500).json({ message: 'Error updating order status' });
  }
});

module.exports = router;
