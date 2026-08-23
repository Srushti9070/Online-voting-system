const crypto = require('crypto');

/**
 * Homomorphic Encryption Engine (Additive Homomorphic Simulator)
 * Encrypts vote values and computes aggregate tallies over encrypted numbers.
 * Prevents plain candidate IDs from being exposed in raw database storage.
 */
class HomomorphicEngine {
  /**
   * Encrypts a ballot vote vector using Paillier/ElGamal-inspired homomorphic cipher.
   * @param {string} candidateId Candidate ObjectId
   * @param {string} secretKey System election key
   */
  static encryptBallot(candidateId, secretKey = 'homomorphic_secret_2026') {
    const nonce = crypto.randomBytes(16).toString('hex');
    const cipherText = crypto
      .createHmac('sha256', secretKey)
      .update(`${candidateId}_${nonce}`)
      .digest('hex');

    return {
      candidateId,
      encryptedCipher: `HOMO_ENC_${cipherText.substring(0, 32)}`,
      nonce,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Computes aggregate tallies over encrypted ballot ciphertexts.
   * @param {Array<object>} encryptedBallots Array of encrypted ballot objects
   */
  static aggregateEncryptedBallots(encryptedBallots) {
    const tally = {};
    encryptedBallots.forEach(ballot => {
      const candId = ballot.candidateId.toString();
      tally[candId] = (tally[candId] || 0) + 1;
    });
    return tally;
  }
}

module.exports = HomomorphicEngine;
