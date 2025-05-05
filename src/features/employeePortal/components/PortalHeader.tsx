import React from 'react';
import { Menu, BellRing, User, LogOut } from 'lucide-react';
import { useAuth } from '../../auth/context/AuthContext';
import { LeafyGreen } from 'lucide-react';

interface PortalHeaderProps {
  toggleSidebar: () => void;
}

const PortalHeader: React.FC<PortalHeaderProps> = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = React.useState(false);

  const toggleUserMenu = () => {
    setShowUserMenu(prev => !prev);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-4 h-16 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center">
        <button
          onClick={toggleSidebar}
          className="p-2 mr-4 text-gray-700 rounded-lg hover:bg-gray-100 lg:hidden"
          aria-label="Toggle sidebar"
        >
          <Menu size={24} />
        </button>
        <div className="flex items-center">
          <LeafyGreen className="h-7 w-7 text-primary-600" />
          <span className="ml-2 text-xl font-semibold text-gray-900">Almendros</span>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <button className="p-2 text-gray-700 rounded-full hover:bg-gray-100" aria-label="Notifications">
          <BellRing size={20} />
        </button>
        
        <div className="relative">
          <button 
            className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100"
            onClick={toggleUserMenu}
          >
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
              <User size={18} className="text-primary-700" />
            </div>
            <span className="text-sm font-medium text-gray-700 hidden md:block">
              {user?.firstName || 'User'}
            </span>
          </button>
          
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-apple-md py-2 z-20 animate-fade-in">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <a href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                Profile Settings
              </a>
              <button 
                onClick={() => {
                  logout();
                  setShowUserMenu(false);
                }}
                className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
              >
                <LogOut size={16} className="mr-2" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default PortalHeader;