const Blockchain = require('../blockchain/Blockchain');
const BlockModel = require('../models/Block');

// @desc    Get all mined blocks in the blockchain ledger for a specific election
// @route   GET /api/blockchain/blocks/:electionId
// @access  Public
const getBlocksByElection = async (req, res) => {
  try {
    const { electionId } = req.params;
    const blocks = await BlockModel.find({ electionId }).sort({ index: 1 });

    res.status(200).json({
      success: true,
      count: blocks.length,
      blocks,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Perform full cryptographic verification of the blockchain ledger
// @route   GET /api/blockchain/verify/:electionId
// @access  Public
const verifyBlockchainIntegrity = async (req, res) => {
  try {
    const { electionId } = req.params;

    const blockchain = new Blockchain(electionId);
    const auditReport = await blockchain.isChainValid();

    res.status(200).json({
      success: true,
      electionId,
      auditReport,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getBlocksByElection,
  verifyBlockchainIntegrity,
};
