import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

/**
 * Route protection wrapper that redirects unauthenticated users to /login
 */
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // Show spinner while checking session validity on page reload
  if (loading) {
    return (
      <div style={{ height: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <LoadingSpinner />
      </div>
    );
  }

  // Redirect to login if user is not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
