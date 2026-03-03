const express = require('express');

const { authenticate, authorizeRoles } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

const router = express.Router();

// Dashboard
router.get('/dashboard', authenticate, authorizeRoles('admin'), adminController.getDashboard);

// Drivers
router.get('/drivers', authenticate, authorizeRoles('admin'), adminController.getDrivers);
router.patch(
  '/drivers/:id',
  authenticate,
  authorizeRoles('admin'),
  adminController.updateDriver,
);

// Orders
router.get('/orders', authenticate, authorizeRoles('admin'), adminController.getOrders);
router.get('/orders/:id', authenticate, authorizeRoles('admin'), adminController.getOrderById);
router.patch(
  '/orders/:id/assign',
  authenticate,
  authorizeRoles('admin'),
  adminController.assignOrder,
);
router.patch(
  '/orders/:id/status',
  authenticate,
  authorizeRoles('admin'),
  adminController.updateOrderStatus,
);

// Pricing configuration
router.get(
  '/pricing/weight-bands',
  authenticate,
  authorizeRoles('admin'),
  adminController.getPricingConfig,
);
router.put(
  '/pricing/weight-bands',
  authenticate,
  authorizeRoles('admin'),
  adminController.updatePricingConfig,
);

// User management
router.get('/users', authenticate, authorizeRoles('admin'), adminController.listUsers);
router.get('/users/:id', authenticate, authorizeRoles('admin'), adminController.getUser);
router.patch('/users/:id', authenticate, authorizeRoles('admin'), adminController.updateUser);
router.delete('/users/:id', authenticate, authorizeRoles('admin'), adminController.deleteUser);

// Landlords
router.get('/landlords', authenticate, authorizeRoles('admin'), adminController.getLandlords);

// Properties
router.get('/properties', authenticate, authorizeRoles('admin'), adminController.getProperties);
router.patch(
  '/properties/:id/status',
  authenticate,
  authorizeRoles('admin'),
  adminController.updatePropertyStatus,
);

// Relocations
router.get('/relocations', authenticate, authorizeRoles('admin'), adminController.getRelocations);

// Analytics
router.get('/analytics', authenticate, authorizeRoles('admin'), adminController.getAnalytics);

// Driver locations for map
router.get(
  '/drivers/locations',
  authenticate,
  authorizeRoles('admin'),
  adminController.getDriverLocations,
);

module.exports = router;
