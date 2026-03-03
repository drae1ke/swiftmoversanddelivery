const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      unique: true, // One rating per order
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver',
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    categories: {
      punctuality: { type: Number, min: 1, max: 5 },
      professionalism: { type: Number, min: 1, max: 5 },
      carCondition: { type: Number, min: 1, max: 5 },
      communication: { type: Number, min: 1, max: 5 },
    },
    isAnonymous: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
ratingSchema.index({ driver: 1, createdAt: -1 });
ratingSchema.index({ client: 1 });
ratingSchema.index({ order: 1 });
ratingSchema.index({ rating: 1 });

module.exports = mongoose.model('Rating', ratingSchema);
