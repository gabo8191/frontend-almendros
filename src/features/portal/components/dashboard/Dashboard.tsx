import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  DollarSign, 
  ShoppingCart, 
  TrendingUp, 
  Users, 
  Package, 
  AlertTriangle,
  RefreshCw 
} from 'lucide-react';
import { useAuth } from '../../../auth/context/AuthContext';
import { Role } from '../../../auth/types';
import DashboardCard from './DashboardCard.tsx ';
import QuickActions from './QuickActions';
import NewSaleModal from '../sales/NewSaleModal';
import { useDashboard } from './hooks/useDashboard';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === Role.ADMINISTRATOR;
  const [isNewSaleModalOpen, setIsNewSaleModalOpen] = useState(false);
  
  const { stats, formatCurrency, formatDate, refreshData } = useDashboard();

  const handleSaleCreated = () => {
    setIsNewSaleModalOpen(false);
    refreshData();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            ¡Hola, {user?.firstName}! 👋
          </h1>
          <p className="text-gray-600 mt-1">
            {isAdmin 
              ? 'Aquí está el resumen de la actividad del negocio'
              : 'Aquí está el resumen de tus ventas'}
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <button
            onClick={refreshData}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <RefreshCw size={16} />
            <span className="text-sm">Actualizar</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          title="Ventas de Hoy"
          value={formatCurrency(stats.todaySales.total)}
          subtitle={`${stats.todaySales.count} transacciones`}
          icon={DollarSign}
          color="green"
          onClick={() => navigate('/portal/sales')}
          isLoading={stats.isLoading}
        />
        
        <DashboardCard
          title="Ventas de la Semana"
          value={formatCurrency(stats.thisWeekSales.total)}
          subtitle={`${stats.thisWeekSales.count} transacciones`}
          icon={TrendingUp}
          color="blue"
          onClick={() => navigate('/portal/sales')}
          isLoading={stats.isLoading}
        />
        
        <DashboardCard
          title="Total Productos"
          value={stats.totalProducts}
          subtitle={stats.lowStockProducts > 0 ? `${stats.lowStockProducts} con bajo stock` : 'Stock saludable'}
          icon={Package}
          color={stats.lowStockProducts > 0 ? 'orange' : 'purple'}
          onClick={() => navigate('/portal/pos')}
          isLoading={stats.isLoading}
        />
        
        <DashboardCard
          title={isAdmin ? 'Total Clientes' : 'Mis Clientes'}
          value={stats.totalClients}
          subtitle="Clientes registrados"
          icon={Users}
          color="pink"
          onClick={() => navigate('/portal/clients')}
          isLoading={stats.isLoading}
        />
      </div>

      <QuickActions 
        onNewSale={() => setIsNewSaleModalOpen(true)} 
        isAdmin={isAdmin}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Ventas Recientes</h3>
            <button
              onClick={() => navigate('/portal/sales')}
              className="text-primary-600 text-sm font-medium hover:underline"
            >
              Ver todas
            </button>
          </div>
          
          {stats.isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex justify-between items-center p-3">
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : Array.isArray(stats.recentSales) && stats.recentSales.length > 0 ? (
            <div className="space-y-2">
              {stats.recentSales.map((sale: any) => (
                <div key={sale.id} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div>
                    <p className="font-medium text-gray-900">{sale.clientName}</p>
                    <p className="text-sm text-gray-500">{formatDate(sale.date)}</p>
                  </div>
                  <span className="font-semibold text-green-600">
                    {formatCurrency(sale.total)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <ShoppingCart size={48} className="mx-auto mb-3 text-gray-300" />
              <p>No hay ventas recientes</p>
            </div>
          )}
        </div>

        {stats.lowStockProducts > 0 && (
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6">
            <div className="flex items-start">
              <div className="p-2 bg-amber-100 rounded-lg mr-3">
                <AlertTriangle size={20} className="text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-amber-900 mb-1">
                  Productos con Bajo Stock
                </h3>
                <p className="text-amber-700 mb-4">
                  {stats.lowStockProducts} productos necesitan reabastecimiento
                </p>
                <button
                  onClick={() => navigate('/portal/pos')}
                  className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors text-sm font-medium"
                >
                  Ver Productos
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <NewSaleModal
        isOpen={isNewSaleModalOpen}
        onClose={() => setIsNewSaleModalOpen(false)}
        onSaleCreated={handleSaleCreated}
      />
    </div>
  );
};

export default Dashboard;
