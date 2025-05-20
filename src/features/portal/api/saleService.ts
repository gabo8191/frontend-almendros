import api from '../../../utils/axiosConfig';

export interface SaleDetail {
  id: number;
  quantity: number;
  unitPrice: number;
  discountAmount: number;
  productId: number;
  product?: {
    name: string;
    description: string;
  };
}

export interface Sale {
  id: number;
  saleDate: string;
  notes?: string;
  clientId: number;
  client?: {
    name: string;
    email: string;
    documentNumber: string;
  };
  details: SaleDetail[];
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

interface ClientSummary {
  totalSales: number;
  totalAmount: number;
  averageAmount: number;
  lastPurchase: Sale;
  mostPurchasedProducts: {
    product: {
      id: number;
      name: string;
    };
    totalQuantity: number;
    timesPurchased: number;
  }[];
}

export const saleService = {
  // Sales endpoints
  getSales: async (
    page = 1,
    limit = 10,
    filters?: {
      startDate?: string;
      endDate?: string;
      clientId?: number;
    }
  ): Promise<PaginatedResponse<Sale>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(filters?.startDate && { startDate: filters.startDate }),
      ...(filters?.endDate && { endDate: filters.endDate }),
      ...(filters?.clientId && { clientId: filters.clientId.toString() }),
    });

    const response = await api.get<PaginatedResponse<Sale>>(`/sales?${params}`);
    return response.data;
  },

  getSaleById: async (id: number): Promise<Sale> => {
    const response = await api.get<Sale>(`/sales/${id}`);
    return response.data;
  },

  createSale: async (saleData: {
    saleDate: string;
    notes?: string;
    clientId: number;
    details: {
      quantity: number;
      unitPrice: number;
      discountAmount: number;
      productId: number;
    }[];
  }): Promise<Sale> => {
    const response = await api.post<Sale>('/sales', saleData);
    return response.data;
  },

  updateSale: async (
    id: number,
    saleData: {
      saleDate?: string;
      notes?: string;
      clientId?: number;
    }
  ): Promise<Sale> => {
    const response = await api.put<Sale>(`/sales/${id}`, saleData);
    return response.data;
  },

  deleteSale: async (id: number): Promise<void> => {
    await api.delete(`/sales/${id}`);
  },

  // Client sales endpoints
  getClientPurchases: async (
    clientId: number,
    page = 1,
    limit = 10,
    filters?: {
      startDate?: string;
      endDate?: string;
      includeDetails?: boolean;
    }
  ): Promise<{
    data: Sale[];
    meta: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
    summary: ClientSummary;
    client: {
      id: number;
      name: string;
      email: string;
      phoneNumber: string;
      documentType: string;
      documentNumber: string;
    };
  }> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(filters?.startDate && { startDate: filters.startDate }),
      ...(filters?.endDate && { endDate: filters.endDate }),
      ...(filters?.includeDetails !== undefined && { includeDetails: filters.includeDetails.toString() }),
    });

    const response = await api.get(`/sales/client/${clientId}?${params}`);
    return response.data;
  },

  getClientSummary: async (
    clientId: number,
    filters?: {
      startDate?: string;
      endDate?: string;
    }
  ): Promise<ClientSummary> => {
    const params = new URLSearchParams({
      ...(filters?.startDate && { startDate: filters.startDate }),
      ...(filters?.endDate && { endDate: filters.endDate }),
    });

    const response = await api.get<ClientSummary>(`/sales/client/${clientId}/summary?${params}`);
    return response.data;
  },

  // Sale details endpoints
  getSaleDetails: async (saleId: number): Promise<SaleDetail[]> => {
    const response = await api.get<SaleDetail[]>(`/sales/${saleId}/details`);
    return response.data;
  },

  // Reports endpoints
  getSalesSummary: async (startDate?: string, endDate?: string): Promise<any> => {
    const params = new URLSearchParams({
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
    });
    const response = await api.get(`/sales-report/summary?${params}`);
    return response.data;
  },

  getSalesByProduct: async (
    startDate?: string,
    endDate?: string,
    limit?: number
  ): Promise<any> => {
    const params = new URLSearchParams({
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
      ...(limit && { limit: limit.toString() }),
    });
    const response = await api.get(`/sales-report/by-product?${params}`);
    return response.data;
  },

  getSalesByClient: async (
    startDate?: string,
    endDate?: string,
    limit?: number
  ): Promise<any> => {
    const params = new URLSearchParams({
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
      ...(limit && { limit: limit.toString() }),
    });
    const response = await api.get(`/sales-report/by-client?${params}`);
    return response.data;
  },

  getSalesByDate: async (
    startDate: string,
    endDate: string,
    groupBy: 'day' | 'week' | 'month'
  ): Promise<any> => {
    const params = new URLSearchParams({
      startDate,
      endDate,
      groupBy,
    });
    const response = await api.get(`/sales-report/by-date?${params}`);
    return response.data;
  },

  getProductSalesHistory: async (
    productId: number,
    startDate?: string,
    endDate?: string
  ): Promise<any> => {
    const params = new URLSearchParams({
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
    });
    const response = await api.get(`/sales-report/product/${productId}?${params}`);
    return response.data;
  },
};