import React from 'react';
import { Navigate } from 'react-router-dom';
import AuthService from '../services/auth.service';

const PrivateRoute = ({ children }) => {
  const isAuthenticated = AuthService.isAuthenticated();
  
  if (!isAuthenticated) {
    // Redirect to login page if not authenticated
    return <Navigate to="/login" />;
  }
  
  return children;
};

export default PrivateRoute;
