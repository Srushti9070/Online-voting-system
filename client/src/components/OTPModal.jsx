import React, { useState } from 'react';
import { ShieldCheck, Smartphone, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';

const OTPModal = ({ isOpen, onClose, onVerify, phone = '' }) => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError('Please enter the full 6-digit passcode.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onVerify(otp);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Invalid passcode. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="glass-panel w-full max-w-md p-6 sm:p-8 rounded-3xl border border-brand-border/80 space-y-6 shadow-2xl relative">
        
        {/* Header Icon */}
        <div className="w-14 h-14 rounded-2xl bg-brand-neon/10 border border-brand-neon/30 flex items-center justify-center mx-auto text-brand-neon">
          <Smartphone className="w-7 h-7" />
        </div>

        {/* Title */}
        <div className="text-center space-y-1">
          <h3 className="text-xl font-extrabold text-white">SMS Security Passcode Verification</h3>
          <p className="text-xs text-gray-400">
            A 6-digit passcode has been sent to your registered contact.
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* OTP Input Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="block text-[10px] uppercase font-bold text-brand-neon text-center tracking-widest">
              Enter 6-Digit Verification Passcode
            </label>
            <input
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="000000"
              className="glass-input w-full text-center text-3xl font-mono tracking-[0.5em] py-3.5 rounded-2xl text-brand-neon border-brand-neon/40 focus:border-brand-neon"
              autoFocus
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 py-3 glass-panel text-xs text-gray-300 font-semibold rounded-xl hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-2/3 py-3 bg-gradient-to-r from-brand-accent to-brand-neon text-slate-950 font-extrabold text-xs rounded-xl hover:from-cyan-400 hover:to-blue-400 disabled:opacity-50 transition-all shadow-lg shadow-brand-neon/20 flex items-center justify-center gap-1.5"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Verifying Passcode...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" /> Authenticate & Access
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default OTPModal;
