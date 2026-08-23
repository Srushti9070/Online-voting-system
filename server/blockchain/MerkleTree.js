const crypto = require('crypto');

/**
 * MerkleTree Class
 * Constructs a binary Merkle Hash Tree from block transactions.
 * Provides O(log N) cryptographic Merkle Inclusion Proofs.
 */
class MerkleTree {
  constructor(transactions = []) {
    this.leaves = transactions.map(tx => this.hash(tx));
    this.tree = [];
    this.buildTree();
  }

  /**
   * Cryptographic SHA-256 hash helper
   */
  hash(data) {
    const stringData = typeof data === 'object' ? JSON.stringify(data) : String(data);
    return crypto.createHash('sha256').update(stringData).digest('hex');
  }

  /**
   * Constructs the Merkle Tree levels up to the Merkle Root
   */
  buildTree() {
    if (this.leaves.length === 0) {
      this.tree = [['0'.repeat(64)]];
      return;
    }

    let currentLevel = [...this.leaves];
    this.tree = [currentLevel];

    while (currentLevel.length > 1) {
      const nextLevel = [];
      for (let i = 0; i < currentLevel.length; i += 2) {
        const left = currentLevel[i];
        const right = i + 1 < currentLevel.length ? currentLevel[i + 1] : left;
        const parentHash = this.hash(left + right);
        nextLevel.push(parentHash);
      }
      this.tree.push(nextLevel);
      currentLevel = nextLevel;
    }
  }

  /**
   * Returns the 32-byte hexadecimal Merkle Root Hash
   */
  getRoot() {
    if (this.tree.length === 0) return '0'.repeat(64);
    return this.tree[this.tree.length - 1][0];
  }

  /**
   * Generates a Merkle Inclusion Proof for a specific transaction index
   * @param {number} index Index of transaction
   */
  getProof(index) {
    const proof = [];
    let currentIdx = index;

    for (let level = 0; level < this.tree.length - 1; level++) {
      const levelNodes = this.tree[level];
      const isRightNode = currentIdx % 2 === 1;
      const siblingIdx = isRightNode ? currentIdx - 1 : currentIdx + 1;

      if (siblingIdx < levelNodes.length) {
        proof.push({
          position: isRightNode ? 'left' : 'right',
          data: levelNodes[siblingIdx]
        });
      }

      currentIdx = Math.floor(currentIdx / 2);
    }

    return proof;
  }

  /**
   * Verifies a Merkle Inclusion Proof against a Merkle Root
   */
  static verifyProof(leafHash, proof, root) {
    let hash = leafHash;

    for (const step of proof) {
      if (step.position === 'left') {
        hash = crypto.createHash('sha256').update(step.data + hash).digest('hex');
      } else {
        hash = crypto.createHash('sha256').update(hash + step.data).digest('hex');
      }
    }

    return hash === root;
  }
}

module.exports = MerkleTree;
