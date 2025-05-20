import api from '../../../utils/axiosConfig';

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
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(filters?.type && { type: filters.type }),
      ...(filters?.productId && { productId: filters.productId.toString() }),
      ...(filters?.supplierId && { supplierId: filters.supplierId.toString() }),
      ...(filters?.saleId && { saleId: filters.saleId.toString() }),
      ...(filters?.dateFrom && { dateFrom: filters.dateFrom }),
      ...(filters?.dateTo && { dateTo: filters.dateTo }),
      ...(filters?.reason && { reason: filters.reason }),
    });

    const response = await api.get<PaginatedResponse<InventoryMovement>>(`/inventory-movements?${params}`);
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
    } catch (error) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
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
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(filters?.type && { type: filters.type }),
      ...(filters?.supplierId && { supplierId: filters.supplierId.toString() }),
      ...(filters?.saleId && { saleId: filters.saleId.toString() }),
      ...(filters?.dateFrom && { dateFrom: filters.dateFrom }),
      ...(filters?.dateTo && { dateTo: filters.dateTo }),
      ...(filters?.reason && { reason: filters.reason }),
    });

    const response = await api.get<PaginatedResponse<InventoryMovement>>(
      `/inventory-movements/products/${productId}?${params}`
    );
    return response.data;
  },

  getStockTransactionsReport: async (dateFrom: string, dateTo: string): Promise<any> => {
    const params = new URLSearchParams({ dateFrom, dateTo });
    const response = await api.get(`/inventory-movements/report/stock-transactions?${params}`);
    return response.data;
  },
};