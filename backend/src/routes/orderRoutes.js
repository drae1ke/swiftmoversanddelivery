const express = require('express');

const { authenticate, authorizeRoles } = require('../middleware/auth');
const orderController = require('../controllers/orderController');

const router = express.Router();

// Client
router.post('/', authenticate, authorizeRoles('client'), orderController.createOrder);
router.get('/my', authenticate, authorizeRoles('client'), orderController.getMyOrders);
router.post(
  '/estimate',
  authenticate,
  authorizeRoles('client'),
  orderController.estimatePrice,
);

// Public
router.get('/pricing/weight-bands', orderController.getPricingBands);
router.get('/track/:id', authenticate, orderController.trackOrder);

module.exports = router;

