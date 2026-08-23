const Candidate = require('../models/Candidate');

// @desc    Add candidate to an election (Admin)
// @route   POST /api/candidates
// @access  Private/Admin
const createCandidate = async (req, res) => {
  try {
    const { name, party, symbolUrl, electionId, bio } = req.body;

    const candidate = await Candidate.create({
      name,
      party,
      symbolUrl: symbolUrl || undefined,
      election: electionId,
      bio,
    });

    res.status(201).json({ success: true, candidate });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all candidates for a specific election
// @route   GET /api/candidates/election/:electionId
// @access  Public
const getCandidatesByElection = async (req, res) => {
  try {
    const candidates = await Candidate.find({ election: req.params.electionId });
    res.status(200).json({ success: true, count: candidates.length, candidates });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createCandidate,
  getCandidatesByElection,
};
