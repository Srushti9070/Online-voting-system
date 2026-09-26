import React, { useState, useEffect } from 'react';
import { KeyRound, ShieldAlert, CheckCircle2, RefreshCw, X, Phone } from 'lucide-react';

const OTPModal = ({ isOpen, onClose, onVerify, phone, devOtp }) => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [timer, setTimer] = useState(300); // 5 minutes timer

  useEffect(() => {
    let interval = null;
    if (isOpen && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isOpen, timer]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP code.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onVerify(otp);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError(err.message || 'OTP verification failed.');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="glass-panel w-full max-w-md p-6 rounded-2xl border border-brand-border/80 relative space-y-6 shadow-2xl">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800/50 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-brand-neon/10 border border-brand-neon/30 flex items-center justify-center mx-auto text-brand-neon">
            <Phone className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-extrabold text-white">Phone SMS Multi-Factor OTP</h2>
          <p className="text-xs text-gray-400">
            A 6-digit passcode has been dispatched to your registered phone <strong className="text-brand-neon">{phone}</strong>
          </p>
        </div>

        {/* Developer Mode OTP Notification Banner */}
        {devOtp && (
          <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-center space-y-1">
            <span className="text-[10px] uppercase font-bold text-brand-accent tracking-wider block">
              📱 Registered Phone SMS Passcode (Dev Preview)
            </span>
            <span className="font-mono text-xl font-bold text-brand-neon tracking-widest">{devOtp}</span>
          </div>
        )}

        {/* Form Input */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-2 text-center uppercase tracking-wider">
              Enter 6-Digit SMS Passcode
            </label>
            <input
              type="text"
              maxLength="6"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="123456"
              className="glass-input w-full text-center text-2xl font-mono tracking-[0.5em] py-3 rounded-xl focus:border-brand-neon"
              autoFocus
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400">
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-gray-400 px-1">
            <span>Code expires in: <strong className="text-brand-neon font-mono">{formatTime(timer)}</strong></span>
          </div>

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="w-full py-3.5 bg-gradient-to-r from-brand-accent to-brand-neon text-slate-950 font-bold rounded-xl hover:from-cyan-400 hover:to-blue-400 disabled:opacity-50 transition-all duration-300 shadow-lg shadow-brand-neon/20 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> Verifying Passcode...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" /> Authenticate & Access Portal
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default OTPModal;
