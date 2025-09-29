import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isTokenValid } from '../services/authService';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isTokenValid()) {
      navigate('/');
      return;
    }
  }, [navigate]);

  return children;
};

export default ProtectedRoute;