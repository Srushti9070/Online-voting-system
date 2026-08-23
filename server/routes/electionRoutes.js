const express = require('express');
const router = express.Router();
const {
  createElection,
  getElectionsForVoter,
  getAllElections,
  getElectionById,
} = require('../controllers/electionController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', getAllElections);
router.get('/voter-elections', protect, getElectionsForVoter);
router.get('/:id', getElectionById);
router.post('/', protect, authorize('admin'), createElection);

module.exports = router;
