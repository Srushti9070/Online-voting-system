import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import FaceScanner from '../components/FaceScanner';
import VoterCardScanner from '../components/VoterCardScanner';
import OTPModal from '../components/OTPModal';
import { ShieldCheck, User, Lock, ArrowRight, AlertTriangle, CreditCard, Scan, Phone } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { loginUser } = useAuth();

  const [step, setStep] = useState(1); // Step 1: Credentials, Step 2: Voter Card, Step 3: Face Scan, Step 4: OTP Modal
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Auth State
  const [voterId, setVoterId] = useState('');
  const [password, setPassword] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [devOtp, setDevOtp] = useState(null);
  const [showOtpModal, setShowOtpModal] = useState(false);

  // Step 1: Submit Voter ID & Password
  const handleStep1Submit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      const res = await API.post('/auth/login-step1', { voterId, password });

      setLoading(false);
      setUserPhone(res.data.phone);
      setStep(2); // Proceed to Voter Card Document Scan Challenge
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Invalid Voter ID or Password.');
    }
  };

  // Step 2: Voter Card Scan Complete Callback
  const handleCardComplete = async (scannedCardData) => {
    try {
      setLoading(true);
      setError(null);

      await API.post('/auth/verify-card', {
        voterId,
        scannedCardData,
      });

      setLoading(false);
      setStep(3); // Proceed to Biometric Face Challenge
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Voter Card Document Verification Failed.');
    }
  };

  // Step 3: Face Scanner Complete Callback
  const handleFaceScanComplete = async (liveDescriptor) => {
    try {
      setLoading(true);
      setError(null);

      const res = await API.post('/auth/verify-face', {
        voterId,
        liveFaceDescriptor: liveDescriptor,
      });

      setLoading(false);
      setDevOtp(res.data.fallbackOtp);
      setShowOtpModal(true); // Open 6-digit OTP verification modal dialog for registered phone
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Biometric Face Verification Failed. Try again.');
    }
  };

  // Step 4: Verify Phone OTP Submission from Modal
  const handleOtpVerify = async (otpCode) => {
    try {
      const res = await API.post('/auth/verify-otp', {
        phone: userPhone,
        otp: otpCode,
      });

      setShowOtpModal(false);
      loginUser(res.data.token, res.data.user);

      if (res.data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      throw new Error(err.message || 'Invalid OTP code.');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="glass-panel p-8 rounded-3xl border border-brand-border/80 space-y-6 shadow-2xl">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-brand-neon/10 border border-brand-neon/30 flex items-center justify-center mx-auto text-brand-neon">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-white">Multi-Factor Voter Login</h2>
          <p className="text-xs text-gray-400">
            {step === 1 && 'Step 1 of 3: Enter Voter ID & Password'}
            {step === 2 && 'Step 2 of 3: Verify Voter ID Card Hash'}
            {step === 3 && 'Step 3 of 3: Biometric Face Landmark Scan'}
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: CREDENTIALS */}
        {step === 1 && (
          <form onSubmit={handleStep1Submit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5 uppercase">Voter ID Number</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-500" />
                <input
                  type="text"
                  required
                  value={voterId}
                  onChange={(e) => setVoterId(e.target.value.toUpperCase())}
                  placeholder="VOTER1001"
                  className="glass-input w-full pl-10 pr-4 py-3 rounded-xl text-sm font-mono uppercase"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5 uppercase">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="glass-input w-full pl-10 pr-4 py-3 rounded-xl text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-brand-accent to-brand-neon text-slate-950 font-bold rounded-xl hover:from-cyan-400 hover:to-blue-400 disabled:opacity-50 transition-all shadow-lg shadow-brand-neon/20 flex items-center justify-center gap-2"
            >
              {loading ? 'Verifying Credentials...' : 'Proceed to Voter Card Verification'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* STEP 2: VOTER CARD SCANNER */}
        {step === 2 && (
          <div className="space-y-4">
            <VoterCardScanner onCardComplete={handleCardComplete} registeredVoterId={voterId} />
            <button
              onClick={() => setStep(1)}
              className="w-full py-2.5 glass-panel text-xs text-gray-300 rounded-xl hover:bg-gray-800 transition-colors"
            >
              Back to Credentials
            </button>
          </div>
        )}

        {/* STEP 3: FACE SCANNER */}
        {step === 3 && (
          <div className="space-y-4">
            <FaceScanner onScanComplete={handleFaceScanComplete} label="Match Live Face Descriptor" />
            <button
              onClick={() => setStep(2)}
              className="w-full py-2.5 glass-panel text-xs text-gray-300 rounded-xl hover:bg-gray-800 transition-colors"
            >
              Back to Voter Card Verification
            </button>
          </div>
        )}

        <p className="text-center text-xs text-gray-400">
          New voter? <Link to="/register" className="text-brand-neon font-semibold hover:underline">Register New Account</Link>
        </p>

      </div>

      {/* STEP 4: OTP MODAL DIALOG FOR REGISTERED PHONE */}
      <OTPModal
        isOpen={showOtpModal}
        onClose={() => setShowOtpModal(false)}
        onVerify={handleOtpVerify}
        phone={userPhone}
        devOtp={devOtp}
      />
    </div>
  );
};

export default Login;
