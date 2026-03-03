const {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
} = require('../services/notificationService');

// Get user's notifications
async function getNotifications(req, res) {
  try {
    const limit = Number(req.query.limit) || 20;
    const unreadOnly = req.query.unreadOnly === 'true';

    const notifications = await getUserNotifications(req.user.id, limit, unreadOnly);
    const unreadCount = await getUnreadCount(req.user.id);

    res.json({
      notifications,
      unreadCount,
    });
  } catch (err) {
    console.error('Get notifications error:', err.message);
    res.status(500).json({ message: 'Error fetching notifications' });
  }
}

// Mark notification as read
async function markNotificationAsRead(req, res) {
  try {
    const { id } = req.params;

    const success = await markAsRead(id);
    if (!success) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ message: 'Notification marked as read' });
  } catch (err) {
    console.error('Mark notification as read error:', err.message);
    res.status(500).json({ message: 'Error marking notification as read' });
  }
}

// Mark all notifications as read
async function markAllNotificationsAsRead(req, res) {
  try {
    await markAllAsRead(req.user.id);
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    console.error('Mark all notifications as read error:', err.message);
    res.status(500).json({ message: 'Error marking notifications as read' });
  }
}

// Get unread notification count
async function getUnreadNotificationCount(req, res) {
  try {
    const count = await getUnreadCount(req.user.id);
    res.json({ unreadCount: count });
  } catch (err) {
    console.error('Get unread count error:', err.message);
    res.status(500).json({ message: 'Error fetching unread count' });
  }
}

module.exports = {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadNotificationCount,
};
