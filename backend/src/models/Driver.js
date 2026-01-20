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
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Driver', driverSchema);
