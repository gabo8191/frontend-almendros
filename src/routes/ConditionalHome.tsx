import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../features/auth/context/AuthContext';
import LandingPage from '../pages/landing/LandingPage';
import Spinner from '../shared/components/Spinner';

const ConditionalHome: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // Si está autenticado, redirigir al portal
  if (isAuthenticated) {
    return <Navigate to="/portal" replace />;
  }

  // Si no está autenticado, mostrar landing page
  return <LandingPage />;
};

export default ConditionalHome;
