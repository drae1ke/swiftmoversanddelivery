const mongoose = require('mongoose');

const landlordSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    properties: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
    }],
    verified: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      default: 5.0,
      min: 0,
      max: 5,
    },
    totalProperties: {
      type: Number,
      default: 0,
    },
    activeListings: {
      type: Number,
      default: 0,
    },
    responseRate: {
      type: Number,
      default: 100,
    },
    responseTime: {
      type: String,
      default: 'within hours',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Landlord', landlordSchema);
