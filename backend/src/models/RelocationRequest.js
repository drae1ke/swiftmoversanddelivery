const mongoose = require('mongoose');

const relocationRequestSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    pickupAddress: { type: String, required: true },
    pickupCoordinates: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] },
    },
    destinationAddress: { type: String, required: true },
    destinationCoordinates: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] },
    },
    scheduledDate: { type: Date, required: true },
    itemsDescription: { type: String, required: true },
    estimatedVolume: { type: String, required: true },

    status: {
      type: String,
      enum: ['pending', 'assigned', 'in-transit', 'completed', 'cancelled'],
      default: 'pending',
    },

    assignedDriver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver',
    },

    // ── Fairness & Audit Fields ───────────────────────────────────────────────
    // How the driver was assigned - prevents hidden admin bias
    assignmentMethod: {
      type: String,
      enum: ['self-dispatch', 'auto-assign', 'admin-override'],
      default: null,
    },
    assignedAt: { type: Date },

    // Admin override audit: who forced the assignment and why
    adminOverrideBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    adminOverrideReason: { type: String },

    // Auto-assign audit: score that won
    autoAssignScore: { type: Number },

    // Drivers who were notified but didn't accept (for analytics / fairness review)
    notifiedDrivers: [
      {
        driver: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver' },
        notifiedAt: { type: Date },
        responded: { type: Boolean, default: false },
      },
    ],

    // How long self-dispatch window was open before escalating (ms)
    selfDispatchWindowMs: { type: Number, default: 30 * 60 * 1000 }, // 30 min
    selfDispatchExpiredAt: { type: Date },
    // ─────────────────────────────────────────────────────────────────────────

    price: { type: Number, required: true, min: 0 },
    distanceKm: { type: Number, required: true, min: 0 },
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
    notes: { type: String },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

relocationRequestSchema.index({ pickupCoordinates: '2dsphere' });
relocationRequestSchema.index({ destinationCoordinates: '2dsphere' });
relocationRequestSchema.index({ client: 1 });
relocationRequestSchema.index({ status: 1 });
relocationRequestSchema.index({ assignedDriver: 1 });
relocationRequestSchema.index({ scheduledDate: 1 });

module.exports = mongoose.models.RelocationRequest || mongoose.model('RelocationRequest', relocationRequestSchema);