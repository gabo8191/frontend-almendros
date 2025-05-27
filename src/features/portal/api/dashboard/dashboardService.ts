import api from '../../../../utils/axiosConfig';

export interface DashboardStats {
  todaySales: {
    total: number;
    count: number;
    growth: number;
  };
  thisWeekSales: {
    total: number;
    count: number;
    growth: number;
  };
  thisMonthSales: {
    total: number;
    count: number;
    growth: number;
  };
  lowStockProducts: number;
  totalProducts: number;
  totalClients: number;
  recentSales: Array<{
    id: number;
    clientName: string;
    total: number;
    date: string;
  }>;
  topProducts: Array<{
    id: number;
    name: string;
    quantitySold: number;
    revenue: number;
  }>;
}

export const dashboardService = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await api.get<DashboardStats>('/dashboard/stats');
    return response.data;
  },

  // Funciones helper para estadísticas específicas
  getTodayStats: async () => {
    const today = new Date().toISOString().split('T')[0];
    const response = await api.get(`/sales-report/summary?startDate=${today}&endDate=${today}`);
    return response.data;
  },

  getQuickStats: async () => {
    const [salesResponse, productsResponse, clientsResponse] = await Promise.all([
      api.get('/sales-report/summary'),
      api.get('/products?page=1&limit=1'),
      api.get('/clients?page=1&limit=1'),
    ]);

    return {
      sales: salesResponse.data,
      totalProducts: productsResponse.data.meta?.total || 0,
      totalClients: clientsResponse.data.meta?.total || 0,
    };
  },
};
