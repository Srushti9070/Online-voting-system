const Election = require('../models/Election');

// @desc    Create a new election boundary (Admin)
// @route   POST /api/elections
// @access  Private/Admin
const createElection = async (req, res) => {
  try {
    const { title, description, type, locationId, startDate, endDate } = req.body;

    const election = await Election.create({
      title,
      description,
      type,
      location: locationId,
      startDate,
      endDate,
      status: 'Active', // Auto-activate for demo/testing simplicity
      createdBy: req.user._id,
    });

    res.status(201).json({ success: true, election });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get elections matching current logged-in voter's location
// @route   GET /api/elections/voter-elections
// @access  Private/Voter
const getElectionsForVoter = async (req, res) => {
  try {
    const voterLocation = req.user.location;

    if (!voterLocation) {
      return res.status(400).json({ success: false, message: 'Voter location boundary missing' });
    }

    // Match elections belonging to voter's exact location ObjectId
    const elections = await Election.find({
      location: voterLocation._id || voterLocation
    }).populate('location');

    res.status(200).json({
      success: true,
      count: elections.length,
      voterLocation,
      elections,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all registered elections in the system
// @route   GET /api/elections
// @access  Public
const getAllElections = async (req, res) => {
  try {
    const elections = await Election.find().populate('location').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: elections.length, elections });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single election details
// @route   GET /api/elections/:id
// @access  Public
const getElectionById = async (req, res) => {
  try {
    const election = await Election.findById(req.params.id).populate('location');
    if (!election) {
      return res.status(404).json({ success: false, message: 'Election not found' });
    }
    res.status(200).json({ success: true, election });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createElection,
  getElectionsForVoter,
  getAllElections,
  getElectionById,
};
