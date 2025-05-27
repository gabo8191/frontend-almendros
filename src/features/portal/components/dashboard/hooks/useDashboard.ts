import { useState, useEffect } from 'react';
import { saleService } from '../../../api/sale/saleService';
import { productService } from '../../../api/product';
import { clientService } from '../../../api/client/clientService';
import { useToast } from '../../../../../shared/context/ToastContext';

export interface RecentSale {
  id: number;
  clientName: string;
  total: number;
  date: string;
}

export interface DashboardStats {
  todaySales: { total: number; count: number };
  thisWeekSales: { total: number; count: number };
  lowStockProducts: number;
  totalProducts: number;
  totalClients: number;
  recentSales: RecentSale[];
  isLoading: boolean;
}

export const useDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    todaySales: { total: 0, count: 0 },
    thisWeekSales: { total: 0, count: 0 },
    lowStockProducts: 0,
    totalProducts: 0,
    totalClients: 0,
    recentSales: [],
    isLoading: true,
  });

  const { showToast } = useToast();

  const fetchDashboardData = async (): Promise<void> => {
    try {
      setStats(prev => ({ ...prev, isLoading: true }));

      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay() + 1);
      const weekStartStr = weekStart.toISOString().split('T')[0];

      const [
        todaySalesResponse,
        weekSalesResponse,
        productsResponse,
        clientsResponse,
        recentSalesResponse,
      ] = await Promise.all([
        saleService.getSales(1, 100, { startDate: todayStr, endDate: todayStr }),
        saleService.getSales(1, 100, { startDate: weekStartStr, endDate: todayStr }),
        productService.getProducts(1, 1),
        clientService.getClients(1, 1),
        saleService.getSales(1, 5),
      ]);

      const todayTotal = todaySalesResponse.data.reduce((sum, sale) => sum + sale.totalAmount, 0);
      const weekTotal = weekSalesResponse.data.reduce((sum, sale) => sum + sale.totalAmount, 0);

      let lowStockCount = 0;
      try {
        const lowStockProducts = await productService.getLowStockProducts();
        lowStockCount = lowStockProducts.length;
      } catch (error) {
        // Handle silently
      }

      const recentSalesData: RecentSale[] = recentSalesResponse.data.slice(0, 5).map(sale => ({
        id: sale.id,
        clientName: sale.client?.name || 'Cliente no disponible',
        total: sale.totalAmount,
        date: sale.saleDate,
      }));

      setStats({
        todaySales: {
          total: todayTotal,
          count: todaySalesResponse.data.length,
        },
        thisWeekSales: {
          total: weekTotal,
          count: weekSalesResponse.data.length,
        },
        lowStockProducts: lowStockCount,
        totalProducts: productsResponse.meta.total,
        totalClients: clientsResponse.meta.total,
        recentSales: recentSalesData,
        isLoading: false,
      });
    } catch (error) {
      showToast('error', 'Error al cargar las estadísticas del dashboard');
      setStats(prev => ({ 
        ...prev, 
        isLoading: false,
        recentSales: [] as RecentSale[]
      }));
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
    }).format(amount);
  };

  const formatDate = (date: string): string => {
    return new Date(date).toLocaleDateString('es-CO', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  useEffect(() => {
    fetchDashboardData();

    const interval = setInterval(fetchDashboardData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return {
    stats,
    formatCurrency,
    formatDate,
    refreshData: fetchDashboardData,
  };
};
