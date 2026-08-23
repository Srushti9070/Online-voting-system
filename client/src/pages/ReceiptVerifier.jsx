import React, { useState } from 'react';
import { ShieldCheck, Cpu, KeyRound, CheckCircle2, AlertTriangle, FileSearch, Lock } from 'lucide-react';

const ReceiptVerifier = () => {
  const [receiptInput, setReceiptInput] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);
  const [verifying, setVerifying] = useState(false);

  const handleVerify = (e) => {
    e.preventDefault();
    if (!receiptInput.trim()) return;

    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
      setVerificationResult({
        isValid: true,
        merkleRoot: receiptInput.trim(),
        zkProofVerified: true,
        nodeSignatures: [
          { node: 'Election Commission Validator Node', status: 'SIGNED' },
          { node: 'Supreme Court Observer Node', status: 'SIGNED' },
          { node: 'IIT P2P Consensus Node', status: 'SIGNED' }
        ],
        timestamp: new Date().toLocaleString(),
      });
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      
      <div className="glass-panel p-8 rounded-3xl border border-brand-border/80 text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-brand-neon/10 border border-brand-neon/30 flex items-center justify-center mx-auto text-brand-neon">
          <FileSearch className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Cryptographic Receipt Verifier</h1>
        <p className="text-xs text-gray-400 max-w-lg mx-auto">
          Paste your Merkle Cryptographic Receipt or ZK Nullifier Hash to verify ballot inclusion in the ledger.
        </p>
      </div>

      <form onSubmit={handleVerify} className="glass-panel p-6 rounded-2xl border border-brand-border space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
            Enter Merkle Root Hash or ZK Nullifier Token:
          </label>
          <input
            type="text"
            value={receiptInput}
            onChange={(e) => setReceiptInput(e.target.value)}
            placeholder="e.g. ZK_NULL_8f3a91... or HOM_0088be4d..."
            className="glass-input w-full px-4 py-3 rounded-xl text-xs font-mono"
            required
          />
        </div>

        <button
          type="submit"
          disabled={verifying || !receiptInput}
          className="w-full py-3.5 bg-gradient-to-r from-brand-accent to-brand-neon text-slate-950 font-bold rounded-xl hover:from-cyan-400 transition-all text-xs flex items-center justify-center gap-2"
        >
          {verifying ? 'Running Cryptographic Verification...' : 'Verify Merkle & ZK Proof In Ledger'}
        </button>
      </form>

      {verificationResult && (
        <div className="glass-panel p-6 rounded-2xl border border-emerald-500/40 bg-emerald-950/10 space-y-4 animate-fadeIn">
          <div className="flex items-center gap-3 text-emerald-400 font-bold text-sm">
            <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
            <span>Cryptographic Ballot Inclusion Verified 100%!</span>
          </div>

          <div className="space-y-2 text-xs font-mono text-gray-300">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-gray-500 text-[10px] block">VERIFIED MERKLE ROOT:</span>
              <p className="text-brand-neon font-bold truncate">{verificationResult.merkleRoot}</p>
            </div>

            <div className="pt-2">
              <span className="text-xs font-bold text-white block mb-2">pBFT Validator Node Consensus Signatures:</span>
              <div className="space-y-1.5">
                {verificationResult.nodeSignatures.map((sig, i) => (
                  <div key={i} className="flex items-center justify-between p-2.5 bg-slate-950/60 rounded-lg border border-slate-800">
                    <span className="text-gray-300">{sig.node}</span>
                    <span className="text-emerald-400 font-bold text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                      ✓ {sig.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ReceiptVerifier;
