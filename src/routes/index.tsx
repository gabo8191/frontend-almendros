import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../features/auth/context/AuthContext';
import { ToastProvider } from '../shared/context/ToastContext';
import ProtectedRoute from './ProtectedRoute';
import ConditionalHome from './ConditionalHome';
import AuthenticatedRoute from './AuthenticatedRoute';

import Portal from '../pages/portal/Portal';
import POSSystem from '../features/portal/components/products/Products';
import Employees from '../features/portal/components/employees/Employees';
import Clients from '../features/portal/components/clients/Clients';
import Dashboard from '../features/portal/components/dashboard/Dashboard';
import SalesPage from '../features/portal/components/sales/SalesPage';
import InventoryMovements from '../features/portal/components/inventory/InventoryMovements';
import InventoryReports from '../features/portal/components/reports/Reports';
import SuppliersPage from '../features/portal/components/suppliers/SuppliersPage';

const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<ConditionalHome />} />
            <Route path="/login" element={<AuthenticatedRoute />} />
            
            <Route element={<ProtectedRoute />}>
              <Route path="/portal" element={<Portal />}>
                <Route index element={<Dashboard />} />
                <Route path="pos" element={<POSSystem />} />
                <Route path="sales" element={<SalesPage />} />
                <Route path="employees" element={<Employees />} />
                <Route path="clients" element={<Clients />} />
                <Route path="inventory" element={<InventoryMovements />} />
                <Route path="reports" element={<InventoryReports />} />
                <Route path="suppliers" element={<SuppliersPage />} />
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