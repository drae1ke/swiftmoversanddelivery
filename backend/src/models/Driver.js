const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    vehicleType: {
      type: String,
      enum: ['bicycle', 'bike', 'car', 'van', 'lorry'],
      default: 'bike',
    },
    vehicleDescription: {
      type: String,
      default: '',
    },
    plateNumber: {
      type: String,
      default: '',
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      default: 5.0,
    },
    totalTrips: {
      type: Number,
      default: 0,
    },
    completionRate: {
      type: Number,
      default: 100,
    },
    onTimeRate: {
      type: Number,
      default: 100,
    },
    customerSatisfaction: {
      type: Number,
      default: 100,
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
    lastLocationUpdate: {
      type: Date,
    },
    totalRatings: {
      type: Number,
      default: 0,
    },
    averageRating: {
      type: Number,
      default: 5.0,
      min: 0,
      max: 5,
    },
  },
  {
    timestamps: true,
  }
);

// Geospatial index for location-based queries
driverSchema.index({ location: '2dsphere' });
driverSchema.index({ isOnline: 1 });
driverSchema.index({ user: 1 });

module.exports = mongoose.model('Driver', driverSchema);
