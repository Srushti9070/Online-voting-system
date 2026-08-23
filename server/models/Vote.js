const mongoose = require('mongoose');

/**
 * Vote Receipt Schema
 * Prevents double-voting per election using an anonymous cryptographic voter token.
 * Stores voterUserId link ONLY for private receipt inspection by the voter themselves.
 */
const VoteSchema = new mongoose.Schema({
  election: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Election',
    required: [true, 'Election ID is required'],
  },
  voterUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  candidateVotedFor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Candidate',
    required: true,
  },
  anonymousVoterToken: {
    type: String,
    required: true,
    unique: true, // Guarantees 1 Person 1 Vote per election
  },
  votedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Index to quickly check duplicate vote attempts
VoteSchema.index({ election: 1, anonymousVoterToken: 1 }, { unique: true });

module.exports = mongoose.model('Vote', VoteSchema);
