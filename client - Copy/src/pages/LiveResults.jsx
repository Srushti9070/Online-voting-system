import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../services/api';
import { useSocket } from '../context/SocketContext';
import { BarChart3, Vote, Cpu, Radio, ArrowLeft, ShieldCheck } from 'lucide-react';

const LiveResults = () => {
  const { electionId } = useParams();
  const socket = useSocket();

  const [election, setElection] = useState(null);
  const [results, setResults] = useState([]);
  const [totalVotes, setTotalVotes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [lastUpdatedBlock, setLastUpdatedBlock] = useState(null);

  // Fetch initial results from API
  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const electRes = await API.get(`/elections/${electionId}`);
        setElection(electRes.data.election);

        const resultsRes = await API.get(`/votes/results/${electionId}`);
        setResults(resultsRes.data.results);
        setTotalVotes(resultsRes.data.totalVotes);
        setLoading(false);
      } catch (err) {
        console.error('Failed to load live results:', err.message);
        setLoading(false);
      }
    };

    fetchResults();
  }, [electionId]);

  // Real-Time Socket.io WebSockets Listener
  useEffect(() => {
    if (!socket) return;

    // Join room for this election
    socket.emit('join_election_room', electionId);

    // Listen for live broadcast event from backend vote controller
    const handleVoteCast = (data) => {
      if (data.electionId === electionId) {
        console.log('⚡ Real-time vote event received via WebSockets:', data);
        setResults(data.results);
        
        let sum = 0;
        data.results.forEach(r => sum += r.votes);
        setTotalVotes(sum);
        setLastUpdatedBlock({ index: data.blockIndex, hash: data.blockHash });
      }
    };

    socket.on('vote_cast_event', handleVoteCast);

    return () => {
      socket.off('vote_cast_event', handleVoteCast);
    };
  }, [socket, electionId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-dark text-center space-y-3">
        <div className="w-10 h-10 border-4 border-brand-neon border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs text-brand-neon font-mono">Syncing Blockchain Live Stream Engine...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      
      <div className="flex items-center justify-between">
        <Link to="/dashboard" className="text-xs font-semibold text-gray-400 hover:text-white flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        <span className="flex items-center gap-2 text-xs text-brand-emerald bg-brand-emerald/10 px-3 py-1 rounded-full border border-brand-emerald/30 font-mono">
          <Radio className="w-3.5 h-3.5 text-brand-emerald animate-ping" /> WebSockets Real-Time Stream Connected
        </span>
      </div>

      {/* Title Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-brand-border/80 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded bg-brand-neon/10 text-brand-neon border border-brand-neon/20">
            {election?.type}
          </span>
          <span className="text-xs text-gray-400 font-mono">Total Verified Ledger Votes: <strong className="text-white font-bold text-sm">{totalVotes}</strong></span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{election?.title} - Live Tallies</h1>
        <p className="text-xs text-gray-400">All tallies aggregated directly from mined SHA-256 blockchain blocks.</p>
      </div>

      {/* Real-time Block Update Toast */}
      {lastUpdatedBlock && (
        <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-xl flex items-center justify-between text-xs text-brand-neon animate-pulse">
          <span className="flex items-center gap-2">
            <Cpu className="w-4 h-4" /> New Block Mined (# {lastUpdatedBlock.index})
          </span>
          <span className="font-mono text-[10px] truncate max-w-xs">{lastUpdatedBlock.hash}</span>
        </div>
      )}

      {/* Results Bar Graph List */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-brand-border/60 space-y-6">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-brand-neon" /> Live Candidate Vote Distribution
        </h2>

        <div className="space-y-6">
          {results.map((cand) => {
            const percentage = totalVotes > 0 ? ((cand.votes / totalVotes) * 100).toFixed(1) : '0.0';

            return (
              <div key={cand.candidateId} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img
                      src={cand.symbolUrl}
                      alt={cand.name}
                      className="w-10 h-10 rounded-lg object-cover border border-slate-700 bg-slate-900"
                    />
                    <div>
                      <h3 className="text-sm font-bold text-white">{cand.name}</h3>
                      <span className="text-[10px] text-gray-400 uppercase font-mono">{cand.party}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-lg font-extrabold text-brand-neon font-mono">{cand.votes} Votes</span>
                    <span className="block text-xs text-gray-400 font-mono">{percentage}%</span>
                  </div>
                </div>

                {/* Progress Bar Container */}
                <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800 relative">
                  <div
                    className="h-full bg-gradient-to-r from-brand-accent to-brand-neon rounded-full transition-all duration-500 shadow-neon-cyan"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};

export default LiveResults;
