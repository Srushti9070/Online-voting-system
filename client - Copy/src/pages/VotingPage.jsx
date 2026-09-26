import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import confetti from 'canvas-confetti';
import BlockchainBadge from '../components/BlockchainBadge';
import { Vote, ShieldCheck, CheckCircle2, AlertTriangle, Cpu, ArrowLeft, RefreshCw, BarChart3, Lock, Eye, EyeOff } from 'lucide-react';

const VotingPage = () => {
  const { electionId } = useParams();
  const navigate = useNavigate();

  const [election, setElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  
  const [hasVoted, setHasVoted] = useState(false);
  const [myReceipt, setMyReceipt] = useState(null);
  const [showReceiptDetails, setShowReceiptDetails] = useState(false);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [minedBlock, setMinedBlock] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // 1. Fetch Election details
        const electRes = await API.get(`/elections/${electionId}`);
        setElection(electRes.data.election);

        // 2. Fetch Private Voter Receipt (ONLY accessible by this logged-in voter)
        const receiptRes = await API.get(`/votes/my-receipt/${electionId}`);
        if (receiptRes.data.hasVoted) {
          setHasVoted(true);
          setMyReceipt(receiptRes.data);
        }

        // 3. Fetch Candidates list
        const candRes = await API.get(`/candidates/election/${electionId}`);
        setCandidates(candRes.data.candidates);

        setLoading(false);
      } catch (err) {
        console.error('Error loading voting page:', err.message);
        setError('Failed to load election candidates.');
        setLoading(false);
      }
    };

    fetchData();
  }, [electionId]);

  const handleCastVote = async () => {
    if (!selectedCandidate) {
      setError('Please select a candidate before casting your ballot.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const res = await API.post('/votes/cast', {
        electionId,
        candidateId: selectedCandidate,
      });

      setSubmitting(false);
      setHasVoted(true);
      setMinedBlock(res.data.block);
      setMyReceipt({
        hasVoted: true,
        votedAt: new Date().toISOString(),
        candidate: res.data.votedCandidate
      });

      // Trigger visual confetti animation upon successful blockchain block mining
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

    } catch (err) {
      setSubmitting(false);
      setError(err.message || 'Failed to mine vote block into blockchain.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-dark text-center space-y-3">
        <div className="w-10 h-10 border-4 border-brand-neon border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs text-brand-neon font-mono">Initializing Cryptographic Voting Chamber...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Link to="/dashboard" className="text-xs font-semibold text-gray-400 hover:text-white flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        <span className="flex items-center gap-1.5 text-xs text-brand-neon bg-brand-neon/10 px-3 py-1 rounded-full border border-brand-neon/20 font-mono">
          <Lock className="w-3.5 h-3.5" /> Anonymous Token Engine Active
        </span>
      </div>

      {/* Election Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-brand-border/80 space-y-3">
        <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded bg-brand-neon/10 text-brand-neon border border-brand-neon/20">
          {election?.type}
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{election?.title}</h1>
        <p className="text-xs text-gray-300 leading-relaxed">{election?.description}</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-xs text-red-400">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* DUPLICATE VOTE PREVENTED & PRIVATE SEALED RECEIPT VIEW */}
      {hasVoted ? (
        <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-brand-emerald/40 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-brand-emerald/10 border border-brand-emerald/40 flex items-center justify-center mx-auto text-brand-emerald">
            <CheckCircle2 className="w-8 h-8 animate-pulse" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-white">Your Ballot Has Been Mined to the Blockchain</h2>
            <p className="text-xs text-gray-400 max-w-md mx-auto">
              One Person One Vote rules enforced. Your vote is sealed inside the blockchain ledger.
            </p>
          </div>

          {/* PRIVATE VOTER RECEIPT DISPLAY (ONLY ACCESSIBLE BY THIS LOGGED IN VOTER) */}
          {myReceipt?.candidate && (
            <div className="max-w-md mx-auto p-5 glass-panel rounded-2xl border border-cyan-500/30 text-left space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-brand-neon flex items-center gap-1.5 uppercase tracking-wider">
                  <Lock className="w-3.5 h-3.5" /> Private Voter Sealed Choice
                </span>
                <button
                  onClick={() => setShowReceiptDetails(!showReceiptDetails)}
                  className="text-xs text-gray-400 hover:text-white flex items-center gap-1 bg-slate-900 px-2.5 py-1 rounded border border-slate-800"
                >
                  {showReceiptDetails ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-brand-neon" />}
                  {showReceiptDetails ? 'Hide Choice' : 'Reveal Choice'}
                </button>
              </div>

              {showReceiptDetails ? (
                <div className="p-3 bg-cyan-950/40 rounded-xl border border-brand-neon/30 flex items-center space-x-3 animate-fadeIn">
                  <img
                    src={myReceipt.candidate.symbolUrl}
                    alt={myReceipt.candidate.name}
                    className="w-12 h-12 rounded-lg object-cover border border-slate-700 bg-slate-900"
                  />
                  <div>
                    <span className="text-[10px] uppercase font-bold text-brand-accent">{myReceipt.candidate.party}</span>
                    <h4 className="text-sm font-bold text-white">{myReceipt.candidate.name}</h4>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-xs text-gray-400 font-mono text-center">
                  •••••••••••••••••••••••• (Encrypted Ballot - Only You Can Reveal)
                </div>
              )}
            </div>
          )}

          {minedBlock && (
            <div className="max-w-md mx-auto text-left">
              <BlockchainBadge block={minedBlock} />
            </div>
          )}

          <div className="pt-4 flex justify-center gap-4">
            <Link
              to={`/results/${electionId}`}
              className="px-6 py-3 bg-gradient-to-r from-brand-accent to-brand-neon text-slate-950 font-bold text-xs rounded-xl shadow-lg flex items-center gap-2"
            >
              <BarChart3 className="w-4 h-4" /> View Aggregate Public Live Results
            </Link>
          </div>
        </div>
      ) : (
        /* CANDIDATE SELECTION LIST */
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Vote className="w-5 h-5 text-brand-neon" /> Select Candidate to Cast Anonymous Ballot
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {candidates.map((cand) => (
              <div
                key={cand._id}
                onClick={() => setSelectedCandidate(cand._id)}
                className={`glass-panel p-6 rounded-2xl border transition-all duration-300 cursor-pointer flex items-center space-x-4 ${
                  selectedCandidate === cand._id
                    ? 'border-brand-neon bg-cyan-950/30 shadow-neon-cyan'
                    : 'border-brand-border/60 hover:border-brand-neon/40'
                }`}
              >
                <img
                  src={cand.symbolUrl}
                  alt={cand.party}
                  className="w-16 h-16 rounded-xl object-cover border border-slate-700 bg-slate-900 flex-shrink-0"
                />

                <div className="flex-1 space-y-1">
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-brand-neon/10 text-brand-neon border border-brand-neon/20">
                    {cand.party}
                  </span>
                  <h3 className="text-base font-bold text-white">{cand.name}</h3>
                  <p className="text-xs text-gray-400 line-clamp-1">{cand.bio}</p>
                </div>

                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  selectedCandidate === cand._id
                    ? 'border-brand-neon bg-brand-neon text-slate-950'
                    : 'border-gray-600'
                }`}>
                  {selectedCandidate === cand._id && <CheckCircle2 className="w-4 h-4" />}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-6">
            <button
              onClick={handleCastVote}
              disabled={submitting || !selectedCandidate}
              className="w-full py-4 bg-gradient-to-r from-brand-accent to-brand-neon text-slate-950 font-extrabold text-base rounded-2xl hover:from-cyan-400 hover:to-blue-400 disabled:opacity-50 transition-all duration-300 shadow-xl shadow-brand-neon/30 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" /> Mining Vote Block into Blockchain (SHA-256)...
                </>
              ) : (
                <>
                  <Cpu className="w-5 h-5" /> Mine & Seal Ballot on Blockchain
                </>
              )}
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default VotingPage;
