const express = require('express');
const Property = require('../models/Property');
const { authenticate, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Get all available properties (public)
router.get('/', async (req, res) => {
  try {
    const {
      storageType,
      minSize,
      maxSize,
      minPrice,
      maxPrice,
      available,
      page = 1,
      limit = 20
    } = req.query;

    const query = { status: 'active' };

    if (storageType) {
      query.storageType = storageType;
    }

    if (available) {
      query.availability = available;
    }

    if (minSize || maxSize) {
      query.sizeSqFt = {};
      if (minSize) query.sizeSqFt.$gte = Number(minSize);
      if (maxSize) query.sizeSqFt.$lte = Number(maxSize);
    }

    if (minPrice || maxPrice) {
      query.pricePerMonth = {};
      if (minPrice) query.pricePerMonth.$gte = Number(minPrice);
      if (maxPrice) query.pricePerMonth.$lte = Number(maxPrice);
    }

    const skip = (Number(page) - 1) * Number(limit);

    const properties = await Property.find(query)
      .populate('landlord', 'fullName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Property.countDocuments(query);

    res.json({
      properties,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        limit: Number(limit)
      }
    });
  } catch (err) {
    console.error('Get properties error:', err.message);
    res.status(500).json({ message: 'Error fetching properties' });
  }
});

// Get property by ID
router.get('/:id', async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate('landlord', 'fullName email rating');

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Increment views
    property.views += 1;
    await property.save();

    res.json(property);
  } catch (err) {
    console.error('Get property error:', err.message);
    res.status(500).json({ message: 'Error fetching property' });
  }
});

// Get landlord's properties
router.get('/my/properties', authenticate, authorizeRoles('landlord'), async (req, res) => {
  try {
    const properties = await Property.find({ landlord: req.user.id })
      .sort({ createdAt: -1 });

    res.json(properties);
  } catch (err) {
    console.error('Get my properties error:', err.message);
    res.status(500).json({ message: 'Error fetching properties' });
  }
});

// Create property (landlord only)
router.post('/', authenticate, authorizeRoles('landlord'), async (req, res) => {
  try {
    const {
      title,
      description,
      address,
      storageType,
      sizeSqFt,
      pricePerMonth,
      images,
      amenities,
      location,
    } = req.body;

    if (!title || !description || !address || !storageType || !sizeSqFt || !pricePerMonth) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const property = await Property.create({
      landlord: req.user.id,
      title,
      description,
      address,
      storageType,
      sizeSqFt,
      pricePerMonth,
      images: images || [],
      amenities: amenities || [],
      location: location || { type: 'Point', coordinates: [0, 0] },
      status: 'pending',
      availability: 'available',
    });

    res.status(201).json(property);
  } catch (err) {
    console.error('Create property error:', err.message);
    res.status(500).json({ message: 'Error creating property' });
  }
});

// Update property (landlord only)
router.put('/:id', authenticate, authorizeRoles('landlord'), async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Check ownership
    if (property.landlord.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this property' });
    }

    const {
      title,
      description,
      address,
      storageType,
      sizeSqFt,
      pricePerMonth,
      images,
      amenities,
      availability,
      location,
    } = req.body;

    if (title) property.title = title;
    if (description) property.description = description;
    if (address) property.address = address;
    if (storageType) property.storageType = storageType;
    if (sizeSqFt) property.sizeSqFt = sizeSqFt;
    if (pricePerMonth) property.pricePerMonth = pricePerMonth;
    if (images) property.images = images;
    if (amenities) property.amenities = amenities;
    if (availability) property.availability = availability;
    if (location) property.location = location;

    await property.save();

    res.json(property);
  } catch (err) {
    console.error('Update property error:', err.message);
    res.status(500).json({ message: 'Error updating property' });
  }
});

// Delete property (landlord only)
router.delete('/:id', authenticate, authorizeRoles('landlord'), async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Check ownership
    if (property.landlord.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this property' });
    }

    await property.deleteOne();

    res.json({ message: 'Property deleted successfully' });
  } catch (err) {
    console.error('Delete property error:', err.message);
    res.status(500).json({ message: 'Error deleting property' });
  }
});

// Admin: Approve/reject property
router.put('/:id/status', authenticate, authorizeRoles('admin'), async (req, res) => {
  try {
    const { status, isVerified } = req.body;

    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    if (status) property.status = status;
    if (typeof isVerified === 'boolean') property.isVerified = isVerified;

    await property.save();

    res.json(property);
  } catch (err) {
    console.error('Update property status error:', err.message);
    res.status(500).json({ message: 'Error updating property status' });
  }
});

// Book a property (client - storage booking request)
router.post('/:id/book', authenticate, authorizeRoles('client'), async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: 'Property not found' });
    if (property.status !== 'active' && property.status !== 'approved') {
      return res.status(400).json({ message: 'Property is not available for booking' });
    }

    const { startDate, duration, access, notes } = req.body;
    if (!startDate) return res.status(400).json({ message: 'Start date is required' });

    // Generate a simple booking reference
    const refNum = Math.random().toString(36).substr(2, 6).toUpperCase();
    const bookingRef = `ST-${new Date().getFullYear()}-${refNum}`;

    res.status(201).json({
      bookingRef,
      property: {
        _id: property._id,
        title: property.title,
        address: property.address,
        pricePerMonth: property.pricePerMonth,
      },
      client: req.user.id,
      startDate,
      duration: duration || '1 Month',
      access: access || 'Weekdays only',
      notes: notes || '',
      status: 'confirmed',
      message: 'Booking confirmed. You will receive access credentials within 30 minutes.',
    });
  } catch (err) {
    console.error('Book property error:', err.message);
    res.status(500).json({ message: 'Error booking property' });
  }
});

module.exports = router;

