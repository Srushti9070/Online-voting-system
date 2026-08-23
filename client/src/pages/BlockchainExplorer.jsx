import React, { useState, useEffect } from 'react';
import API from '../services/api';
import BlockchainBadge from '../components/BlockchainBadge';
import { Cpu, ShieldCheck, CheckCircle2, AlertTriangle, RefreshCw, Lock, Link as LinkIcon } from 'lucide-react';

const BlockchainExplorer = () => {
  const [elections, setElections] = useState([]);
  const [selectedElectionId, setSelectedElectionId] = useState('');
  const [blocks, setBlocks] = useState([]);
  const [auditReport, setAuditReport] = useState(null);

  const [loading, setLoading] = useState(true);
  const [auditing, setAuditing] = useState(false);

  // Fetch elections list
  useEffect(() => {
    const fetchElections = async () => {
      try {
        setLoading(true);
        const res = await API.get('/elections');
        setElections(res.data.elections);
        if (res.data.elections.length > 0) {
          setSelectedElectionId(res.data.elections[0]._id);
        }
        setLoading(false);
      } catch (err) {
        console.error('Failed to load elections:', err.message);
        setLoading(false);
      }
    };
    fetchElections();
  }, []);

  // Fetch blocks when selected election changes
  useEffect(() => {
    if (!selectedElectionId) return;

    const fetchBlocks = async () => {
      try {
        const res = await API.get(`/blockchain/blocks/${selectedElectionId}`);
        setBlocks(res.data.blocks);
        setAuditReport(null);
      } catch (err) {
        console.error('Failed to load blocks:', err.message);
      }
    };

    fetchBlocks();
  }, [selectedElectionId]);

  // Run cryptographic chain integrity check
  const handleAuditChain = async () => {
    try {
      setAuditing(true);
      const res = await API.get(`/blockchain/verify/${selectedElectionId}`);
      setAuditReport(res.data.auditReport);
      setAuditing(false);
    } catch (err) {
      console.error('Audit failure:', err.message);
      setAuditing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      
      {/* Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-brand-border/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-neon/10 text-brand-neon border border-brand-neon/30 text-xs font-semibold">
            <Cpu className="w-3.5 h-3.5" /> Public Cryptographic Auditor
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white">Immutable Blockchain Explorer</h1>
          <p className="text-xs text-gray-400">Inspect mined vote blocks, SHA-256 cryptographic hashes, and proof-of-work nonces.</p>
        </div>

        <button
          onClick={handleAuditChain}
          disabled={auditing || !selectedElectionId}
          className="px-6 py-3.5 bg-gradient-to-r from-brand-accent to-brand-neon text-slate-950 font-bold rounded-xl hover:from-cyan-400 hover:to-blue-400 transition-all shadow-lg shadow-brand-neon/20 flex items-center gap-2 text-sm"
        >
          {auditing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
          {auditing ? 'Auditing Hashes...' : 'Verify Chain Integrity'}
        </button>
      </div>

      {/* Audit Result Alert Banner */}
      {auditReport && (
        <div className={`p-4 rounded-2xl border text-xs flex items-center justify-between ${
          auditReport.isValid
            ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
            : 'bg-red-500/10 border-red-500/40 text-red-400'
        }`}>
          <div className="flex items-center gap-3">
            {auditReport.isValid ? <CheckCircle2 className="w-6 h-6 flex-shrink-0" /> : <AlertTriangle className="w-6 h-6 flex-shrink-0" />}
            <div>
              <h4 className="font-bold text-sm">{auditReport.isValid ? 'Blockchain Integrity Verified 100%' : 'Cryptographic Tampering Detected!'}</h4>
              <p className="opacity-90">{auditReport.message || auditReport.error}</p>
            </div>
          </div>
          <span className="font-mono text-xs font-bold px-3 py-1 rounded bg-slate-950/60 border border-slate-800">
            Total Blocks Audited: {auditReport.verifiedCount || 0}
          </span>
        </div>
      )}

      {/* Select Election Selector */}
      <div className="glass-panel p-4 rounded-2xl border border-brand-border/60 flex items-center justify-between gap-4">
        <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Select Election Ledger:</label>
        <select
          value={selectedElectionId}
          onChange={(e) => setSelectedElectionId(e.target.value)}
          className="glass-input px-4 py-2 rounded-xl text-xs bg-slate-950 max-w-md w-full"
        >
          {elections.map((e) => (
            <option key={e._id} value={e._id}>{e.title} ({e.type})</option>
          ))}
        </select>
      </div>

      {/* Block Stream Display */}
      <div className="space-y-6">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <LinkIcon className="w-5 h-5 text-brand-neon" /> Cryptographic Block Linkage Stream ({blocks.length} Blocks)
        </h2>

        {blocks.length === 0 ? (
          <div className="glass-panel p-12 rounded-3xl text-center text-xs text-gray-400">
            No mined blocks found for this election ledger.
          </div>
        ) : (
          <div className="space-y-4 relative">
            {blocks.map((b, idx) => (
              <div key={b._id} className="relative">
                {/* Visual Chain Connector Line */}
                {idx < blocks.length - 1 && (
                  <div className="absolute left-7 top-16 w-0.5 h-12 bg-gradient-to-b from-brand-neon to-brand-accent/40 z-0"></div>
                )}
                <div className="relative z-10">
                  <BlockchainBadge block={b} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default BlockchainExplorer;
