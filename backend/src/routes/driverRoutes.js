const express = require('express');

const Order = require('../models/Order');
const Driver = require('../models/Driver');
const RelocationRequest = require('../models/RelocationRequest');
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

    const earningsWeek = completedOrders.reduce((sum, o) => sum + o.priceKes, 0);
    const earningsMonth = earningsWeek;

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
        location: driver.location,
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
      location: driver.location,
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

// Update driver online status
router.patch('/status', authenticate, authorizeRoles('driver'), async (req, res) => {
  try {
    const { isOnline } = req.body;

    if (typeof isOnline !== 'boolean') {
      return res.status(400).json({ message: 'isOnline must be a boolean' });
    }

    const driver = await Driver.findOneAndUpdate(
      { user: req.user.id },
      { $set: { isOnline } },
      { new: true }
    ).populate('user');

    if (!driver) {
      return res.status(404).json({ message: 'Driver profile not found' });
    }

    res.json({
      id: driver._id,
      isOnline: driver.isOnline,
      vehicleType: driver.vehicleType,
    });
  } catch (err) {
    console.error('Update driver status error:', err.message);
    res.status(500).json({ message: 'Error updating driver status' });
  }
});

// Update driver location
router.patch('/location', authenticate, authorizeRoles('driver'), async (req, res) => {
  try {
    const { coordinates } = req.body;

    if (!coordinates || !Array.isArray(coordinates) || coordinates.length !== 2) {
      return res.status(400).json({ message: 'Coordinates must be an array of [longitude, latitude]' });
    }

    const [longitude, latitude] = coordinates;

    if (typeof longitude !== 'number' || typeof latitude !== 'number') {
      return res.status(400).json({ message: 'Longitude and latitude must be numbers' });
    }

    const driver = await Driver.findOneAndUpdate(
      { user: req.user.id },
      { 
        $set: { 
          location: {
            type: 'Point',
            coordinates: [longitude, latitude]
          }
        } 
      },
      { new: true }
    );

    if (!driver) {
      return res.status(404).json({ message: 'Driver profile not found' });
    }

    res.json({
      id: driver._id,
      location: driver.location,
    });
  } catch (err) {
    console.error('Update driver location error:', err.message);
    res.status(500).json({ message: 'Error updating driver location' });
  }
});

// Get nearby pending orders based on driver location
router.get('/nearby-orders', authenticate, authorizeRoles('driver'), async (req, res) => {
  try {
    const { maxDistance = 10 } = req.query;

    const driver = await Driver.findOne({ user: req.user.id });
    if (!driver) {
      return res.status(404).json({ message: 'Driver profile not found' });
    }

    if (!driver.isOnline) {
      return res.status(400).json({ message: 'Driver must be online to view nearby orders' });
    }

    if (!driver.location || !driver.location.coordinates) {
      return res.status(400).json({ message: 'Driver location not set. Please update your location.' });
    }

    const orders = await Order.find({
      status: 'pending',
      driver: null
    }).populate('client', 'fullName email');

    const ordersWithDistance = orders.map(order => {
      return {
        ...order.toObject(),
        distanceKm: maxDistance
      };
    });

    ordersWithDistance.sort((a, b) => a.distanceKm - b.distanceKm);

    res.json({
      orders: ordersWithDistance,
      driverLocation: driver.location
    });
  } catch (err) {
    console.error('Get nearby orders error:', err.message);
    res.status(500).json({ message: 'Error fetching nearby orders' });
  }
});

// Get nearby pending relocation requests based on driver location
router.get('/nearby-relocations', authenticate, authorizeRoles('driver'), async (req, res) => {
  try {
    const { maxDistance = 10 } = req.query;

    const driver = await Driver.findOne({ user: req.user.id });
    if (!driver) {
      return res.status(404).json({ message: 'Driver profile not found' });
    }

    if (!driver.isOnline) {
      return res.status(400).json({ message: 'Driver must be online to view nearby requests' });
    }

    if (!driver.location || !driver.location.coordinates) {
      return res.status(400).json({ message: 'Driver location not set. Please update your location.' });
    }

    const requests = await RelocationRequest.find({
      status: 'pending',
      assignedDriver: null
    }).populate('client', 'fullName email');

    const requestsWithDistance = requests.map(request => {
      return {
        ...request.toObject(),
        distanceKm: maxDistance
      };
    });

    requestsWithDistance.sort((a, b) => a.distanceKm - b.distanceKm);

    res.json({
      requests: requestsWithDistance,
      driverLocation: driver.location
    });
  } catch (err) {
    console.error('Get nearby relocations error:', err.message);
    res.status(500).json({ message: 'Error fetching nearby relocation requests' });
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
