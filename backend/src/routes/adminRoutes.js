const express = require('express');

const Order = require('../models/Order');
const Driver = require('../models/Driver');
const User = require('../models/User');
const PricingConfig = require('../models/PricingConfig');
const Landlord = require('../models/Landlord');
const Property = require('../models/Property');
const RelocationRequest = require('../models/RelocationRequest');
const Admin = require('../models/Admin');
const { authenticate, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

async function getOrCreatePricingConfig() {
  let config = await PricingConfig.findOne();
  if (!config) {
    config = await PricingConfig.create({
      baseCostPerKm: 50,
      weightBands: [
        { label: '0 - 5 kg', minKg: 0, maxKg: 5, pricePerKm: 50 },
        { label: '5 - 20 kg', minKg: 5, maxKg: 20, pricePerKm: 60 },
        { label: '20 - 50 kg', minKg: 20, maxKg: 50, pricePerKm: 80 },
        { label: '50 - 100 kg', minKg: 50, maxKg: 100, pricePerKm: 100 },
      ],
    });
  }
  return config;
}

// Admin dashboard overview stats
router.get('/dashboard', authenticate, authorizeRoles('admin'), async (req, res) => {
  try {
    const [totalRevenueAgg, drivers, clients, deliveriesToday] = await Promise.all([
      Order.aggregate([
        { $match: { status: 'delivered' } },
        { $group: { _id: null, total: { $sum: '$priceKes' } } },
      ]),
      Driver.find().populate('user'),
      User.countDocuments({ role: 'client' }),
      Order.countDocuments({
        status: { $in: ['in-transit', 'pending', 'assigned', 'delivered'] },
      }),
    ]);

    const totalRevenue = totalRevenueAgg[0]?.total || 0;

    const activeDrivers = drivers.filter((d) => d.isOnline).length;

    const recentDeliveries = await Order.find()
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('client')
      .populate({ path: 'driver', populate: { path: 'user' } });

    res.json({
      stats: {
        totalRevenue,
        activeDrivers,
        totalClients: clients,
        deliveriesToday,
      },
      recentDeliveries,
    });
  } catch (err) {
    console.error('Admin dashboard error:', err.message);
    res.status(500).json({ message: 'Error loading admin dashboard' });
  }
});

// Drivers list
router.get('/drivers', authenticate, authorizeRoles('admin'), async (req, res) => {
  try {
    const drivers = await Driver.find().populate('user');
    res.json(drivers);
  } catch (err) {
    console.error('Admin drivers error:', err.message);
    res.status(500).json({ message: 'Error loading drivers' });
  }
});

// Update a driver (vehicle details)
router.patch('/drivers/:id', authenticate, authorizeRoles('admin'), async (req, res) => {
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

    const driver = await Driver.findByIdAndUpdate(
      req.params.id,
      { $set: update },
      { new: true }
    ).populate('user');

    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }

    res.json(driver);
  } catch (err) {
    console.error('Admin update driver error:', err.message);
    res.status(500).json({ message: 'Error updating driver' });
  }
});

// Orders list
router.get('/orders', authenticate, authorizeRoles('admin'), async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('client')
        .populate({ path: 'driver', populate: { path: 'user' } }),
      Order.countDocuments(),
    ]);

    res.json({
      data: orders,
      page,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error('Admin orders error:', err.message);
    res.status(500).json({ message: 'Error loading orders' });
  }
});

// Assign order to driver
router.patch('/orders/:id/assign', authenticate, authorizeRoles('admin'), async (req, res) => {
  try {
    const { driverId, status } = req.body;

    if (!driverId) {
      return res.status(400).json({ message: 'driverId is required' });
    }

    const driver = await Driver.findById(driverId);
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }

    const order = await Order.findById(req.params.id).populate('client').populate({
      path: 'driver',
      populate: { path: 'user' },
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.driver = driver._id;
    if (status && ['pending', 'assigned', 'in-transit'].includes(status)) {
      order.status = status;
    } else if (order.status === 'pending') {
      order.status = 'assigned';
    }

    await order.save();

    const populated = await Order.findById(order._id)
      .populate('client')
      .populate({ path: 'driver', populate: { path: 'user' } });

    res.json(populated);
  } catch (err) {
    console.error('Assign order error:', err.message);
    res.status(500).json({ message: 'Error assigning order' });
  }
});

// Pricing configuration for weight bands
router.get('/pricing/weight-bands', authenticate, authorizeRoles('admin'), async (req, res) => {
  try {
    const config = await getOrCreatePricingConfig();
    res.json({
      baseCostPerKm: config.baseCostPerKm,
      weightBands: config.weightBands || [],
    });
  } catch (err) {
    console.error('Admin get pricing config error:', err.message);
    res.status(500).json({ message: 'Error loading pricing configuration' });
  }
});

router.put('/pricing/weight-bands', authenticate, authorizeRoles('admin'), async (req, res) => {
  try {
    const { baseCostPerKm, weightBands } = req.body;

    let config = await getOrCreatePricingConfig();

    if (typeof baseCostPerKm === 'number' && !Number.isNaN(baseCostPerKm)) {
      config.baseCostPerKm = baseCostPerKm;
    }

    if (Array.isArray(weightBands)) {
      config.weightBands = weightBands
        .filter((band) => band)
        .map((band) => ({
          label: band.label || `${band.minKg} - ${band.maxKg} kg`,
          minKg: Number(band.minKg) || 0,
          maxKg: Number(band.maxKg) || 0,
          pricePerKm: Number(band.pricePerKm) || 0,
        }));
    }

    await config.save();

    res.json({
      baseCostPerKm: config.baseCostPerKm,
      weightBands: config.weightBands,
    });
  } catch (err) {
    console.error('Admin update pricing config error:', err.message);
    res.status(500).json({ message: 'Error updating pricing configuration' });
  }
});

// ──────────────────────────────────────────────────
// USER MANAGEMENT
// ──────────────────────────────────────────────────

// List all users (paginated, searchable, filterable by role)
router.get('/users', authenticate, authorizeRoles('admin'), async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const { search, role } = req.query;

    const filter = {};
    if (role && role !== 'all') filter.role = role;
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).select('-passwordHash -passwordResetToken -passwordResetExpires'),
      User.countDocuments(filter),
    ]);

    res.json({ data: users, page, total, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    console.error('Admin list users error:', err.message);
    res.status(500).json({ message: 'Error loading users' });
  }
});

// Get single user
router.get('/users/:id', authenticate, authorizeRoles('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-passwordHash -passwordResetToken -passwordResetExpires');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error('Admin get user error:', err.message);
    res.status(500).json({ message: 'Error loading user' });
  }
});

// Update user (role, name)
router.patch('/users/:id', authenticate, authorizeRoles('admin'), async (req, res) => {
  try {
    const { fullName, role } = req.body;
    const update = {};
    if (fullName && typeof fullName === 'string') update.fullName = fullName.trim();
    if (role && ['client', 'driver', 'admin', 'landlord'].includes(role)) update.role = role;

    const user = await User.findByIdAndUpdate(req.params.id, { $set: update }, { new: true })
      .select('-passwordHash -passwordResetToken -passwordResetExpires');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error('Admin update user error:', err.message);
    res.status(500).json({ message: 'Error updating user' });
  }
});

// Delete user + cascade
router.delete('/users/:id', authenticate, authorizeRoles('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Prevent self-deletion
    if (user._id.toString() === req.user.userId) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }

    // Cascade delete related docs
    await Promise.all([
      Driver.deleteMany({ user: user._id }),
      Landlord.deleteMany({ user: user._id }),
      Admin.deleteMany({ user: user._id }),
    ]);
    await User.findByIdAndDelete(user._id);

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Admin delete user error:', err.message);
    res.status(500).json({ message: 'Error deleting user' });
  }
});

// ──────────────────────────────────────────────────
// LANDLORD MANAGEMENT
// ──────────────────────────────────────────────────

router.get('/landlords', authenticate, authorizeRoles('admin'), async (req, res) => {
  try {
    const landlords = await Landlord.find().populate('user', '-passwordHash -passwordResetToken -passwordResetExpires').populate('properties');
    res.json(landlords);
  } catch (err) {
    console.error('Admin landlords error:', err.message);
    res.status(500).json({ message: 'Error loading landlords' });
  }
});

// ──────────────────────────────────────────────────
// PROPERTY MANAGEMENT
// ──────────────────────────────────────────────────

router.get('/properties', authenticate, authorizeRoles('admin'), async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const { status } = req.query;

    const filter = {};
    if (status && status !== 'all') filter.status = status;

    const [properties, total] = await Promise.all([
      Property.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('landlord', 'fullName email'),
      Property.countDocuments(filter),
    ]);

    res.json({ data: properties, page, total, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    console.error('Admin properties error:', err.message);
    res.status(500).json({ message: 'Error loading properties' });
  }
});

router.patch('/properties/:id/status', authenticate, authorizeRoles('admin'), async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['pending', 'approved', 'rejected', 'active', 'inactive'];
    if (!status || !allowed.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const property = await Property.findByIdAndUpdate(
      req.params.id,
      { $set: { status, isVerified: status === 'approved' || status === 'active' } },
      { new: true }
    ).populate('landlord', 'fullName email');

    if (!property) return res.status(404).json({ message: 'Property not found' });
    res.json(property);
  } catch (err) {
    console.error('Admin update property status error:', err.message);
    res.status(500).json({ message: 'Error updating property status' });
  }
});

// ──────────────────────────────────────────────────
// RELOCATION REQUESTS
// ──────────────────────────────────────────────────

router.get('/relocations', authenticate, authorizeRoles('admin'), async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [requests, total] = await Promise.all([
      RelocationRequest.find().sort({ createdAt: -1 }).skip(skip).limit(limit)
        .populate('client', 'fullName email')
        .populate({ path: 'assignedDriver', populate: { path: 'user', select: 'fullName' } }),
      RelocationRequest.countDocuments(),
    ]);

    res.json({ data: requests, page, total, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    console.error('Admin relocations error:', err.message);
    res.status(500).json({ message: 'Error loading relocation requests' });
  }
});

// ──────────────────────────────────────────────────
// ANALYTICS
// ──────────────────────────────────────────────────

router.get('/analytics', authenticate, authorizeRoles('admin'), async (req, res) => {
  try {
    const [
      totalUsers,
      roleCounts,
      totalOrders,
      orderStatusCounts,
      revenueAgg,
      totalProperties,
      totalRelocations,
    ] = await Promise.all([
      User.countDocuments(),
      User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
      Order.countDocuments(),
      Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Order.aggregate([{ $match: { status: 'delivered' } }, { $group: { _id: null, total: { $sum: '$priceKes' } } }]),
      Property.countDocuments(),
      RelocationRequest.countDocuments(),
    ]);

    const roleMap = {};
    roleCounts.forEach((r) => { roleMap[r._id] = r.count; });

    const statusMap = {};
    orderStatusCounts.forEach((s) => { statusMap[s._id] = s.count; });

    res.json({
      totalUsers,
      usersByRole: roleMap,
      totalOrders,
      ordersByStatus: statusMap,
      totalRevenue: revenueAgg[0]?.total || 0,
      totalProperties,
      totalRelocations,
    });
  } catch (err) {
    console.error('Admin analytics error:', err.message);
    res.status(500).json({ message: 'Error loading analytics' });
  }
});

module.exports = router;
