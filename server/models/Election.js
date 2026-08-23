const mongoose = require('mongoose');

/**
 * Election Schema
 * Represents location-scoped elections managed by admins.
 */
const ElectionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Election title is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Election description is required'],
  },
  type: {
    type: String,
    required: [true, 'Election classification type is required'],
    enum: ['Gram Panchayat', 'Ward', 'Municipality', 'Taluk', 'District', 'City'],
  },
  location: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location',
    required: [true, 'Assigned location boundary is required'],
  },
  startDate: {
    type: Date,
    required: [true, 'Election start date is required'],
  },
  endDate: {
    type: Date,
    required: [true, 'Election end date is required'],
  },
  status: {
    type: String,
    enum: ['Upcoming', 'Active', 'Completed'],
    default: 'Upcoming',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Election', ElectionSchema);
