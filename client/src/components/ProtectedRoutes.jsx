import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-dark">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-brand-neon border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-mono text-brand-neon">Authenticating Session Credentials...</p>
        </div>
      </div>
    );
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export const AdminRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-dark">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-brand-accent border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-mono text-brand-accent">Verifying Administrator Privileges...</p>
        </div>
      </div>
    );
  }

  return user && user.role === 'admin' ? <Outlet /> : <Navigate to="/dashboard" replace />;
};
