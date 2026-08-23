const mongoose = require('mongoose');

/**
 * Location Schema
 * Represents geographical location boundaries for targeted voting eligibility.
 */
const LocationSchema = new mongoose.Schema({
  state: {
    type: String,
    required: [true, 'State name is required'],
    trim: true,
  },
  district: {
    type: String,
    required: [true, 'District name is required'],
    trim: true,
  },
  city: {
    type: String,
    trim: true,
    default: null,
  },
  taluk: {
    type: String,
    trim: true,
    default: null,
  },
  municipality: {
    type: String,
    trim: true,
    default: null,
  },
  ward: {
    type: String,
    trim: true,
    default: null,
  },
  panchayat: {
    type: String,
    trim: true,
    default: null,
  },
}, {
  timestamps: true,
});

// Index to prevent duplicate location entries
LocationSchema.index({ state: 1, district: 1, city: 1, taluk: 1, ward: 1, panchayat: 1 }, { unique: true });

module.exports = mongoose.model('Location', LocationSchema);
