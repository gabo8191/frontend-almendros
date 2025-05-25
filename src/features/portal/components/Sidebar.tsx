import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  ShoppingCart, 
  Users, 
  Package, 
  Settings, 
  X, 
  Truck,
  BarChart3,
  ClipboardList,
  BoxesIcon
} from 'lucide-react';
import { cn } from '../../../utils/cn';
import { useAuth } from '../../auth/context/AuthContext';
import { Role } from '../../auth/types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const SidebarLink: React.FC<{
  to: string;
  icon: React.ReactNode;
  label: string;
}> = ({ to, icon, label }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={cn(
        'flex items-center px-4 py-3 rounded-xl text-gray-600 transition-colors',
        isActive 
          ? 'bg-primary-50 text-primary-700' 
          : 'hover:bg-gray-100'
      )}
    >
      <span className={cn('mr-3', isActive ? 'text-primary-600' : 'text-gray-500')}>{icon}</span>
      <span className="font-medium">{label}</span>
      {isActive && <div className="w-1 h-6 bg-primary-600 rounded-full ml-auto"></div>}
    </Link>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === Role.ADMINISTRATOR;

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 3xl:hidden"
          onClick={onClose}
        ></div>
      )}
      
      <aside 
        className={cn(
          'fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          '3xl:translate-x-0 3xl:z-0'
        )}
      >
        <div className="h-16 px-4 flex items-center justify-between border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Portal</h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 3xl:hidden"
          >
            <X size={20} />
          </button>
        </div>
        
        <nav className="p-4 space-y-1">
          <SidebarLink to="/portal" icon={<Home size={20} />} label="Inicio" />
          <SidebarLink to="/portal/pos" icon={<ShoppingCart size={20} />} label="Productos" />
          <SidebarLink to="/portal/sales" icon={<ClipboardList size={20} />} label="Ventas" />
          <SidebarLink to="/portal/inventory" icon={<BoxesIcon size={20} />} label="Inventario" />
          {isAdmin && (
            <SidebarLink to="/portal/reports" icon={<BarChart3 size={20} />} label="Reportes" />
          )}
          
          {isAdmin && (
            <>
              <SidebarLink to="/portal/employees" icon={<Users size={20} />} label="Empleados" />
              <SidebarLink to="/portal/clients" icon={<Package size={20} />} label="Clientes" />
              <SidebarLink to="/portal/suppliers" icon={<Truck size={20} />} label="Proveedores" />
              <SidebarLink to="/portal/settings" icon={<Settings size={20} />} label="Configuración" />
            </>
          )}
        </nav>
        
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="font-medium text-gray-900 mb-1">¿Necesitas ayuda?</h3>
            <p className="text-sm text-gray-600 mb-3">Contacta a soporte para asistencia</p>
            <a 
              href="/support" 
              className="text-primary-600 text-sm font-medium hover:underline"
            >
              Contactar Soporte
            </a>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;