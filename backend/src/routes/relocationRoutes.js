const express = require('express');
const { authenticate, authorizeRoles } = require('../middleware/auth');
const relocationController = require('../controllers/relocationController');

const router = express.Router();

// ── Public ────────────────────────────────────────────────────────────────────
router.get('/pricing', relocationController.getPricing);

// ── Client ────────────────────────────────────────────────────────────────────
router.post('/estimate', authenticate, authorizeRoles('client'), relocationController.estimatePrice);
router.post('/', authenticate, authorizeRoles('client'), relocationController.createRelocation);
router.get('/my', authenticate, authorizeRoles('client'), relocationController.getMyRelocations);

// ── Admin ─────────────────────────────────────────────────────────────────────
// List all relocations
router.get('/', authenticate, authorizeRoles('admin'), relocationController.listRelocations);

// Admin override assignment (restricted + audited)
router.put('/:id/assign', authenticate, authorizeRoles('admin'), relocationController.assignDriver);

// Full audit trail for a relocation
router.get('/:id/audit', authenticate, authorizeRoles('admin'), relocationController.getRelocationAudit);

// ── Shared (admin / driver / client) ─────────────────────────────────────────
router.get('/:id', authenticate, relocationController.getRelocationById);
router.put(
  '/:id/status',
  authenticate,
  authorizeRoles('admin', 'driver'),
  relocationController.updateStatus
);
router.delete(
  '/:id',
  authenticate,
  authorizeRoles('client', 'admin'),
  relocationController.cancelRelocation
);

module.exports = router;