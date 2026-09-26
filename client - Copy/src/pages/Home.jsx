import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Vote, Scan, Phone, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';

const Home = () => {
  return (
    <div className="space-y-16 pb-16">
      
      {/* Hero Section */}
      <section className="relative pt-12 pb-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center space-y-8">
        
        {/* Government Grade Security Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel border-brand-border text-brand-neon text-xs font-bold uppercase tracking-wider shadow-neon-cyan">
          <ShieldCheck className="w-4 h-4 text-brand-accent" />
          Official Biometric Multi-Factor Voting Portal
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
          Secure & Transparent <br />
          <span className="bg-gradient-to-r from-brand-neon via-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Digital Democracy Portal
          </span>
        </h1>

        {/* Subtitle */}
        <p className="max-w-2xl mx-auto text-base sm:text-lg text-gray-300 leading-relaxed">
          Cast your vote safely using <strong className="text-brand-neon">AI Face Recognition</strong>, <strong className="text-brand-neon">Phone SMS Passcode</strong>, and <strong className="text-brand-neon">Location-Based Election Matching</strong>.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
          <Link
            to="/register"
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-brand-accent to-brand-neon text-slate-950 font-extrabold text-sm hover:from-cyan-400 hover:to-blue-400 shadow-xl shadow-brand-neon/25 transition-all duration-300 flex items-center justify-center gap-2 group"
          >
            Voter Registration
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            to="/login"
            className="w-full sm:w-auto px-8 py-4 rounded-xl glass-panel text-white font-bold text-sm hover:border-brand-neon/80 transition-all duration-300 flex items-center justify-center gap-2"
          >
            Voter Login <ArrowRight className="w-4 h-4 text-brand-neon" />
          </Link>
        </div>

      </section>

      {/* Clean 4 Feature Cards Grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          
          {/* Card 1 */}
          <div className="glass-panel p-6 rounded-2xl border border-brand-border/60 space-y-3 hover:border-brand-neon/60 transition-all">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-brand-neon flex items-center justify-center font-bold border border-blue-500/30">
              <Vote className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Voter ID Auth</h3>
            <p className="text-xs text-gray-400">Verified against government records with encrypted credentials.</p>
          </div>

          {/* Card 2 */}
          <div className="glass-panel p-6 rounded-2xl border border-brand-border/60 space-y-3 hover:border-brand-neon/60 transition-all">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-brand-accent flex items-center justify-center font-bold border border-cyan-500/30">
              <Scan className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">AI Face Verification</h3>
            <p className="text-xs text-gray-400">Live facial landmark verification prevents identity impersonation.</p>
          </div>

          {/* Card 3 */}
          <div className="glass-panel p-6 rounded-2xl border border-brand-border/60 space-y-3 hover:border-brand-neon/60 transition-all">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-brand-emerald flex items-center justify-center font-bold border border-emerald-500/30">
              <Phone className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Phone SMS OTP</h3>
            <p className="text-xs text-gray-400">Single-use 6-digit passcode sent directly to registered mobile.</p>
          </div>

          {/* Card 4 */}
          <div className="glass-panel p-6 rounded-2xl border border-brand-border/60 space-y-3 hover:border-brand-neon/60 transition-all">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold border border-purple-500/30">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">1 Voter 1 Vote</h3>
            <p className="text-xs text-gray-400">Cryptographic tokens prevent duplicate or altered votes.</p>
          </div>

        </div>
      </section>

      {/* Clean Location System Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel p-8 rounded-3xl border border-brand-border/80 text-center space-y-4">
          <h2 className="text-xl sm:text-2xl font-extrabold text-white">
            Location-Based Election System
          </h2>
          <p className="text-xs sm:text-sm text-gray-300 max-w-xl mx-auto">
            Voters automatically see elections matching their registered location boundary (State, District, City, Ward, Panchayat).
          </p>
          <div className="flex flex-wrap justify-center gap-2 pt-2 text-xs font-semibold text-brand-neon">
            <span className="bg-brand-neon/10 px-3 py-1.5 rounded-lg border border-brand-neon/20">Gram Panchayat</span>
            <span className="bg-brand-neon/10 px-3 py-1.5 rounded-lg border border-brand-neon/20">Ward Boundary</span>
            <span className="bg-brand-neon/10 px-3 py-1.5 rounded-lg border border-brand-neon/20">Municipality</span>
            <span className="bg-brand-neon/10 px-3 py-1.5 rounded-lg border border-brand-neon/20">District Board</span>
            <span className="bg-brand-neon/10 px-3 py-1.5 rounded-lg border border-brand-neon/20">City Corporation</span>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
