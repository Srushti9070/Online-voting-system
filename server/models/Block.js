const mongoose = require('mongoose');

/**
 * Block Schema
 * Represents an immutable block in our cryptographic blockchain ledger storing anonymized votes.
 */
const BlockSchema = new mongoose.Schema({
  index: {
    type: Number,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true,
  },
  electionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Election',
    required: true,
  },
  candidateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Candidate',
    required: true,
  },
  anonymousToken: {
    type: String,
    required: true,
  },
  previousHash: {
    type: String,
    required: true,
  },
  hash: {
    type: String,
    required: true,
  },
  nonce: {
    type: Number,
    default: 0,
    required: true,
  },
}, {
  timestamps: true,
});

// Index for high-speed chain integrity auditing
BlockSchema.index({ electionId: 1, index: 1 }, { unique: true });

module.exports = mongoose.model('Block', BlockSchema);
