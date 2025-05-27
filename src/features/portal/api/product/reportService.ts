import api from '../../../../utils/axiosConfig';

const buildParams = (obj: Record<string, any>) => {
  const params = new URLSearchParams();
  Object.entries(obj).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      params.append(key, String(value));
    }
  });
  return params.toString();
};

export const productReportService = {
  getStockStatusReport: async (): Promise<any> => {
    const response = await api.get('/products/reports/stock-status');
    return response.data;
  },

  getSalesPerformanceReport: async (dateFrom: string, dateTo: string): Promise<any> => {
    const query = buildParams({ dateFrom, dateTo });
    const response = await api.get(`/products/reports/sales-performance?${query}`);
    return response.data;
  },

  getPriceChangesReport: async (dateFrom: string, dateTo: string): Promise<any> => {
    const query = buildParams({ dateFrom, dateTo });
    const response = await api.get(`/products/reports/price-changes?${query}`);
    return response.data;
  },
};
