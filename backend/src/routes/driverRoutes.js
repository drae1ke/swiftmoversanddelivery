const express = require('express');

const { authenticate, authorizeRoles } = require('../middleware/auth');
const driverController = require('../controllers/driverController');

const router = express.Router();

router.get('/dashboard', authenticate, authorizeRoles('driver'), driverController.getDashboard);
router.patch('/profile', authenticate, authorizeRoles('driver'), driverController.updateProfile);
router.patch('/status', authenticate, authorizeRoles('driver'), driverController.updateStatus);
router.patch('/location', authenticate, authorizeRoles('driver'), driverController.updateLocation);
router.get(
  '/nearby-orders',
  authenticate,
  authorizeRoles('driver'),
  driverController.getNearbyOrders,
);
router.get(
  '/nearby-relocations',
  authenticate,
  authorizeRoles('driver'),
  driverController.getNearbyRelocations,
);
router.patch(
  '/orders/:id/status',
  authenticate,
  authorizeRoles('driver'),
  driverController.updateOrderStatus,
);

module.exports = router;
