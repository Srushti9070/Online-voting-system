const mongoose = require('mongoose');

/**
 * Candidate Schema
 * Represents running candidates linked to a specific location-based election.
 */
const CandidateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Candidate full name is required'],
    trim: true,
  },
  party: {
    type: String,
    required: [true, 'Political party affiliation is required'],
    trim: true,
  },
  symbolUrl: {
    type: String,
    default: 'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=150', // Default party logo placeholder
  },
  election: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Election',
    required: [true, 'Associated election ID is required'],
  },
  bio: {
    type: String,
    default: 'Independent candidate committed to transparent governance.',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Candidate', CandidateSchema);
