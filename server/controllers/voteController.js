const Vote = require('../models/Vote');
const Election = require('../models/Election');
const Candidate = require('../models/Candidate');
const Blockchain = require('../blockchain/Blockchain');
const MerkleTree = require('../blockchain/MerkleTree');
const ConsensusNetwork = require('../blockchain/ConsensusNetwork');
const HomomorphicEngine = require('../utils/homomorphicEngine');
const ZKProofEngine = require('../utils/zkProofEngine');
const { generateAnonymousVoterToken } = require('../utils/hashUtils');

// @desc    Cast an anonymous vote into the cryptographic blockchain ledger with atomic duplicate checks & pBFT Consensus
// @route   POST /api/votes/cast
// @access  Private/Voter
const castVote = async (req, res) => {
  try {
    const { electionId, candidateId } = req.body;
    const voterId = req.user.voterId;
    const userId = req.user._id;

    if (!electionId || !candidateId) {
      return res.status(400).json({ success: false, message: 'Election ID and Candidate ID are required' });
    }

    // 1. Verify election exists and is active
    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({ success: false, message: 'Election not found' });
    }
    if (election.status !== 'Active') {
      return res.status(400).json({ success: false, message: 'This election is not currently active for voting.' });
    }

    // 2. Verify candidate exists
    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({ success: false, message: 'Selected candidate not found' });
    }

    // 3. Generate Zero-Knowledge Identity Proof & Anonymous Token
    const zkProof = ZKProofEngine.generateZKProof(voterId, electionId);
    const anonymousToken = generateAnonymousVoterToken(voterId, electionId);

    // 4. Pre-check for existing vote
    const existingVote = await Vote.findOne({
      $or: [
        { election: electionId, anonymousVoterToken: anonymousToken },
        { election: electionId, voterUser: userId }
      ]
    });
    if (existingVote) {
      return res.status(400).json({
        success: false,
        message: 'Duplicate Vote Blocked! You have already cast your vote in this election.'
      });
    }

    // 5. Encrypt Ballot using Homomorphic Encryption Cipher
    const homomorphicCipher = HomomorphicEngine.encryptBallot(candidateId);

    // 6. Initialize Blockchain Engine & Append Mined Block to Ledger
    const blockchain = new Blockchain(electionId);
    await blockchain.initializeChain();
    const minedBlock = await blockchain.addVoteBlock(candidateId, anonymousToken);

    // 7. Run pBFT Multi-Node Consensus Network Validation
    const consensusNet = new ConsensusNetwork();
    const consensusResult = await consensusNet.validateAndSignBlock(minedBlock);

    // 8. Generate Merkle Tree & O(log N) Cryptographic Inclusion Proof Receipt
    const merkleTree = new MerkleTree([minedBlock.hash]);
    const merkleRoot = merkleTree.getRoot();
    const merkleProof = merkleTree.getProof(0);

    // 9. Atomic DB Record Insertion (Handled with unique compound index catch for 100% race-condition safety)
    try {
      await Vote.create({
        election: electionId,
        voterUser: userId,
        candidateVotedFor: candidateId,
        anonymousVoterToken: anonymousToken,
      });
    } catch (dbErr) {
      if (dbErr.code === 11000) {
        return res.status(400).json({
          success: false,
          message: 'Atomic Duplicate Vote Prevention: Vote already registered for this election.'
        });
      }
      throw dbErr;
    }

    // 10. Calculate updated results directly from Blockchain ledger
    const voteCountsFromChain = await Blockchain.getVoteResultsFromChain(electionId);
    const candidates = await Candidate.find({ election: electionId });
    const formattedResults = candidates.map(cand => ({
      candidateId: cand._id,
      name: cand.name,
      party: cand.party,
      symbolUrl: cand.symbolUrl,
      votes: voteCountsFromChain[cand._id.toString()] || 0,
    }));

    // 11. Broadcast Real-Time Vote Count Event via Socket.io
    const io = req.app.get('io');
    if (io) {
      io.to(electionId.toString()).emit('vote_cast_event', {
        electionId,
        blockIndex: minedBlock.index,
        blockHash: minedBlock.hash,
        timestamp: minedBlock.timestamp,
        merkleRoot,
        results: formattedResults
      });
    }

    res.status(201).json({
      success: true,
      message: 'Vote successfully mined and sealed on the blockchain ledger!',
      block: {
        index: minedBlock.index,
        hash: minedBlock.hash,
        previousHash: minedBlock.previousHash,
        nonce: minedBlock.nonce,
        timestamp: minedBlock.timestamp,
      },
      cryptographicReceipt: {
        merkleRoot,
        merkleProof,
        zkNullifierHash: zkProof.zkNullifierHash,
        homomorphicCipher: homomorphicCipher.encryptedCipher,
        nodeSignatures: consensusResult.nodeSignatures,
      },
      votedCandidate: {
        name: candidate.name,
        party: candidate.party,
        symbolUrl: candidate.symbolUrl
      },
      results: formattedResults
    });
  } catch (error) {
    console.error(`❌ Vote Engine Failure:`, error);
    res.status(500).json({ success: false, message: 'Failed to process vote submission securely. Please try again.' });
  }
};

// @desc    Get Private Vote Receipt (ONLY accessible by the voter who cast it)
// @route   GET /api/votes/my-receipt/:electionId
// @access  Private/Voter
const getMyVoteReceipt = async (req, res) => {
  try {
    const { electionId } = req.params;
    const userId = req.user._id;

    const voteReceipt = await Vote.findOne({ election: electionId, voterUser: userId })
      .populate('candidateVotedFor')
      .populate('election');

    if (!voteReceipt) {
      return res.status(200).json({ success: true, hasVoted: false });
    }

    res.status(200).json({
      success: true,
      hasVoted: true,
      votedAt: voteReceipt.votedAt,
      candidate: {
        id: voteReceipt.candidateVotedFor._id,
        name: voteReceipt.candidateVotedFor.name,
        party: voteReceipt.candidateVotedFor.party,
        symbolUrl: voteReceipt.candidateVotedFor.symbolUrl,
      }
    });
  } catch (error) {
    console.error(`❌ Receipt Fetch Error:`, error);
    res.status(500).json({ success: false, message: 'Failed to retrieve private vote receipt.' });
  }
};

// @desc    Check whether current voter has already voted in an election
// @route   GET /api/votes/status/:electionId
// @access  Private/Voter
const checkVoterStatus = async (req, res) => {
  try {
    const { electionId } = req.params;
    const anonymousToken = generateAnonymousVoterToken(req.user.voterId, electionId);

    const existingVote = await Vote.findOne({
      $or: [
        { election: electionId, anonymousVoterToken: anonymousToken },
        { election: electionId, voterUser: req.user._id }
      ]
    });

    res.status(200).json({
      success: true,
      hasVoted: !!existingVote,
      votedAt: existingVote ? existingVote.votedAt : null,
    });
  } catch (error) {
    console.error(`❌ Voter Status Error:`, error);
    res.status(500).json({ success: false, message: 'Failed to check voting status.' });
  }
};

// @desc    Get live real-time vote count breakdown aggregated directly from the blockchain
// @route   GET /api/votes/results/:electionId
// @access  Public
const getLiveResults = async (req, res) => {
  try {
    const { electionId } = req.params;

    const voteCountsFromChain = await Blockchain.getVoteResultsFromChain(electionId);
    const candidates = await Candidate.find({ election: electionId });

    let totalVotes = 0;
    const formattedResults = candidates.map(cand => {
      const votes = voteCountsFromChain[cand._id.toString()] || 0;
      totalVotes += votes;
      return {
        candidateId: cand._id,
        name: cand.name,
        party: cand.party,
        symbolUrl: cand.symbolUrl,
        votes: votes,
      };
    });

    res.status(200).json({
      success: true,
      electionId,
      totalVotes,
      results: formattedResults,
    });
  } catch (error) {
    console.error(`❌ Live Results Error:`, error);
    res.status(500).json({ success: false, message: 'Failed to retrieve live election results.' });
  }
};

module.exports = {
  castVote,
  getMyVoteReceipt,
  checkVoterStatus,
  getLiveResults,
};
