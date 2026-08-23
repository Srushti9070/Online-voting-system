const crypto = require('crypto');

/**
 * Generates an anonymous cryptographic voter token using SHA-256.
 * Combines voterId, electionId, and a system secret salt.
 * Ensures strict 1-person 1-vote without revealing voter identity in ballot ledger.
 */
const generateAnonymousVoterToken = (voterId, electionId) => {
  const salt = process.env.JWT_SECRET || 'voting_salt_secret_2026';
  const rawString = `${voterId}_${electionId}_${salt}`;
  return crypto.createHash('sha256').update(rawString).digest('hex');
};

/**
 * Generates a SHA-256 cryptographic hash of a Voter ID Card Document.
 * Used for verifying uploaded / scanned Voter ID Card authenticity.
 */
const hashVoterCardDocument = (voterId, documentData = '') => {
  const secretSalt = process.env.JWT_SECRET || 'voter_card_salt_2026';
  const rawString = `VOTERCARD_${voterId.toUpperCase()}_${documentData}_${secretSalt}`;
  return crypto.createHash('sha256').update(rawString).digest('hex');
};

/**
 * Standard SHA-256 string hashing utility.
 */
const hashSHA256 = (dataString) => {
  return crypto.createHash('sha256').update(dataString).digest('hex');
};

module.exports = {
  generateAnonymousVoterToken,
  hashVoterCardDocument,
  hashSHA256
};
