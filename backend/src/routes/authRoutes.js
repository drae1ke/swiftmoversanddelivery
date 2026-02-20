const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const User = require('../models/User');
const Driver = require('../models/Driver');
const Admin = require('../models/Admin');
const Landlord = require('../models/Landlord');
const { sendPasswordResetEmail } = require('../services/emailService');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

function signToken(user) {
  const payload = {
    id: user._id,
    role: user.role,
    fullName: user.fullName,
    email: user.email,
  };

  const secret = process.env.JWT_SECRET || 'dev_jwt_secret';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

  return jwt.sign(payload, secret, { expiresIn });
}

// Public signup - creates a client user by default
router.post('/signup', async (req, res) => {
  try {
    const { fullName, email, password, role } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: 'fullName, email and password are required' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullName,
      email,
      passwordHash,
      role: role && ['client', 'driver', 'admin', 'landlord'].includes(role) ? role : 'client',
    });

    // If a driver, admin, or landlord signs up themselves, create the related document with basic defaults
    if (user.role === 'driver') {
      await Driver.create({ user: user._id });
    } else if (user.role === 'admin') {
      await Admin.create({ user: user._id, displayName: user.fullName });
    } else if (user.role === 'landlord') {
      await Landlord.create({
        user: user._id,
        properties: [],
        verified: false,
        rating: 5.0,
        totalProperties: 0,
        activeListings: 0
      });
    }

    const token = signToken(user);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Signup error:', err.message);
    res.status(500).json({ message: 'Error creating account' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = signToken(user);

    res.json({
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ message: 'Error logging in' });
  }
});

// Request password reset link
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });

    // Always respond 200 to avoid leaking which emails exist
    if (!user) {
      return res.json({ message: 'If that email exists, a reset link will be sent shortly' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.passwordResetToken = resetTokenHash;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    const baseUrl = process.env.FRONTEND_BASE_URL || 'http://localhost:5173';
    const resetUrl = `${baseUrl}/ResetPassword?token=${resetToken}`;

    try {
      await sendPasswordResetEmail({ to: user.email, resetUrl });
    } catch (emailErr) {
      console.error('Error sending password reset email:', emailErr.message);
      // Do not expose email errors to the client
    }

    res.json({ message: 'If that email exists, a reset link will be sent shortly' });
  } catch (err) {
    console.error('Forgot password error:', err.message);
    res.status(500).json({ message: 'Error requesting password reset' });
  }
});

// Resend reset email (same behavior as forgot-password)
router.post('/resend-reset', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ message: 'If that email exists, a reset link will be sent shortly' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.passwordResetToken = resetTokenHash;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();

    const baseUrl = process.env.FRONTEND_BASE_URL || 'http://localhost:5173';
    const resetUrl = `${baseUrl}/ResetPassword?token=${resetToken}`;

    try {
      await sendPasswordResetEmail({ to: user.email, resetUrl });
    } catch (emailErr) {
      console.error('Error resending password reset email:', emailErr.message);
    }

    res.json({ message: 'If that email exists, a reset link will be sent shortly' });
  } catch (err) {
    console.error('Resend reset error:', err.message);
    res.status(500).json({ message: 'Error resending password reset email' });
  }
});

// Perform password reset
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ message: 'Token and new password are required' });
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      passwordResetToken: tokenHash,
      passwordResetExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Reset link is invalid or has expired' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    user.passwordHash = await bcrypt.hash(password, 10);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    res.json({ message: 'Password has been reset successfully' });
  } catch (err) {
    console.error('Reset password error:', err.message);
    res.status(500).json({ message: 'Error resetting password' });
  }
});

// Get current authenticated user's profile

router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash -passwordResetToken -passwordResetExpires');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error('Get profile error:', err.message);
    res.status(500).json({ message: 'Error fetching profile' });
  }
});

// Update current user's profile (fullName, phone)
router.patch('/me', authenticate, async (req, res) => {
  try {
    const { fullName, phone } = req.body;
    const update = {};
    if (fullName && typeof fullName === 'string') update.fullName = fullName.trim();
    if (phone && typeof phone === 'string') update.phone = phone.trim();

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: update },
      { new: true }
    ).select('-passwordHash -passwordResetToken -passwordResetExpires');

    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error('Update profile error:', err.message);
    res.status(500).json({ message: 'Error updating profile' });
  }
});

module.exports = router;

