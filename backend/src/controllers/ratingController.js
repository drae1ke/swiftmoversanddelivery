const Rating = require('../models/Rating');
const Order = require('../models/Order');
const Driver = require('../models/Driver');
const { notifyDriverRating } = require('../services/notificationService');

// Create a rating for a driver after order completion
async function createRating(req, res) {
  try {
    const { orderId, rating, comment, categories, isAnonymous } = req.body;

    if (!orderId || !rating) {
      return res.status(400).json({ message: 'Order ID and rating are required' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Find the order
    const order = await Order.findById(orderId).populate('driver');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Verify the user is the client of this order
    if (order.client.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only rate your own orders' });
    }

    // Verify order is delivered
    if (order.status !== 'delivered') {
      return res.status(400).json({ message: 'You can only rate completed deliveries' });
    }

    // Check if already rated
    const existingRating = await Rating.findOne({ order: orderId });
    if (existingRating) {
      return res.status(400).json({ message: 'You have already rated this order' });
    }

    // Create rating
    const newRating = await Rating.create({
      order: orderId,
      client: req.user.id,
      driver: order.driver._id,
      rating,
      comment,
      categories: categories || {},
      isAnonymous: isAnonymous || false,
    });

    // Update order with rating reference
    order.rating = newRating._id;
    await order.save();

    // Update driver's average rating
    const driver = await Driver.findById(order.driver._id).populate('user');
    const allRatings = await Rating.find({ driver: driver._id });
    const avgRating = allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length;
    
    driver.totalRatings = allRatings.length;
    driver.averageRating = Math.round(avgRating * 10) / 10; // Round to 1 decimal
    await driver.save();

    // Send notification to driver
    await notifyDriverRating({
      driver,
      rating,
      comment,
    });

    res.status(201).json({
      rating: newRating,
      message: 'Thank you for your rating!',
    });
  } catch (err) {
    console.error('Create rating error:', err.message);
    res.status(500).json({ message: 'Error creating rating' });
  }
}

// Get ratings for a driver
async function getDriverRatings(req, res) {
  try {
    const { driverId } = req.params;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [ratings, total] = await Promise.all([
      Rating.find({ driver: driverId })
        .populate('client', 'fullName')
        .populate('order', 'pickupAddress dropoffAddress createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Rating.countDocuments({ driver: driverId }),
    ]);

    // Calculate rating statistics
    const allRatings = await Rating.find({ driver: driverId }).select('rating categories').lean();
    const stats = {
      totalRatings: allRatings.length,
      averageRating: allRatings.length > 0 
        ? Math.round((allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length) * 10) / 10
        : 0,
      distribution: {
        5: allRatings.filter(r => r.rating === 5).length,
        4: allRatings.filter(r => r.rating === 4).length,
        3: allRatings.filter(r => r.rating === 3).length,
        2: allRatings.filter(r => r.rating === 2).length,
        1: allRatings.filter(r => r.rating === 1).length,
      },
    };

    res.json({
      ratings,
      stats,
      page,
      totalPages: Math.ceil(total / limit),
      total,
    });
  } catch (err) {
    console.error('Get driver ratings error:', err.message);
    res.status(500).json({ message: 'Error fetching ratings' });
  }
}

// Get a specific rating
async function getRating(req, res) {
  try {
    const { id } = req.params;

    const rating = await Rating.findById(id)
      .populate('client', 'fullName')
      .populate('driver')
      .populate({
        path: 'driver',
        populate: { path: 'user', select: 'fullName email' },
      })
      .populate('order');

    if (!rating) {
      return res.status(404).json({ message: 'Rating not found' });
    }

    // Check authorization
    if (
      rating.client._id.toString() !== req.user.id &&
      rating.driver.user._id.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(rating);
  } catch (err) {
    console.error('Get rating error:', err.message);
    res.status(500).json({ message: 'Error fetching rating' });
  }
}

// Check if order can be rated
async function canRateOrder(req, res) {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Verify user is the client
    if (order.client.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if already rated
    const existingRating = await Rating.findOne({ order: orderId });
    
    res.json({
      canRate: order.status === 'delivered' && !existingRating,
      reason: existingRating 
        ? 'Already rated' 
        : order.status !== 'delivered' 
          ? 'Order not delivered yet' 
          : null,
      hasRating: !!existingRating,
      ratingId: existingRating?._id,
    });
  } catch (err) {
    console.error('Can rate order error:', err.message);
    res.status(500).json({ message: 'Error checking rating status' });
  }
}

module.exports = {
  createRating,
  getDriverRatings,
  getRating,
  canRateOrder,
};
