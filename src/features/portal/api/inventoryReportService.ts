import api from '../../../utils/axiosConfig';

export interface ReportQuery {
  query: string;
  params: Record<string, any>;
  metadata: Record<string, any>;
}

export interface ReportRequest {
  reportType: 'general' | 'summary';
  format: 'xlsx';
  supplierId?: string;
  startDate?: string;
  endDate?: string;
}

export const inventoryReportService = {
  getReportQuery: async (request: ReportRequest): Promise<ReportQuery> => {
    try {
      const response = await api.post<ReportQuery>('/inventory-reports/query', request);
      return response.data;
    } catch (error) {
      console.error('Error getting report query:', error);
      throw error;
    }
  },

  getSummaryQuery: async (): Promise<ReportQuery> => {
    try {
      const response = await api.post<ReportQuery>('/inventory-reports/summary-query');
      return response.data;
    } catch (error) {
      console.error('Error getting summary query:', error);
      throw error;
    }
  },

  executeQuery: async (query: ReportQuery): Promise<any> => {
    try {
      const response = await api.post('/inventory-reports/execute', query);
      return response.data;
    } catch (error) {
      console.error('Error executing query:', error);
      throw error;
    }
  },

  downloadReport: async (reportId: string): Promise<Blob> => {
    try {
      const response = await api.get(`/inventory-reports/download/${reportId}`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error downloading report:', error);
      throw error;
    }
  }
};