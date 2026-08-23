const express = require('express');
const router = express.Router();
const { createCandidate, getCandidatesByElection } = require('../controllers/candidateController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/election/:electionId', getCandidatesByElection);
router.post('/', protect, authorize('admin'), createCandidate);

module.exports = router;
