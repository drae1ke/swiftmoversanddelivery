const express = require('express');

const { authenticate, authorizeRoles } = require('../middleware/auth');
const propertyController = require('../controllers/propertyController');

const router = express.Router();

// Public
router.get('/', propertyController.listProperties);
router.get('/:id', propertyController.getPropertyById);

// Landlord
router.get(
  '/my/properties',
  authenticate,
  authorizeRoles('landlord'),
  propertyController.getMyProperties,
);
router.post(
  '/',
  authenticate,
  authorizeRoles('landlord'),
  propertyController.createProperty,
);
router.put(
  '/:id',
  authenticate,
  authorizeRoles('landlord'),
  propertyController.updateProperty,
);
router.delete(
  '//:id',
  authenticate,
  authorizeRoles('landlord'),
  propertyController.deleteProperty,
);

// Admin
router.put(
  '/:id/status',
  authenticate,
  authorizeRoles('admin'),
  propertyController.updatePropertyStatus,
);

// Client booking
router.post(
  '/:id/book',
  authenticate,
  authorizeRoles('client'),
  propertyController.bookProperty,
);

module.exports = router;

