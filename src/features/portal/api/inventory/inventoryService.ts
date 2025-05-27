import api from "../../../../utils/axiosConfig";

export type MovementType = 'ENTRY' | 'EXIT';

export interface InventoryMovement {
  id: number;
  type: MovementType;
  quantity: number;
  reason: string;
  notes?: string;
  movementDate: string;
  product: {
    id: number;
    name: string;
    description: string;
    currentStock: number;
  };
  supplier?: {
    id: number;
    name: string;
    contactName: string;
  };
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  sale?: {
    id: number;
    saleDate: string;
    totalAmount: number;
  };
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
  message: string;
}

/**
 * Helper function to build URL search parameters
 */
const buildParams = (paramsObj: Record<string, any>) => {
  const params = new URLSearchParams();
  Object.entries(paramsObj).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      params.append(key, String(value));
    }
  });
  return params.toString();
};

export const inventoryService = {
  getMovements: async (
    page = 1,
    limit = 10,
    filters?: {
      type?: MovementType;
      productId?: number;
      supplierId?: number;
      saleId?: number;
      dateFrom?: string;
      dateTo?: string;
      reason?: string;
    }
  ): Promise<PaginatedResponse<InventoryMovement>> => {
    const query = buildParams({
      page,
      limit,
      ...filters,
    });

    const response = await api.get<PaginatedResponse<InventoryMovement>>(`/inventory-movements?${query}`);
    return response.data;
  },

  getMovementById: async (id: number): Promise<InventoryMovement> => {
    const response = await api.get<{ data: InventoryMovement }>(`/inventory-movements/${id}`);
    return response.data.data;
  },

  createMovement: async (movementData: {
    type: MovementType;
    quantity: number;
    productId: number;
    supplierId?: number;
    saleId?: number;
    reason: string;
    notes?: string;
  }): Promise<InventoryMovement> => {
    try {
      const response = await api.post<{ data: InventoryMovement; message: string }>('/inventory-movements', movementData);
      return response.data.data;
    } catch (error: unknown) {
      if (typeof error === 'object' && error !== null && 'response' in error &&
          typeof (error as any).response === 'object' && (error as any).response !== null &&
          'data' in (error as any).response &&
          typeof (error as any).response.data === 'object' && (error as any).response.data !== null &&
          'message' in (error as any).response.data) {
        throw new Error((error as any).response.data.message);
      }
      throw error;
    }
  },

  updateMovement: async (
    id: number,
    data: { reason: string; notes?: string }
  ): Promise<InventoryMovement> => {
    const response = await api.patch<{ data: InventoryMovement }>(`/inventory-movements/${id}`, data);
    return response.data.data;
  },

  getStockAlerts: async (): Promise<any> => {
    const response = await api.get('/inventory-movements/stock-alert');
    return response.data;
  },

  getProductMovements: async (
    productId: number,
    page = 1,
    limit = 10,
    filters?: {
      type?: MovementType;
      supplierId?: number;
      saleId?: number;
      dateFrom?: string;
      dateTo?: string;
      reason?: string;
    }
  ): Promise<PaginatedResponse<InventoryMovement>> => {
    const query = buildParams({
      page,
      limit,
      ...filters,
    });

    const response = await api.get<PaginatedResponse<InventoryMovement>>(
      `/inventory-movements/products/${productId}?${query}`
    );
    return response.data;
  },

  getStockTransactionsReport: async (dateFrom: string, dateTo: string): Promise<any> => {
    const params = new URLSearchParams({ dateFrom, dateTo });
    const response = await api.get(`/inventory-movements/report/stock-transactions?${params}`);
    return response.data;
  },
};
