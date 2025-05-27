import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../features/auth/context/AuthContext';
import LoginPage from '../pages/login/LoginPage';
import Spinner from '../shared/components/Spinner';

const AuthenticatedRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // Si ya está autenticado, redirigir al portal
  if (isAuthenticated) {
    return <Navigate to="/portal" replace />;
  }

  // Si no está autenticado, mostrar login
  return <LoginPage />;
};

export default AuthenticatedRoute;