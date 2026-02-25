const express = require('express');

const { authenticate } = require('../middleware/auth');
const {
  signup,
  login,
  forgotPassword,
  resendReset,
  resetPassword,
  getMe,
  updateMe,
} = require('../controllers/authController');

const router = express.Router();

// Auth routes
router.post('/signup', signup);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/resend-reset', resendReset);
router.post('/reset-password', resetPassword);
router.get('/me', authenticate, getMe);
router.patch('/me', authenticate, updateMe);

module.exports = router;

