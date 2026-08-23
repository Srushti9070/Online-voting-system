const express = require('express');
const router = express.Router();
const { createLocation, getLocations } = require('../controllers/locationController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', getLocations);
router.post('/', protect, authorize('admin'), createLocation);

module.exports = router;
