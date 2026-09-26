const mongoose = require('mongoose');

/**
 * Vote Schema
 * Represents an individual vote cast in an election.
 * Enforces atomic double-voting prevention via unique compound indexes.
 */
const VoteSchema = new mongoose.Schema({
  election: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Election',
    required: [true, 'Election assignment is required'],
  },
  voterUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Voter reference is required for private voter receipt lookup'],
  },
  candidateVotedFor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Candidate',
    required: [true, 'Candidate reference is required'],
  },
  anonymousVoterToken: {
    type: String, // Cryptographic SHA-256 hash token: SHA256(voterId + electionId)
    required: [true, 'Anonymous voter token is required'],
  },
  votedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Atomic Compound Unique Indexes to prevent race condition double-voting
VoteSchema.index({ election: 1, anonymousVoterToken: 1 }, { unique: true });
VoteSchema.index({ election: 1, voterUser: 1 }, { unique: true });

module.exports = mongoose.model('Vote', VoteSchema);
