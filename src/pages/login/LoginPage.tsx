import React from 'react';
import { Navigate } from 'react-router-dom';
import Header from '../../shared/components/Header';
import LoginForm from '../../features/auth/components/LoginForm';
import { useAuth } from '../../features/auth/context/AuthContext';

const LoginPage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/portal" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex flex-col">
      <Header />
      <main className="flex-grow flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-semibold text-gray-900">Bienvenido a Almendros</h1>
            <p className="mt-2 text-gray-600">Inicia sesión para acceder a tu cuenta</p>
          </div>
          <LoginForm />
          <p className="mt-8 text-center text-sm text-gray-600">
            &copy; {new Date().getFullYear()} Almendros. Todos los derechos reservados.
          </p>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;
