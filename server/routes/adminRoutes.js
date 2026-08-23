const express = require('express');
const router = express.Router();
const { getAdminAnalytics, updateElectionStatus } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/analytics/:electionId', protect, authorize('admin'), getAdminAnalytics);
router.put('/election-status', protect, authorize('admin'), updateElectionStatus);

module.exports = router;
