const express = require('express');
const { authenticate } = require('../middleware/auth');
const notificationController = require('../controllers/notificationController');

const router = express.Router();

// Get user's notifications
router.get('/', authenticate, notificationController.getNotifications);

// Get unread count
router.get('/unread-count', authenticate, notificationController.getUnreadNotificationCount);

// Mark notification as read
router.patch('/:id/read', authenticate, notificationController.markNotificationAsRead);

// Mark all notifications as read
router.patch('/mark-all-read', authenticate, notificationController.markAllNotificationsAsRead);

module.exports = router;
