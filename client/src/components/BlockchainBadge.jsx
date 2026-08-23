import React from 'react';
import { Cpu, Hash, Clock, CheckCircle2, Lock } from 'lucide-react';

const BlockchainBadge = ({ block }) => {
  if (!block) return null;

  return (
    <div className="glass-panel p-5 rounded-2xl border border-brand-border/60 space-y-3 relative overflow-hidden group hover:border-brand-neon/60 transition-all duration-300">
      
      {/* Top Banner */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-brand-neon/10 border border-brand-neon/30 flex items-center justify-center text-brand-neon">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-gray-200">BLOCK #{block.index}</span>
            <span className="block text-[10px] text-brand-accent font-mono">
              Nonce: {block.nonce} (Proof-of-Work)
            </span>
          </div>
        </div>
        <span className="flex items-center gap-1 text-[10px] font-semibold text-brand-emerald bg-brand-emerald/10 px-2 py-0.5 rounded border border-brand-emerald/30">
          <CheckCircle2 className="w-3 h-3" /> SHA-256 Valid
        </span>
      </div>

      {/* Cryptographic Hashes */}
      <div className="space-y-1.5 text-xs font-mono">
        <div>
          <span className="text-gray-500 text-[10px] block">PREVIOUS HASH:</span>
          <p className="text-gray-400 bg-slate-950/60 px-2.5 py-1 rounded text-[11px] truncate border border-slate-800">
            {block.previousHash}
          </p>
        </div>

        <div>
          <span className="text-brand-neon text-[10px] block font-bold">CURRENT BLOCK HASH:</span>
          <p className="text-brand-neon bg-cyan-950/40 px-2.5 py-1 rounded text-[11px] truncate border border-brand-neon/30 font-bold">
            {block.hash}
          </p>
        </div>
      </div>

      {/* Timestamp */}
      <div className="flex items-center justify-between text-[10px] text-gray-400 pt-1 border-t border-slate-800/80">
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3 text-gray-500" /> Mined At: {new Date(block.timestamp).toLocaleTimeString()}
        </span>
        <span className="flex items-center gap-1 text-brand-accent">
          <Lock className="w-3 h-3" /> Immutable Ledger Block
        </span>
      </div>

    </div>
  );
};

export default BlockchainBadge;
