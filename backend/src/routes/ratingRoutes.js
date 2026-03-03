const express = require('express');
const { authenticate, authorizeRoles } = require('../middleware/auth');
const ratingController = require('../controllers/ratingController');

const router = express.Router();

// Create rating (clients only)
router.post(
  '/',
  authenticate,
  authorizeRoles('client'),
  ratingController.createRating
);

// Get driver ratings (anyone authenticated)
router.get(
  '/driver/:driverId',
  authenticate,
  ratingController.getDriverRatings
);

// Check if order can be rated
router.get(
  '/order/:orderId/can-rate',
  authenticate,
  authorizeRoles('client'),
  ratingController.canRateOrder
);

// Get specific rating
router.get(
  '/:id',
  authenticate,
  ratingController.getRating
);

module.exports = router;
