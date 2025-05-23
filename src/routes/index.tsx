import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../features/auth/context/AuthContext';
import { ToastProvider } from '../shared/context/ToastContext';
import ProtectedRoute from './ProtectedRoute';

import LandingPage from '../features/landing/components/LandingPage';
import LoginPage from '../pages/LoginPage';
import Portal from '../features/portal/components/Portal';
import POSSystem from '../features/portal/components/pos/POSSystem';
import Employees from '../features/portal/components/employees/Employees';
import Clients from '../features/portal/components/clients/Clients';
import NewClient from '../features/portal/components/clients/NewClient';
import Settings from '../features/portal/components/settings/Settings';
import Dashboard from '../features/portal/components/dashboard/Dashboard';

const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            
            <Route element={<ProtectedRoute />}>
              <Route path="/portal" element={<Portal />}>
                <Route index element={<Dashboard />} />
                <Route path="pos" element={<POSSystem />} />
                <Route path="employees" element={<Employees />} />
                <Route path="clients" element={<Clients />} />
                <Route path="clients/new" element={<NewClient />} />
                <Route path="settings" element={<Settings />} />
              </Route>
            </Route>
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
};

export default AppRoutes;