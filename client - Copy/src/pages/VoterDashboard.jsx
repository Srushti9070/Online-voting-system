import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import { Vote, MapPin, Calendar, CheckCircle2, ArrowRight, ShieldCheck, BarChart3, AlertTriangle, Info, ShieldAlert } from 'lucide-react';

const VoterDashboard = () => {
  const { user } = useAuth();
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVoterElections = async () => {
      try {
        setLoading(true);
        const res = await API.get('/elections/voter-elections');
        setElections(res.data.elections);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching elections:', err.message);
        setError('Unable to load elections for your location.');
        setLoading(false);
      }
    };

    fetchVoterElections();
  }, []);

  const loc = user?.location || {};

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      
      {/* Voter Header Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-brand-border/80 bg-gradient-to-r from-brand-dark via-slate-900 to-brand-dark flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-emerald/10 text-brand-emerald border border-brand-emerald/30 text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" /> Authenticated Voter Session
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white">
            Welcome, {user?.fullName}
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-300 font-mono pt-1">
            <span className="flex items-center gap-1 bg-slate-950/60 px-3 py-1 rounded-lg border border-slate-800">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-neon" /> Voter ID: {user?.voterId}
            </span>
            <span className="flex items-center gap-1 bg-slate-950/60 px-3 py-1 rounded-lg border border-slate-800">
              <MapPin className="w-3.5 h-3.5 text-brand-accent" />
              Location: {loc.state} / {loc.district} {loc.city ? `/ ${loc.city}` : ''} {loc.ward ? `[Ward ${loc.ward}]` : ''}
            </span>
          </div>
        </div>
      </div>

      {/* OFFICIAL VOTING INSTRUCTIONS & WARNINGS BOX */}
      <div className="glass-panel p-6 rounded-2xl border border-amber-500/30 bg-amber-950/10 space-y-4">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
          <ShieldAlert className="w-5 h-5 flex-shrink-0" />
          <span>Official Voter Guidelines & Security Warnings</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-gray-300">
          <div className="flex items-start gap-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span className="text-amber-400 font-bold">1.</span>
            <span><strong>Do NOT Refresh:</strong> Do not close or refresh your browser window while submitting your vote ballot.</span>
          </div>

          <div className="flex items-start gap-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span className="text-amber-400 font-bold">2.</span>
            <span><strong>Camera Preparation:</strong> Ensure proper lighting and face the camera clearly during Biometric Verification.</span>
          </div>

          <div className="flex items-start gap-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span className="text-amber-400 font-bold">3.</span>
            <span><strong>Final Selection:</strong> Verify your candidate choice carefully. Once submitted, your ballot cannot be changed or reset.</span>
          </div>

          <div className="flex items-start gap-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span className="text-amber-400 font-bold">4.</span>
            <span><strong>1 Voter 1 Vote:</strong> Duplicate voting attempts are automatically detected and permanently blocked.</span>
          </div>
        </div>
      </div>

      {/* Elections Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Vote className="w-5 h-5 text-brand-neon" /> Elections in Your Jurisdiction
          </h2>
          <p className="text-xs text-gray-400">Targeted based on your registered location boundary.</p>
        </div>
      </div>

      {/* Loading & Error States */}
      {loading && (
        <div className="text-center py-12 space-y-3">
          <div className="w-8 h-8 border-3 border-brand-neon border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-brand-neon font-mono">Loading active elections for your area...</p>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-xs text-red-400 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {!loading && elections.length === 0 && (
        <div className="glass-panel p-10 rounded-2xl text-center space-y-3">
          <Vote className="w-10 h-10 text-gray-600 mx-auto" />
          <h3 className="text-base font-bold text-gray-300">No Active Elections in Your Area</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            There are currently no active elections registered for your assigned location.
          </p>
        </div>
      )}

      {/* Election Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {elections.map((election) => (
          <div
            key={election._id}
            className="glass-panel p-6 rounded-2xl border border-brand-border/60 flex flex-col justify-between space-y-5 hover:border-brand-neon/60 transition-all duration-300 group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded bg-brand-neon/10 text-brand-neon border border-brand-neon/20">
                  {election.type}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  {election.status}
                </span>
              </div>

              <h3 className="text-base font-bold text-white group-hover:text-brand-neon transition-colors">
                {election.title}
              </h3>
              <p className="text-xs text-gray-400 line-clamp-2">
                {election.description}
              </p>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-800/80">
              <div className="flex items-center justify-between text-xs text-gray-400 font-mono">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-gray-500" /> End Date:
                </span>
                <span className="text-gray-200 font-semibold">
                  {new Date(election.endDate).toLocaleDateString()}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Link
                  to={`/vote/${election._id}`}
                  className="py-2.5 bg-gradient-to-r from-brand-accent to-brand-neon text-slate-950 font-bold text-xs rounded-xl hover:from-cyan-400 hover:to-blue-400 transition-all text-center flex items-center justify-center gap-1 shadow-md shadow-brand-neon/20"
                >
                  Cast Ballot <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  to={`/results/${election._id}`}
                  className="py-2.5 glass-panel text-gray-200 font-bold text-xs rounded-xl hover:bg-gray-800 transition-colors text-center flex items-center justify-center gap-1 border border-slate-700"
                >
                  <BarChart3 className="w-3.5 h-3.5 text-brand-neon" /> Live Results
                </Link>
              </div>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};

export default VoterDashboard;
