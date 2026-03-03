const Notification = require('../models/Notification');
const {
  sendOrderCreatedEmail,
  sendOrderAssignedEmail,
  sendOrderInTransitEmail,
  sendOrderArrivalEmail,
  sendProfileIncompleteEmail,
  sendDriverRatingEmail,
} = require('./emailService');

/**
 * Create in-app notification
 */
async function createNotification({ userId, type, title, message, data, actionUrl, priority = 'medium' }) {
  try {
    const notification = await Notification.create({
      user: userId,
      type,
      title,
      message,
      data,
      actionUrl,
      priority,
    });
    return notification;
  } catch (err) {
    console.error('Error creating notification:', err.message);
    return null;
  }
}

/**
 * Get user's notifications
 */
async function getUserNotifications(userId, limit = 20, unreadOnly = false) {
  try {
    const query = { user: userId };
    if (unreadOnly) {
      query.read = false;
    }
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    return notifications;
  } catch (err) {
    console.error('Error fetching notifications:', err.message);
    return [];
  }
}

/**
 * Mark notification as read
 */
async function markAsRead(notificationId) {
  try {
    await Notification.findByIdAndUpdate(notificationId, {
      read: true,
      readAt: new Date(),
    });
    return true;
  } catch (err) {
    console.error('Error marking notification as read:', err.message);
    return false;
  }
}

/**
 * Mark all user notifications as read
 */
async function markAllAsRead(userId) {
  try {
    await Notification.updateMany(
      { user: userId, read: false },
      { read: true, readAt: new Date() }
    );
    return true;
  } catch (err) {
    console.error('Error marking all notifications as read:', err.message);
    return false;
  }
}

/**
 * Get unread count
 */
async function getUnreadCount(userId) {
  try {
    const count = await Notification.countDocuments({ user: userId, read: false });
    return count;
  } catch (err) {
    console.error('Error getting unread count:', err.message);
    return 0;
  }
}

/**
 * Notify order created
 */
async function notifyOrderCreated({ order, client }) {
  // In-app notification
  await createNotification({
    userId: client._id,
    type: 'order_created',
    title: 'Order Created Successfully',
    message: `Your delivery order from ${order.pickupAddress} has been created.`,
    data: { orderId: order._id },
    actionUrl: `/orders/${order._id}`,
    priority: 'medium',
  });

  // Email notification
  if (client.notificationPreferences?.email !== false) {
    await sendOrderCreatedEmail({
      to: client.email,
      clientName: client.fullName,
      order,
    });
  }
}

/**
 * Notify order assigned
 */
async function notifyOrderAssigned({ order, client, driver }) {
  // Notify client
  await createNotification({
    userId: client._id,
    type: 'order_assigned',
    title: 'Driver Assigned',
    message: `${driver.user?.fullName || 'A driver'} has been assigned to your order.`,
    data: { orderId: order._id, driverId: driver._id },
    actionUrl: `/orders/${order._id}`,
    priority: 'high',
  });

  if (client.notificationPreferences?.email !== false) {
    await sendOrderAssignedEmail({
      to: client.email,
      clientName: client.fullName,
      order,
      driverName: driver.user?.fullName || 'Your driver',
    });
  }

  // Notify driver
  if (driver.user) {
    await createNotification({
      userId: driver.user._id,
      type: 'order_assigned',
      title: 'New Order Assigned',
      message: `You have been assigned a new delivery order.`,
      data: { orderId: order._id },
      actionUrl: `/orders/${order._id}`,
      priority: 'high',
    });
  }
}

/**
 * Notify order in transit
 */
async function notifyOrderInTransit({ order, client, driver }) {
  await createNotification({
    userId: client._id,
    type: 'order_in_transit',
    title: 'Order On The Way',
    message: `Your order is on the way to ${order.dropoffAddress}.`,
    data: { orderId: order._id, driverId: driver._id },
    actionUrl: `/orders/${order._id}`,
    priority: 'high',
  });

  if (client.notificationPreferences?.email !== false) {
    await sendOrderInTransitEmail({
      to: client.email,
      clientName: client.fullName,
      order,
      driverName: driver.user?.fullName || 'Your driver',
    });
  }
}

/**
 * Notify order delivered
 */
async function notifyOrderDelivered({ order, client, driver }) {
  await createNotification({
    userId: client._id,
    type: 'order_delivered',
    title: 'Order Delivered',
    message: 'Your order has been delivered successfully. Please rate your driver!',
    data: { orderId: order._id, driverId: driver._id },
    actionUrl: `/orders/${order._id}/rate`,
    priority: 'medium',
  });

  if (client.notificationPreferences?.email !== false) {
    await sendOrderArrivalEmail({
      to: client.email,
      order,
    });
  }

  // Notify driver
  if (driver.user) {
    await createNotification({
      userId: driver.user._id,
      type: 'order_delivered',
      title: 'Order Completed',
      message: 'You have successfully completed the delivery.',
      data: { orderId: order._id },
      actionUrl: `/orders/${order._id}`,
      priority: 'low',
    });
  }
}

/**
 * Notify profile incomplete
 */
async function notifyProfileIncomplete({ user, missingFields }) {
  await createNotification({
    userId: user._id,
    type: 'profile_incomplete',
    title: 'Complete Your Profile',
    message: `Please complete your profile to enjoy full platform benefits.`,
    data: { missingFields },
    actionUrl: '/profile',
    priority: 'medium',
  });

  if (user.notificationPreferences?.email !== false) {
    await sendProfileIncompleteEmail({
      to: user.email,
      userName: user.fullName,
      missingFields,
    });
  }
}

/**
 * Notify driver rating received
 */
async function notifyDriverRating({ driver, rating, comment }) {
  if (!driver.user) return;

  await createNotification({
    userId: driver.user._id,
    type: 'rating_received',
    title: 'New Rating Received',
    message: `You received a ${rating}/5 rating!`,
    data: { rating, comment },
    actionUrl: '/DriverDashboard',
    priority: 'low',
  });

  if (driver.user.notificationPreferences?.email !== false) {
    await sendDriverRatingEmail({
      to: driver.user.email,
      driverName: driver.user.fullName,
      rating,
      comment,
    });
  }
}

module.exports = {
  createNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  notifyOrderCreated,
  notifyOrderAssigned,
  notifyOrderInTransit,
  notifyOrderDelivered,
  notifyProfileIncomplete,
  notifyDriverRating,
};
