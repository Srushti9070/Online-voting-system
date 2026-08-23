import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import FaceScanner from '../components/FaceScanner';
import { User, Mail, Phone, Lock, ShieldCheck, MapPin, AlertTriangle, ArrowRight } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    voterId: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    locationId: '',
  });

  const [faceDescriptor, setFaceDescriptor] = useState(null);
  const [step, setStep] = useState(1); // Step 1: Info, Step 2: Face Capture

  // Fetch available locations
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await API.get('/locations');
        setLocations(res.data.locations);
        if (res.data.locations.length > 0) {
          setFormData((prev) => ({ ...prev, locationId: res.data.locations[0]._id }));
        }
      } catch (err) {
        console.error('Failed to load locations:', err.message);
      }
    };
    fetchLocations();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!formData.phone || formData.phone.length < 10) {
      setError('Please provide a valid 10-digit registered phone number.');
      return;
    }
    if (!formData.locationId) {
      setError('Please select your location boundary.');
      return;
    }
    setError(null);
    setStep(2);
  };

  const handleFaceComplete = (descriptor) => {
    setFaceDescriptor(descriptor);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!faceDescriptor) {
      setError('Please complete face scan biometric extraction.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const payload = {
        fullName: formData.fullName,
        voterId: formData.voterId,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        locationId: formData.locationId,
        faceDescriptor,
      };

      const res = await API.post('/auth/register', payload);

      setLoading(false);
      alert('Voter Registration Successful! Your biometric profile and phone number have been registered. You can now log in.');
      navigate('/login');
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Registration failed. Check your inputs.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-brand-border/80 space-y-8 shadow-2xl">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-brand-neon/10 border border-brand-neon/30 flex items-center justify-center mx-auto text-brand-neon">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Voter Registration Portal</h2>
          <p className="text-xs text-gray-400">Step {step} of 2: {step === 1 ? 'Personal Credentials, Phone & Location' : 'Biometric Face Descriptor Capture'}</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1 FORM */}
        {step === 1 && (
          <form onSubmit={handleNextStep} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5 uppercase">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-500" />
                <input
                  type="text"
                  name="fullName"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="glass-input w-full pl-10 pr-4 py-3 rounded-xl text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5 uppercase">Voter ID Card Number</label>
                <input
                  type="text"
                  name="voterId"
                  required
                  value={formData.voterId}
                  onChange={handleChange}
                  placeholder="VOTER12345"
                  className="glass-input w-full px-4 py-3 rounded-xl text-sm font-mono uppercase"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5 uppercase">Registered Phone Number (For SMS OTP)</label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-500" />
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 9876543210"
                    className="glass-input w-full pl-10 pr-4 py-3 rounded-xl text-sm font-mono"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5 uppercase">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-500" />
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="voter@example.com"
                  className="glass-input w-full pl-10 pr-4 py-3 rounded-xl text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5 uppercase">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-500" />
                  <input
                    type="password"
                    name="password"
                    required
                    minLength="6"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="glass-input w-full pl-10 pr-4 py-3 rounded-xl text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5 uppercase">Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="glass-input w-full px-4 py-3 rounded-xl text-sm"
                />
              </div>
            </div>

            {/* Location Select */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5 uppercase flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-brand-neon" /> Select Geographical Voting Location Boundary
              </label>
              <select
                name="locationId"
                value={formData.locationId}
                onChange={handleChange}
                required
                className="glass-input w-full px-4 py-3 rounded-xl text-sm bg-slate-900"
              >
                {locations.length === 0 && <option value="">Loading locations...</option>}
                {locations.map((loc) => (
                  <option key={loc._id} value={loc._id}>
                    {loc.state} - {loc.district} {loc.city ? `(${loc.city})` : ''} {loc.ward ? `[Ward ${loc.ward}]` : ''}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-brand-accent to-brand-neon text-slate-950 font-bold rounded-xl hover:from-cyan-400 hover:to-blue-400 transition-all duration-300 shadow-lg shadow-brand-neon/30 flex items-center justify-center gap-2"
            >
              Proceed to Biometric Face Capture <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* STEP 2 FACE CAPTURE */}
        {step === 2 && (
          <div className="space-y-6">
            <FaceScanner onScanComplete={handleFaceComplete} label="Capture Registration Face Descriptor" />

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-1/3 py-3.5 glass-panel text-white font-bold rounded-xl hover:bg-gray-800 transition-colors text-sm"
              >
                Back to Details
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading || !faceDescriptor}
                className="w-2/3 py-3.5 bg-gradient-to-r from-brand-accent to-brand-neon text-slate-950 font-bold rounded-xl hover:from-cyan-400 hover:to-blue-400 disabled:opacity-50 transition-all shadow-lg flex items-center justify-center gap-2 text-sm"
              >
                {loading ? 'Submitting Voter Record...' : 'Complete Voter Registration'}
              </button>
            </div>
          </div>
        )}

        <p className="text-center text-xs text-gray-400">
          Already registered? <Link to="/login" className="text-brand-neon font-semibold hover:underline">Sign In Here</Link>
        </p>

      </div>
    </div>
  );
};

export default Register;
