const Block = require('./Block');
const BlockModel = require('../models/Block');

/**
 * Blockchain Class
 * Manages the immutable voting ledger for a specific election.
 */
class Blockchain {
  constructor(electionId) {
    this.electionId = electionId;
    this.chain = [];
    this.difficulty = parseInt(process.env.BLOCKCHAIN_DIFFICULTY) || 2;
  }

  /**
   * Initializes the Genesis Block (Block #0) if no chain exists for this election in DB.
   */
  async initializeChain() {
    const existingBlocks = await BlockModel.find({ electionId: this.electionId }).sort({ index: 1 });

    if (existingBlocks.length > 0) {
      this.chain = existingBlocks;
    } else {
      const genesisBlock = this.createGenesisBlock();
      await this.saveBlockToDB(genesisBlock);
      this.chain.push(genesisBlock);
    }
    return this.chain;
  }

  /**
   * Creates the initial zero block for the election chain.
   */
  createGenesisBlock() {
    const genesisPreviousHash = process.env.GENESIS_PREVIOUS_HASH || '0'.repeat(64);
    const genesisBlock = new Block(
      0,
      new Date().toISOString(),
      this.electionId,
      '000000000000000000000000', // Null candidate for genesis
      'GENESIS_BLOCK_TOKEN',
      genesisPreviousHash
    );
    genesisBlock.mineBlock(this.difficulty);
    return genesisBlock;
  }

  /**
   * Returns the latest block in the chain.
   */
  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  /**
   * Adds a new vote block to the blockchain, mines it, and persists it to MongoDB.
   * @param {string} candidateId Selected candidate ObjectId string
   * @param {string} anonymousToken Cryptographic anonymous voter token
   */
  async addVoteBlock(candidateId, anonymousToken) {
    const latestBlock = this.getLatestBlock();
    const newIndex = latestBlock.index + 1;
    const newTimestamp = new Date().toISOString();
    
    const newBlock = new Block(
      newIndex,
      newTimestamp,
      this.electionId,
      candidateId,
      anonymousToken,
      latestBlock.hash
    );

    newBlock.mineBlock(this.difficulty);

    // Save mined block to MongoDB persistence
    const savedBlock = await this.saveBlockToDB(newBlock);
    this.chain.push(savedBlock);

    return savedBlock;
  }

  /**
   * Saves a block instance to MongoDB.
   */
  async saveBlockToDB(block) {
    const blockDoc = new BlockModel({
      index: block.index,
      timestamp: block.timestamp,
      electionId: block.electionId,
      candidateId: block.candidateId,
      anonymousToken: block.anonymousToken,
      previousHash: block.previousHash,
      hash: block.hash,
      nonce: block.nonce,
    });
    return await blockDoc.save();
  }

  /**
   * Performs complete cryptographic verification of the entire blockchain.
   * Verifies SHA-256 hash recalculation and previousHash linkage for every block.
   * @returns {object} { isValid: boolean, error: string, verifiedCount: number }
   */
  async isChainValid() {
    const blocks = await BlockModel.find({ electionId: this.electionId }).sort({ index: 1 });

    if (blocks.length === 0) {
      return { isValid: false, error: 'Blockchain is empty', verifiedCount: 0 };
    }

    for (let i = 1; i < blocks.length; i++) {
      const currentBlock = blocks[i];
      const previousBlock = blocks[i - 1];

      // Re-instantiate Block instance to recalculate hash
      const tempBlock = new Block(
        currentBlock.index,
        currentBlock.timestamp.toISOString(),
        currentBlock.electionId,
        currentBlock.candidateId,
        currentBlock.anonymousToken,
        currentBlock.previousHash
      );
      tempBlock.nonce = currentBlock.nonce;
      const recomputedHash = tempBlock.calculateHash();

      // Check 1: Has block data been tampered with?
      if (currentBlock.hash !== recomputedHash) {
        return {
          isValid: false,
          error: `Tampering detected at Block #${currentBlock.index}. Stored hash mismatch!`,
          tamperedIndex: currentBlock.index
        };
      }

      // Check 2: Does current block's previousHash match the previous block's hash?
      if (currentBlock.previousHash !== previousBlock.hash) {
        return {
          isValid: false,
          error: `Broken chain link between Block #${previousBlock.index} and Block #${currentBlock.index}!`,
          tamperedIndex: currentBlock.index
        };
      }
    }

    return {
      isValid: true,
      message: 'Blockchain integrity verified. All cryptographic hashes match.',
      verifiedCount: blocks.length
    };
  }

  /**
   * Aggregates votes directly from the verified blockchain.
   */
  static async getVoteResultsFromChain(electionId) {
    const blocks = await BlockModel.find({ 
      electionId, 
      index: { $gt: 0 } // Exclude Genesis Block
    });

    const results = {};
    blocks.forEach(block => {
      const candId = block.candidateId.toString();
      results[candId] = (results[candId] || 0) + 1;
    });

    return results;
  }
}

module.exports = Blockchain;
