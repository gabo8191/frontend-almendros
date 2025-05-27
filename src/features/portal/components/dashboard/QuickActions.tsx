import React from 'react';
import { Plus, ShoppingCart, Package, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface QuickActionsProps {
  onNewSale: () => void;
  isAdmin: boolean;
}

const QuickActions: React.FC<QuickActionsProps> = ({ onNewSale, isAdmin }) => {
  const navigate = useNavigate();

  const actions = [
    {
      label: 'Nueva Venta',
      icon: Plus,
      color: 'bg-gradient-to-br from-green-500 to-green-600',
      onClick: onNewSale,
      primary: true,
    },
    {
      label: 'Ver Productos',
      icon: Package,
      color: 'bg-gradient-to-br from-blue-500 to-blue-600',
      onClick: () => navigate('/portal/pos'),
    },
    {
      label: 'Ver Ventas',
      icon: ShoppingCart,
      color: 'bg-gradient-to-br from-purple-500 to-purple-600',
      onClick: () => navigate('/portal/sales'),
    },
    ...(isAdmin ? [{
      label: 'Ver Reportes',
      icon: BarChart3,
      color: 'bg-gradient-to-br from-orange-500 to-orange-600',
      onClick: () => navigate('/portal/reports'),
    }] : []),
  ];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            className={`
              ${action.color} text-white p-4 rounded-xl transition-all duration-300 
              hover:scale-105 hover:shadow-lg group
              ${action.primary ? 'col-span-2 md:col-span-1' : ''}
            `}
          >
            <div className="text-center">
              <action.icon size={24} className="mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium">{action.label}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
