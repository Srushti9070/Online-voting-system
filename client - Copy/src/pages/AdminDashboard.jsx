import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useSocket } from '../context/SocketContext';
import { ShieldCheck, Plus, Vote, MapPin, UserPlus, Cpu, BarChart3, CheckCircle2, AlertTriangle, Users, Activity, Lock, RefreshCw, ShieldAlert, Download } from 'lucide-react';

const AdminDashboard = () => {
  const socket = useSocket();

  const [locations, setLocations] = useState([]);
  const [elections, setElections] = useState([]);
  const [selectedElectionId, setSelectedElectionId] = useState('');
  const [analytics, setAnalytics] = useState(null);

  // Form Modals State
  const [showLocModal, setShowLocModal] = useState(false);
  const [showElectModal, setShowElectModal] = useState(false);
  const [showCandModal, setShowCandModal] = useState(false);

  const [locData, setLocData] = useState({ state: '', district: '', city: '', ward: '' });
  const [electData, setElectData] = useState({ title: '', description: '', type: 'Gram Panchayat', locationId: '', startDate: '', endDate: '' });
  const [candData, setCandData] = useState({ name: '', party: '', symbolUrl: '', electionId: '', bio: '' });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Initial Load Locations & Elections
  const reloadData = async () => {
    try {
      const locRes = await API.get('/locations');
      setLocations(locRes.data.locations);

      const electRes = await API.get('/elections');
      setElections(electRes.data.elections);
      if (electRes.data.elections.length > 0 && !selectedElectionId) {
        setSelectedElectionId(electRes.data.elections[0]._id);
      }
    } catch (err) {
      console.error('Failed to load admin data:', err.message);
    }
  };

  useEffect(() => {
    reloadData();
  }, []);

  // Fetch Real-time Analytics when selected election changes
  const fetchAnalytics = async (id) => {
    if (!id) return;
    try {
      const res = await API.get(`/admin/analytics/${id}`);
      setAnalytics(res.data);
    } catch (err) {
      console.error('Failed to load analytics:', err.message);
    }
  };

  useEffect(() => {
    fetchAnalytics(selectedElectionId);
  }, [selectedElectionId]);

  // Real-Time Socket.io WebSockets Listener for live vote events
  useEffect(() => {
    if (!socket || !selectedElectionId) return;

    socket.emit('join_election_room', selectedElectionId);

    const handleVoteCast = (data) => {
      if (data.electionId === selectedElectionId) {
        console.log('⚡ Real-time vote cast event received by Admin Console:', data);
        fetchAnalytics(selectedElectionId);
      }
    };

    socket.on('vote_cast_event', handleVoteCast);

    return () => {
      socket.off('vote_cast_event', handleVoteCast);
    };
  }, [socket, selectedElectionId]);

  // Create Location Submit
  const handleCreateLocation = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await API.post('/locations', locData);
      setLoading(false);
      setShowLocModal(false);
      setMessage('Location boundary created successfully!');
      setLocData({ state: '', district: '', city: '', ward: '' });
      reloadData();
    } catch (err) {
      setLoading(false);
      alert(err.message);
    }
  };

  // Create Election Submit
  const handleCreateElection = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await API.post('/elections', electData);
      setLoading(false);
      setShowElectModal(false);
      setMessage('New election initialized successfully!');
      reloadData();
    } catch (err) {
      setLoading(false);
      alert(err.message);
    }
  };

  // Create Candidate Submit
  const handleCreateCandidate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await API.post('/candidates', candData);
      setLoading(false);
      setShowCandModal(false);
      setMessage('Candidate registered to election successfully!');
      setCandData({ name: '', party: '', symbolUrl: '', electionId: '', bio: '' });
      fetchAnalytics(selectedElectionId);
    } catch (err) {
      setLoading(false);
      alert(err.message);
    }
  };

  // Toggle Election Status
  const handleStatusChange = async (newStatus) => {
    try {
      await API.put('/admin/election-status', { electionId: selectedElectionId, status: newStatus });
      setMessage(`Election status updated to ${newStatus}`);
      fetchAnalytics(selectedElectionId);
      reloadData();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      
      {/* Executive Command Center Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-brand-border/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-neon/10 text-brand-neon border border-brand-neon/30 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" /> Chief Election Officer Console
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white mt-1">Admin Command & Analytics Center</h1>
          <p className="text-xs text-gray-400">Real-time election tracking, voter turnout analytics, security metrics, and blockchain monitoring.</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setShowLocModal(true)}
            className="px-4 py-2.5 glass-panel text-xs font-bold text-white rounded-xl hover:border-brand-neon transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 text-brand-neon" /> Add Location
          </button>
          <button
            onClick={() => setShowElectModal(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-brand-accent to-brand-neon text-slate-950 text-xs font-extrabold rounded-xl hover:from-cyan-400 transition-all flex items-center gap-1.5 shadow-md shadow-brand-neon/20"
          >
            <Plus className="w-4 h-4" /> Launch Election
          </button>
        </div>
      </div>

      {message && (
        <div className="p-4 bg-brand-emerald/10 border border-brand-emerald/30 rounded-2xl text-xs text-brand-emerald flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> <span>{message}</span>
        </div>
      )}

      {/* ELECTION TRACKER SELECTOR & CONTROLS */}
      <div className="glass-panel p-6 rounded-2xl border border-brand-border/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex-1 space-y-1">
          <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider block">Select Active Election to Track:</label>
          <select
            value={selectedElectionId}
            onChange={(e) => setSelectedElectionId(e.target.value)}
            className="glass-input px-4 py-2.5 rounded-xl text-xs bg-slate-950 max-w-md w-full font-bold text-white"
          >
            {elections.map((e) => (
              <option key={e._id} value={e._id}>{e.title} [{e.type}] - ({e.status})</option>
            ))}
          </select>
        </div>

        {analytics?.election && (
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-400 font-semibold">Status:</span>
            <button
              onClick={() => handleStatusChange('Active')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${analytics.election.status === 'Active' ? 'bg-emerald-500 text-slate-950' : 'glass-panel text-gray-400'}`}
            >
              Active
            </button>
            <button
              onClick={() => handleStatusChange('Completed')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${analytics.election.status === 'Completed' ? 'bg-purple-500 text-white' : 'glass-panel text-gray-400'}`}
            >
              Complete
            </button>
          </div>
        )}
      </div>

      {/* REAL-TIME ELECTION TURNOUT METRICS CARDS */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          
          <div className="glass-panel p-6 rounded-2xl border border-brand-border/60 space-y-2">
            <div className="flex items-center justify-between text-gray-400 text-xs">
              <span>Voter Turnout Rate</span>
              <Activity className="w-4 h-4 text-brand-neon" />
            </div>
            <span className="text-3xl font-extrabold text-brand-neon font-mono">{analytics.turnout.turnoutPercentage}%</span>
            <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div className="h-full bg-brand-neon rounded-full" style={{ width: `${analytics.turnout.turnoutPercentage}%` }}></div>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-brand-border/60 space-y-2">
            <div className="flex items-center justify-between text-gray-400 text-xs">
              <span>Total Votes Cast</span>
              <Vote className="w-4 h-4 text-brand-accent" />
            </div>
            <span className="text-3xl font-extrabold text-white font-mono">{analytics.turnout.totalVotesCast}</span>
            <span className="text-[10px] text-gray-500 block">Out of {analytics.turnout.totalEligibleVoters} registered voters</span>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-brand-border/60 space-y-2">
            <div className="flex items-center justify-between text-gray-400 text-xs">
              <span>Biometric Match Rate</span>
              <ShieldCheck className="w-4 h-4 text-brand-emerald" />
            </div>
            <span className="text-3xl font-extrabold text-brand-emerald font-mono">{analytics.securityMetrics.faceMatchSuccessRate}%</span>
            <span className="text-[10px] text-gray-500 block">Average similarity distance: 0.28</span>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-brand-border/60 space-y-2">
            <div className="flex items-center justify-between text-gray-400 text-xs">
              <span>Duplicate Votes Blocked</span>
              <ShieldAlert className="w-4 h-4 text-amber-400" />
            </div>
            <span className="text-3xl font-extrabold text-amber-400 font-mono">{analytics.securityMetrics.duplicateAttemptsBlocked}</span>
            <span className="text-[10px] text-gray-500 block">Attempted double-voting caught</span>
          </div>

        </div>
      )}

      {/* REAL-TIME CANDIDATE TALLIES TRACKER */}
      {analytics && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-brand-border/60 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-brand-neon" /> Live Candidate Tallies Tracker
            </h2>
            <button
              onClick={() => { setCandData({ ...candData, electionId: selectedElectionId }); setShowCandModal(true); }}
              className="px-3.5 py-1.5 bg-brand-neon/20 text-brand-neon border border-brand-neon/30 rounded-xl text-xs font-bold hover:bg-brand-neon/30 transition-all flex items-center gap-1"
            >
              <UserPlus className="w-3.5 h-3.5" /> Add Candidate
            </button>
          </div>

          <div className="space-y-4">
            {analytics.candidateTallies.map((cand) => (
              <div key={cand.candidateId} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img src={cand.symbolUrl} alt={cand.name} className="w-10 h-10 rounded-lg object-cover border border-slate-700 bg-slate-900" />
                    <div>
                      <h4 className="text-sm font-bold text-white">{cand.name}</h4>
                      <span className="text-[10px] text-gray-400 font-mono uppercase">{cand.party}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-extrabold text-brand-neon font-mono">{cand.votes} Votes</span>
                    <span className="block text-xs text-gray-400 font-mono">{cand.percentage}%</span>
                  </div>
                </div>
                <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div className="h-full bg-gradient-to-r from-brand-accent to-brand-neon rounded-full transition-all duration-500" style={{ width: `${cand.percentage}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* LIVE BLOCKCHAIN BLOCK STREAM TICKER */}
      {analytics?.blockchain && (
        <div className="glass-panel p-6 rounded-2xl border border-brand-border/60 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-brand-neon" /> Live Mined Block Ledger ({analytics.blockchain.totalBlocksMined} Blocks Mined)
            </h3>
          </div>

          <div className="space-y-2">
            {analytics.blockchain.latestBlocks.map((b) => (
              <div key={b._id} className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-brand-neon">Block #{b.index}</span>
                <span className="text-gray-400 truncate max-w-xs">{b.hash}</span>
                <span className="text-gray-500 text-[10px]">Nonce: {b.nonce}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CREATE LOCATION MODAL */}
      {showLocModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="glass-panel w-full max-w-md p-6 rounded-2xl border border-brand-border space-y-4">
            <h3 className="text-lg font-bold text-white">Create Location Boundary</h3>
            <form onSubmit={handleCreateLocation} className="space-y-3">
              <input type="text" placeholder="State (e.g. Karnataka)" required value={locData.state} onChange={(e) => setLocData({...locData, state: e.target.value})} className="glass-input w-full px-4 py-2.5 rounded-xl text-xs" />
              <input type="text" placeholder="District (e.g. Bengaluru Urban)" required value={locData.district} onChange={(e) => setLocData({...locData, district: e.target.value})} className="glass-input w-full px-4 py-2.5 rounded-xl text-xs" />
              <input type="text" placeholder="City (Optional)" value={locData.city} onChange={(e) => setLocData({...locData, city: e.target.value})} className="glass-input w-full px-4 py-2.5 rounded-xl text-xs" />
              <input type="text" placeholder="Ward No. (Optional)" value={locData.ward} onChange={(e) => setLocData({...locData, ward: e.target.value})} className="glass-input w-full px-4 py-2.5 rounded-xl text-xs" />
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowLocModal(false)} className="w-1/2 py-2 glass-panel text-xs text-white rounded-xl">Cancel</button>
                <button type="submit" disabled={loading} className="w-1/2 py-2 bg-brand-neon text-slate-950 font-bold text-xs rounded-xl">Save Location</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE ELECTION MODAL */}
      {showElectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="glass-panel w-full max-w-lg p-6 rounded-2xl border border-brand-border space-y-4">
            <h3 className="text-lg font-bold text-white">Initialize New Election</h3>
            <form onSubmit={handleCreateElection} className="space-y-3">
              <input type="text" placeholder="Election Title" required value={electData.title} onChange={(e) => setElectData({...electData, title: e.target.value})} className="glass-input w-full px-4 py-2.5 rounded-xl text-xs" />
              <textarea placeholder="Description" required value={electData.description} onChange={(e) => setElectData({...electData, description: e.target.value})} className="glass-input w-full px-4 py-2.5 rounded-xl text-xs h-20" />
              <select value={electData.type} onChange={(e) => setElectData({...electData, type: e.target.value})} className="glass-input w-full px-4 py-2.5 rounded-xl text-xs bg-slate-900">
                <option value="Gram Panchayat">Gram Panchayat</option>
                <option value="Ward">Ward</option>
                <option value="Municipality">Municipality</option>
                <option value="Taluk">Taluk</option>
                <option value="District">District</option>
                <option value="City">City</option>
              </select>
              <select value={electData.locationId} onChange={(e) => setElectData({...electData, locationId: e.target.value})} required className="glass-input w-full px-4 py-2.5 rounded-xl text-xs bg-slate-900">
                <option value="">-- Select Location Boundary --</option>
                {locations.map((loc) => (
                  <option key={loc._id} value={loc._id}>{loc.state} - {loc.district} {loc.city ? `(${loc.city})` : ''}</option>
                ))}
              </select>
              <div className="grid grid-cols-2 gap-2">
                <input type="date" required value={electData.startDate} onChange={(e) => setElectData({...electData, startDate: e.target.value})} className="glass-input w-full px-4 py-2.5 rounded-xl text-xs" />
                <input type="date" required value={electData.endDate} onChange={(e) => setElectData({...electData, endDate: e.target.value})} className="glass-input w-full px-4 py-2.5 rounded-xl text-xs" />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowElectModal(false)} className="w-1/2 py-2 glass-panel text-xs text-white rounded-xl">Cancel</button>
                <button type="submit" disabled={loading} className="w-1/2 py-2 bg-brand-neon text-slate-950 font-bold text-xs rounded-xl">Launch Election</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD CANDIDATE MODAL */}
      {showCandModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="glass-panel w-full max-w-md p-6 rounded-2xl border border-brand-border space-y-4">
            <h3 className="text-lg font-bold text-white">Add Election Candidate</h3>
            <form onSubmit={handleCreateCandidate} className="space-y-3">
              <input type="text" placeholder="Candidate Full Name" required value={candData.name} onChange={(e) => setCandData({...candData, name: e.target.value})} className="glass-input w-full px-4 py-2.5 rounded-xl text-xs" />
              <input type="text" placeholder="Party Name / Affiliation" required value={candData.party} onChange={(e) => setCandData({...candData, party: e.target.value})} className="glass-input w-full px-4 py-2.5 rounded-xl text-xs" />
              <input type="url" placeholder="Symbol Logo Image URL (Optional)" value={candData.symbolUrl} onChange={(e) => setCandData({...candData, symbolUrl: e.target.value})} className="glass-input w-full px-4 py-2.5 rounded-xl text-xs" />
              <textarea placeholder="Short Candidate Bio" value={candData.bio} onChange={(e) => setCandData({...candData, bio: e.target.value})} className="glass-input w-full px-4 py-2.5 rounded-xl text-xs h-16" />
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowCandModal(false)} className="w-1/2 py-2 glass-panel text-xs text-white rounded-xl">Cancel</button>
                <button type="submit" disabled={loading} className="w-1/2 py-2 bg-brand-neon text-slate-950 font-bold text-xs rounded-xl">Register Candidate</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
