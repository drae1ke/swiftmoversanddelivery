const express = require('express');

const { authenticate, authorizeRoles } = require('../middleware/auth');
const relocationController = require('../controllers/relocationController');

const router = express.Router();

// Public pricing
router.get('/pricing', relocationController.getPricing);

// Client
router.post(
  '/estimate',
  authenticate,
  authorizeRoles('client'),
  relocationController.estimatePrice,
);
router.post('/', authenticate, authorizeRoles('client'), relocationController.createRelocation);
router.get('/my', authenticate, authorizeRoles('client'), relocationController.getMyRelocations);

// Admin
router.get('/', authenticate, authorizeRoles('admin'), relocationController.listRelocations);
router.put(
  '/:id/assign',
  authenticate,
  authorizeRoles('admin'),
  relocationController.assignDriver,
);

// Shared (admin/driver/client)
router.get('/:id', authenticate, relocationController.getRelocationById);
router.put(
  '/:id/status',
  authenticate,
  authorizeRoles('admin', 'driver'),
  relocationController.updateStatus,
);
router.delete(
  '/:id',
  authenticate,
  authorizeRoles('client', 'admin'),
  relocationController.cancelRelocation,
);

module.exports = router;
