const express = require('express');
const router = express.Router();
const { getBlocksByElection, verifyBlockchainIntegrity } = require('../controllers/blockchainController');

router.get('/blocks/:electionId', getBlocksByElection);
router.get('/verify/:electionId', verifyBlockchainIntegrity);

module.exports = router;
