import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoutes';

// Pages
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import VoterDashboard from './pages/VoterDashboard';
import VotingPage from './pages/VotingPage';
import LiveResults from './pages/LiveResults';
import AdminDashboard from './pages/AdminDashboard';
import ReceiptVerifier from './pages/ReceiptVerifier';

function App() {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <div className="min-h-screen flex flex-col justify-between bg-brand-dark text-gray-100">
            <div>
              <Navbar />
              <main>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/results/:electionId" element={<LiveResults />} />
                  <Route path="/verify-receipt" element={<ReceiptVerifier />} />

                  {/* Protected Voter Routes */}
                  <Route element={<ProtectedRoute />}>
                    <Route path="/dashboard" element={<VoterDashboard />} />
                    <Route path="/vote/:electionId" element={<VotingPage />} />
                  </Route>

                  {/* Protected Admin Routes */}
                  <Route element={<AdminRoute />}>
                    <Route path="/admin" element={<AdminDashboard />} />
                  </Route>
                </Routes>
              </main>
            </div>
            <Footer />
          </div>
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
