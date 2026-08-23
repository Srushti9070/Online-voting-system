import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Vote, LogOut, User as UserIcon, LayoutDashboard } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 glass-panel border-b border-brand-border/40 backdrop-blur-glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-brand-accent to-brand-neon p-0.5 shadow-lg group-hover:shadow-brand-neon/50 transition-all duration-300">
              <div className="w-full h-full bg-brand-dark rounded-[10px] flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-brand-neon group-hover:scale-110 transition-transform duration-300" />
              </div>
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-white">
                Trust<span className="text-brand-neon">Vote</span>
              </span>
              <span className="block text-[10px] tracking-wider text-brand-accent uppercase font-semibold">
                Official E-Voting Portal
              </span>
            </div>
          </Link>

          {/* Clean Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-sm font-semibold text-gray-300 hover:text-brand-neon transition-colors flex items-center gap-2">
              <Vote className="w-4 h-4 text-brand-neon" /> Home
            </Link>

            {user && user.role === 'voter' && (
              <Link to="/dashboard" className="text-sm font-semibold text-gray-300 hover:text-brand-neon transition-colors flex items-center gap-2">
                <LayoutDashboard className="w-4 h-4 text-brand-neon" /> Voter Dashboard
              </Link>
            )}

            {user && user.role === 'admin' && (
              <Link to="/admin" className="text-sm font-bold text-brand-neon hover:text-cyan-300 transition-colors flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" /> Admin Panel
              </Link>
            )}
          </div>

          {/* Action Buttons / User Badge */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="glass-panel px-3.5 py-1.5 rounded-xl flex items-center gap-2 text-xs border border-brand-border">
                  <div className="w-2 h-2 rounded-full bg-brand-emerald animate-pulse"></div>
                  <UserIcon className="w-3.5 h-3.5 text-brand-neon" />
                  <span className="font-semibold text-gray-100">{user.fullName.split(' ')[0]}</span>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-brand-neon/20 text-brand-neon border border-brand-neon/30">
                    {user.role}
                  </span>
                </div>
                
                <button
                  onClick={handleLogout}
                  className="p-2.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30 transition-all duration-200"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-sm font-semibold text-gray-300 hover:text-white px-4 py-2.5 rounded-xl transition-all duration-200"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-bold text-slate-950 bg-gradient-to-r from-brand-accent to-brand-neon hover:from-cyan-400 hover:to-blue-400 px-5 py-2.5 rounded-xl shadow-lg shadow-brand-neon/25 transition-all duration-300"
                >
                  Voter Registration
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;
