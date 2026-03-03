const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver',
    },
    pickupAddress: {
      type: String,
      required: true,
    },
    dropoffAddress: {
      type: String,
      required: true,
    },
    recipientName: {
      type: String,
    },
    recipientPhone: {
      type: String,
    },
    distanceKm: {
      type: Number,
      required: true,
    },
    packageWeightKg: {
      type: Number,
      required: true,
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
    priceKes: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'assigned', 'in-transit', 'delivered'],
      default: 'pending',
    },
    deliveredAt: {
      type: Date,
    },
    rating: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Rating',
    },
    driverLocation: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude] - Updated in real-time during delivery
        default: [0, 0],
      },
    },
    lastLocationUpdate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
orderSchema.index({ client: 1, createdAt: -1 });
orderSchema.index({ driver: 1, status: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ driverLocation: '2dsphere' });

module.exports = mongoose.model('Order', orderSchema);
