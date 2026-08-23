const crypto = require('crypto');

/**
 * Block Class
 * Represents a single block data structure in the cryptographic voting chain.
 */
class Block {
  constructor(index, timestamp, electionId, candidateId, anonymousToken, previousHash = '') {
    this.index = index;
    this.timestamp = timestamp || new Date().toISOString();
    this.electionId = electionId;
    this.candidateId = candidateId;
    this.anonymousToken = anonymousToken;
    this.previousHash = previousHash;
    this.nonce = 0;
    this.hash = this.calculateHash();
  }

  /**
   * Generates a cryptographic SHA-256 hash derived from all block properties.
   * @returns {string} 64-character hexadecimal SHA-256 hash.
   */
  calculateHash() {
    const dataString = 
      this.index + 
      this.previousHash + 
      this.timestamp + 
      this.electionId + 
      this.candidateId + 
      this.anonymousToken + 
      this.nonce;
      
    return crypto.createHash('sha256').update(dataString).digest('hex');
  }

  /**
   * Mine block with Proof-of-Work to enforce computational integrity.
   * @param {number} difficulty Number of leading zeroes required (default: 2).
   */
  mineBlock(difficulty = 2) {
    const targetPrefix = Array(difficulty + 1).join('0');
    while (this.hash.substring(0, difficulty) !== targetPrefix) {
      this.nonce++;
      this.hash = this.calculateHash();
    }
    console.log(`⛏️ Block Mined Successfully! Hash: ${this.hash} (Nonce: ${this.nonce})`);
  }
}

module.exports = Block;
