const express = require('express');

const { authenticate, authorizeRoles } = require('../middleware/auth');
const clientController = require('../controllers/clientController');

const router = express.Router();

router.get('/profile', authenticate, authorizeRoles('client'), clientController.getProfile);
router.get('/orders', authenticate, authorizeRoles('client'), clientController.getOrders);
router.get(
  '/orders/:orderId',
  authenticate,
  authorizeRoles('client'),
  clientController.getOrderById,
);
router.get('/dashboard', authenticate, authorizeRoles('client'), clientController.getDashboard);
router.patch(
  '/profile',
  authenticate,
  authorizeRoles('client'),
  clientController.updateProfile,
);
router.get(
  '/track/:orderId',
  authenticate,
  authorizeRoles('client'),
  clientController.trackOrder,
);

router.get(
  '/driver-locations',
  authenticate,
  authorizeRoles('client'),
  clientController.getDriverLocations,
);

module.exports = router;
