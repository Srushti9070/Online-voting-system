const Location = require('../models/Location');

// @desc    Create a new location boundary
// @route   POST /api/locations
// @access  Private/Admin
const createLocation = async (req, res) => {
  try {
    const { state, district, city, taluk, municipality, ward, panchayat } = req.body;

    const location = await Location.create({
      state,
      district,
      city: city || null,
      taluk: taluk || null,
      municipality: municipality || null,
      ward: ward || null,
      panchayat: panchayat || null,
    });

    res.status(201).json({ success: true, location });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all registered location boundaries
// @route   GET /api/locations
// @access  Public
const getLocations = async (req, res) => {
  try {
    const locations = await Location.find().sort({ state: 1, district: 1 });
    res.status(200).json({ success: true, count: locations.length, locations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createLocation,
  getLocations,
};
