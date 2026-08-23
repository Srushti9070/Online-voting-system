const User = require('../models/User');
const Election = require('../models/Election');
const Candidate = require('../models/Candidate');
const Vote = require('../models/Vote');
const BlockModel = require('../models/Block');
const Blockchain = require('../blockchain/Blockchain');

// @desc    Get Comprehensive Real-Time Admin Analytics for an Election
// @route   GET /api/admin/analytics/:electionId
// @access  Private/Admin
const getAdminAnalytics = async (req, res) => {
  try {
    const { electionId } = req.params;

    const election = await Election.findById(electionId).populate('location');
    if (!election) {
      return res.status(404).json({ success: false, message: 'Election not found' });
    }

    // 1. Total Registered Voters eligible for this location
    const totalEligibleVoters = await User.countDocuments({
      role: 'voter',
      location: election.location._id
    });

    // 2. Total Votes Cast in this election
    const totalVotesCast = await Vote.countDocuments({ election: electionId });

    // 3. Voter Turnout Percentage
    const turnoutPercentage = totalEligibleVoters > 0
      ? ((totalVotesCast / totalEligibleVoters) * 100).toFixed(1)
      : '0.0';

    // 4. Candidate Tallies aggregated directly from verified Blockchain
    const voteCountsFromChain = await Blockchain.getVoteResultsFromChain(electionId);
    const candidates = await Candidate.find({ election: electionId });

    const candidateTallies = candidates.map(cand => ({
      candidateId: cand._id,
      name: cand.name,
      party: cand.party,
      symbolUrl: cand.symbolUrl,
      votes: voteCountsFromChain[cand._id.toString()] || 0,
      percentage: totalVotesCast > 0
        ? (((voteCountsFromChain[cand._id.toString()] || 0) / totalVotesCast) * 100).toFixed(1)
        : '0.0'
    }));

    // 5. Blockchain Block Ledger Summary
    const totalBlocksMined = await BlockModel.countDocuments({ electionId });
    const latestBlocks = await BlockModel.find({ electionId }).sort({ index: -1 }).limit(5);

    // 6. Multi-Factor Security Pipeline Metrics (Simulated telemetry)
    const securityMetrics = {
      faceMatchSuccessRate: 98.6,
      smsOtpVerifyRate: 99.2,
      duplicateAttemptsBlocked: Math.max(0, totalVotesCast > 5 ? 2 : 0),
      avgBiometricDistance: 0.28,
    };

    res.status(200).json({
      success: true,
      election,
      turnout: {
        totalEligibleVoters,
        totalVotesCast,
        turnoutPercentage,
      },
      candidateTallies,
      blockchain: {
        totalBlocksMined,
        latestBlocks,
      },
      securityMetrics,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update Election Status (Active, Paused, Completed)
// @route   PUT /api/admin/election-status
// @access  Private/Admin
const updateElectionStatus = async (req, res) => {
  try {
    const { electionId, status } = req.body;

    if (!['Upcoming', 'Active', 'Completed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid election status' });
    }

    const election = await Election.findByIdAndUpdate(
      electionId,
      { status },
      { new: true }
    );

    // Broadcast status change event via Socket.io
    const io = req.app.get('io');
    if (io) {
      io.emit('election_status_changed', { electionId, status });
    }

    res.status(200).json({
      success: true,
      message: `Election status updated to ${status}`,
      election,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAdminAnalytics,
  updateElectionStatus,
};
