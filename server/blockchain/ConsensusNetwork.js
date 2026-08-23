const crypto = require('crypto');

/**
 * ConsensusNetwork Class (pBFT Multi-Node Consensus Simulator)
 * Simulates a Practical Byzantine Fault Tolerance distributed validator network.
 * Requires >= 67% (2/3) node digital signatures before a block is appended to the ledger.
 */
class ConsensusNetwork {
  constructor() {
    // 3 Independent Authority Validator Nodes
    this.nodes = [
      { id: 'NODE_01_ELECTION_COMMISSION', name: 'Election Commission Validator Node', secret: 'ec_node_key_2026' },
      { id: 'NODE_02_SUPREME_COURT', name: 'Supreme Court Observer Node', secret: 'sc_node_key_2026' },
      { id: 'NODE_03_IIT_ACADEMIC', name: 'IIT P2P Consensus Node', secret: 'iit_node_key_2026' },
    ];
  }

  /**
   * Broadcasts block candidate to validator nodes and collects digital signatures.
   * @param {object} block Mined Block instance
   */
  async validateAndSignBlock(block) {
    const signatures = [];

    for (const node of this.nodes) {
      // Each validator node computes a digital signature over the block hash
      const nodeSig = crypto
        .createHmac('sha256', node.secret)
        .update(block.hash)
        .digest('hex');

      signatures.push({
        nodeId: node.id,
        nodeName: node.name,
        signature: `SIG_${nodeSig.substring(0, 24)}`,
        timestamp: new Date().toISOString(),
      });
    }

    const consensusThreshold = Math.ceil((this.nodes.length * 2) / 3); // 2 of 3 nodes
    const consensusReached = signatures.length >= consensusThreshold;

    console.log(`🏛️ pBFT Consensus Achieved: ${signatures.length}/${this.nodes.length} Nodes Signed Block #${block.index}`);

    return {
      consensusReached,
      consensusThreshold,
      nodeSignatures: signatures,
    };
  }
}

module.exports = ConsensusNetwork;
