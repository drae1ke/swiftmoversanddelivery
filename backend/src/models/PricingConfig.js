const mongoose = require('mongoose');

const weightBandSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      required: true,
      trim: true,
    },
    minKg: {
      type: Number,
      required: true,
      min: 0,
    },
    maxKg: {
      type: Number,
      required: true,
      min: 0,
    },
    pricePerKm: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const pricingConfigSchema = new mongoose.Schema(
  {
    baseCostPerKm: {
      type: Number,
      default: 50,
      min: 0,
    },
    weightBands: {
      type: [weightBandSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('PricingConfig', pricingConfigSchema);
