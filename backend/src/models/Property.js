const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema(
  {
    landlord: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    storageType: {
      type: String,
      enum: ['room', 'garage', 'warehouse', 'container', 'basement', 'attic', 'other'],
      required: true,
    },
    sizeSqFt: {
      type: Number,
      required: true,
      min: 1,
    },
    pricePerMonth: {
      type: Number,
      required: true,
      min: 0,
    },
    images: [{
      type: String,
    }],
    amenities: [{
      type: String,
      enum: ['climate-controlled', 'security-camera', '24hr-access', 'lighting', 'ventilation', 'loading-dock', 'ground-floor', 'first-floor', 'elevator', 'parking', 'wifi', 'electricity', 'water', 'other']
    }],
    availability: {
      type: String,
      enum: ['available', 'unavailable', 'reserved'],
      default: 'available',
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0],
      },
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'active', 'inactive'],
      default: 'pending',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for geospatial queries
propertySchema.index({ location: '2dsphere' });
propertySchema.index({ landlord: 1 });
propertySchema.index({ status: 1 });
propertySchema.index({ availability: 1 });

module.exports = mongoose.model('Property', propertySchema);
