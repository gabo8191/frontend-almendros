import api from '../../../utils/axiosConfig';

export interface Product {
  id: number;
  name: string;
  description: string;
  minQuantity: number;
  maxQuantity: number;
  supplierId: number;
  purchasePrice: number;
  sellingPrice: number;
  currentStock: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Price {
  id: number;
  productId: number;
  purchasePrice: string | number;
  sellingPrice: string | number;
  isCurrentPrice: boolean;
  validFrom?: string;
  validTo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PriceHistory {
  id: number;
  productId: number;
  oldPrice: number;
  newPrice: number;
  type: 'PURCHASE' | 'SELLING';
  changedAt: string;
}

export interface StockAdjustment {
  type: 'INCREASE' | 'DECREASE';
  quantity: number;
  reason: string;
  notes?: string;
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

export const productService = {
  getProducts: async (
    page = 1,
    limit = 10,
    filters?: {
      name?: string;
      isActive?: boolean;
      supplierId?: number;
    }
  ): Promise<PaginatedResponse<Product>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(filters?.name && { name: filters.name }),
      ...(filters?.isActive !== undefined && { isActive: filters.isActive.toString() }),
      ...(filters?.supplierId && { supplierId: filters.supplierId.toString() }),
    });

    const response = await api.get<PaginatedResponse<Product>>(`/products?${params}`);
    return response.data;
  },

  getLowStockProducts: async (): Promise<Product[]> => {
    const response = await api.get<{ data: Product[] }>('/products/low-stock');
    return response.data.data;
  },

  getProductById: async (id: number): Promise<Product> => {
    const response = await api.get<{ data: Product }>(`/products/${id}`);
    return response.data.data;
  },

  createPrice: async (priceData: {
    purchasePrice: number;
    sellingPrice: number;
    isCurrentPrice: boolean;
    productId: number;
  }): Promise<Price> => {
    try {
      const response = await api.post<Price>('/prices', priceData);
      return response.data;
    } catch (error) {
      console.error('Error creating price:', error);
      throw error;
    }
  },

  getCurrentPrice: async (productId: number): Promise<Price> => {
    try {
      const response = await api.get(`/prices/product/${productId}/current`);
      // The API returns the price object directly, not wrapped in data.data
      return response.data;
    } catch (error) {
      console.error(`Error fetching current price for product ${productId}:`, error);
      throw error;
    }
  },

  createProduct: async (productData: {
    name: string;
    description: string;
    minQuantity: number;
    maxQuantity: number;
    supplierId: number;
    purchasePrice: number;
    sellingPrice: number;
  }): Promise<Product> => {
    try {
      // Make sure all numeric values are properly converted to numbers
      const payload = {
        name: productData.name,
        description: productData.description,
        minQuantity: Number(productData.minQuantity),
        maxQuantity: Number(productData.maxQuantity),
        supplierId: Number(productData.supplierId),
        purchasePrice: Number(productData.purchasePrice),
        sellingPrice: Number(productData.sellingPrice)
      };
      
      // Validate that numeric fields are actually numbers
      if (isNaN(payload.purchasePrice) || isNaN(payload.sellingPrice)) {
        throw new Error('Precio de compra y precio de venta deben ser valores numéricos');
      }
      
      // Send the whole payload to the product creation endpoint
      const response = await api.post<{ data: Product }>('/products', payload);
      return response.data.data;
    } catch (error) {
      console.error('Error in product creation process:', error);
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  },

  updateProduct: async (id: number, productData: Partial<Product>): Promise<Product> => {
    const response = await api.patch<{ data: Product }>(`/products/${id}`, productData);
    return response.data.data;
  },

  deactivateProduct: async (id: number): Promise<Product> => {
    const response = await api.delete<{ data: Product }>(`/products/${id}`);
    return response.data.data;
  },

  adjustStock: async (id: number, adjustment: StockAdjustment): Promise<Product> => {
    const response = await api.patch<{ data: Product }>(`/products/${id}/stock`, adjustment);
    return response.data.data;
  },

  getPriceHistory: async (productId: number): Promise<PriceHistory[]> => {
    const response = await api.get<{ data: PriceHistory[] }>(`/products/${productId}/price-history`);
    return response.data.data;
  },
  
  updatePrice: async (id: number, priceData: {
    purchasePrice?: number;
    sellingPrice?: number;
    isCurrentPrice?: boolean;
  }): Promise<Price> => {
    const response = await api.patch<Price>(`/prices/${id}`, priceData);
    return response.data;
  },

  getStockStatusReport: async (): Promise<any> => {
    const response = await api.get('/products/reports/stock-status');
    return response.data;
  },

  getSalesPerformanceReport: async (dateFrom: string, dateTo: string): Promise<any> => {
    const params = new URLSearchParams({ dateFrom, dateTo });
    const response = await api.get(`/products/reports/sales-performance?${params}`);
    return response.data;
  },

  getPriceChangesReport: async (dateFrom: string, dateTo: string): Promise<any> => {
    const params = new URLSearchParams({ dateFrom, dateTo });
    const response = await api.get(`/products/reports/price-changes?${params}`);
    return response.data;
  },
};