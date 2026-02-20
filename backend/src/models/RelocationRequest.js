const mongoose = require('mongoose');

const relocationRequestSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    pickupAddress: {
      type: String,
      required: true,
    },
    pickupCoordinates: {
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
    destinationAddress: {
      type: String,
      required: true,
    },
    destinationCoordinates: {
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
    scheduledDate: {
      type: Date,
      required: true,
    },
    itemsDescription: {
      type: String,
      required: true,
    },
    estimatedVolume: {
      type: String, // e.g., "1 bedroom apartment", "5 boxes", etc.
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'assigned', 'in-transit', 'completed', 'cancelled'],
      default: 'pending',
    },
    assignedDriver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver',
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    distanceKm: {
      type: Number,
      required: true,
      min: 0,
    },
    vehicleType: {
      type: String,
      enum: ['bicycle', 'bike', 'car', 'van', 'lorry'],
      required: true,
    },
    serviceType: {
      type: String,
      enum: ['Standard', 'Same Day', 'Express'],
      default: 'Standard',
    },
    notes: {
      type: String,
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Index for geospatial queries
relocationRequestSchema.index({ pickupCoordinates: '2dsphere' });
relocationRequestSchema.index({ destinationCoordinates: '2dsphere' });
relocationRequestSchema.index({ client: 1 });
relocationRequestSchema.index({ status: 1 });

module.exports = mongoose.model('RelocationRequest', relocationRequestSchema);
