const express = require('express');
const router = express.Router();
const { castVote, getMyVoteReceipt, checkVoterStatus, getLiveResults } = require('../controllers/voteController');
const { protect } = require('../middleware/authMiddleware');

router.post('/cast', protect, castVote);
router.get('/my-receipt/:electionId', protect, getMyVoteReceipt);
router.get('/status/:electionId', protect, checkVoterStatus);
router.get('/results/:electionId', getLiveResults);

module.exports = router;
