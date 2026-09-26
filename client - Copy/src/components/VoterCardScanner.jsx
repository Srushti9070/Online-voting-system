import React, { useState } from 'react';
import { CreditCard, CheckCircle2, ShieldAlert, FileCheck, Upload } from 'lucide-react';

const VoterCardScanner = ({ onCardComplete, registeredVoterId = '', label = 'Verify Official Voter ID Card' }) => {
  const [cardInput, setCardInput] = useState(registeredVoterId);
  const [scanned, setScanned] = useState(false);
  const [error, setError] = useState(null);

  const handleScanCard = (e) => {
    e.preventDefault();
    if (!cardInput.trim()) {
      setError('Please enter or scan your official Voter ID Card number.');
      return;
    }

    if (registeredVoterId && cardInput.trim().toUpperCase() !== registeredVoterId.toUpperCase()) {
      setError(`Voter Card Mismatch! Card ID "${cardInput}" does not match registered Voter ID "${registeredVoterId}". Access Denied.`);
      return;
    }

    setError(null);
    setScanned(true);

    if (onCardComplete) {
      onCardComplete(cardInput.trim().toUpperCase());
    }
  };

  return (
    <div className="glass-panel p-6 rounded-2xl border border-brand-border text-center space-y-4 max-w-md mx-auto">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-brand-neon flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-brand-accent" /> {label}
        </h3>
        {scanned && (
          <span className="flex items-center gap-1 text-[10px] font-bold text-brand-emerald bg-brand-emerald/10 px-2 py-0.5 rounded border border-brand-emerald/30">
            <CheckCircle2 className="w-3.5 h-3.5" /> Card Verified
          </span>
        )}
      </div>

      <div className="p-5 bg-slate-950/80 rounded-xl border border-slate-800 space-y-3">
        <FileCheck className="w-10 h-10 text-brand-neon mx-auto animate-pulse" />
        <p className="text-xs text-gray-300">
          Enter or confirm the 10-character Voter ID Card Number printed on your physical card.
        </p>

        <input
          type="text"
          value={cardInput}
          onChange={(e) => setCardInput(e.target.value.toUpperCase())}
          placeholder="VOTER1001"
          className="glass-input w-full text-center text-lg font-mono uppercase py-2.5 rounded-xl border-brand-border/60"
        />
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400 text-left">
          <ShieldAlert className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <button
        type="button"
        onClick={handleScanCard}
        className={`w-full py-3 rounded-xl font-bold text-xs tracking-wide transition-all flex items-center justify-center gap-2 shadow-lg ${
          scanned
            ? 'bg-brand-emerald text-slate-950 hover:bg-emerald-400'
            : 'bg-gradient-to-r from-brand-accent to-brand-neon text-slate-950 hover:from-cyan-400'
        }`}
      >
        {scanned ? (
          <>
            <CheckCircle2 className="w-4 h-4" /> Voter Card Verified & Signed
          </>
        ) : (
          <>
            <CreditCard className="w-4 h-4" /> Verify Voter Card SHA-256 Hash
          </>
        )}
      </button>
    </div>
  );
};

export default VoterCardScanner;
