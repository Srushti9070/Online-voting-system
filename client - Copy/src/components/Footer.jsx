import React from 'react';
import { ShieldCheck, Cpu, Lock, CheckCircle2 } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="mt-20 border-t border-brand-border/30 bg-brand-dark/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-6 h-6 text-brand-neon" />
              <span className="text-lg font-bold tracking-tight text-white">
                Trust<span className="text-brand-accent">Vote</span>
              </span>
            </div>
            <p className="text-sm text-gray-400 max-w-sm leading-relaxed">
              IEEE Standard Compliant Secure Multi-Factor Online Voting Infrastructure powered by MERN Stack, Neural Facial Landmarks, Phone SMS OTP, and SHA-256 Immutable Cryptographic Blockchain Ledgers.
            </p>
            <div className="flex items-center space-x-3 text-xs text-brand-neon font-mono">
              <span className="flex items-center gap-1 bg-brand-neon/10 px-2.5 py-1 rounded border border-brand-neon/20">
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-emerald" /> Node Status: Active
              </span>
              <span className="flex items-center gap-1 bg-brand-accent/10 px-2.5 py-1 rounded border border-brand-accent/20">
                <Lock className="w-3.5 h-3.5 text-brand-accent" /> SHA-256 Proof-of-Work
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-200 uppercase tracking-wider mb-4">Core Architecture</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="hover:text-brand-neon transition-colors">SHA-256 Ledger Mining</li>
              <li className="hover:text-brand-neon transition-colors">Face Recognition AI</li>
              <li className="hover:text-brand-neon transition-colors">Phone SMS OTP Engine</li>
              <li className="hover:text-brand-neon transition-colors">Socket.io Live Streams</li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-200 uppercase tracking-wider mb-4">Security Standards</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="hover:text-brand-neon transition-colors">One-Person-One-Vote Token</li>
              <li className="hover:text-brand-neon transition-colors">Private Sealed Voter Choice</li>
              <li className="hover:text-brand-neon transition-colors">Location-Based Elections</li>
              <li className="hover:text-brand-neon transition-colors">Zero Identity Data Leak</li>
            </ul>
          </div>

        </div>

        <div className="mt-12 pt-8 border-t border-gray-800/60 flex flex-col sm:flex-row justify-between items-center text-xs text-gray-500">
          <p>© 2026 TrustVote. Secure Biometric Blockchain Online Voting Portal.</p>
          <p className="mt-2 sm:mt-0 font-mono text-gray-400">System Genesis Hash: 00000000000000000000000000000000</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
