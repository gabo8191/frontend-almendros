import React, { useState } from 'react';
import { useAuth } from '../../features/auth/context/AuthContext';
import { Role } from '../../features/auth/types';
import PortalHeader from './PortalHeader';
import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';

const Portal: React.FC = () => {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <PortalHeader toggleSidebar={toggleSidebar} />
        
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Portal;