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

export interface ProductWithPriceAndDiscount extends Product {
  currentPrice?: Price;
  activeDiscounts?: Discount[];
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

export interface Discount {
  id: number;
  productId: number;
  percentage: number;
  isActive: boolean;
  validFrom: string;
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

export interface CreateProductData {
  name: string;
  description: string;
  minQuantity: number;
  maxQuantity: number;
  supplierId: number;
  purchasePrice: number;
  sellingPrice: number;
}

export interface CreateProductWithPriceData extends CreateProductData {
  discount?: {
    percentage: number;
    validFrom: string;
    validTo?: string;
  };
}

export interface ProductFilters {
  name?: string;
  isActive?: boolean;
  supplierId?: number;
  stockStatus?: 'low' | 'normal' | 'high' | 'critical';
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

interface ApiResponse<T> {
  data: T;
}

export const productService = {
  // Get paginated list of products
  getProducts: async (
    page = 1,
    limit = 10,
    filters?: ProductFilters
  ): Promise<PaginatedResponse<Product>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(filters?.name && { name: filters.name }),
      ...(filters?.isActive !== undefined && { isActive: filters.isActive.toString() }),
      ...(filters?.supplierId && { supplierId: filters.supplierId.toString() }),
      ...(filters?.stockStatus && { stockStatus: filters.stockStatus }),
    });

    const response = await api.get<PaginatedResponse<Product>>(`/products?${params}`);
    return response.data;
  },

  // Get products with low stock
  getLowStockProducts: async (): Promise<Product[]> => {
    const response = await api.get<ApiResponse<Product[]>>('/products/low-stock');
    return response.data.data;
  },

  // Get a product by ID
  getProductById: async (id: number): Promise<Product> => {
    const response = await api.get<ApiResponse<Product>>(`/products/${id}`);
    return response.data.data;
  },

  // Get a product with its current price and active discounts
  getProductWithPriceAndDiscount: async (id: number): Promise<ProductWithPriceAndDiscount> => {
    const response = await api.get<ApiResponse<ProductWithPriceAndDiscount>>(`/products/${id}/with-price-and-discount`);
    return response.data.data;
  },

  // Create a new product
  createProduct: async (productData: CreateProductData): Promise<Product> => {
    const payload = {
      name: productData.name,
      description: productData.description,
      minQuantity: Number(productData.minQuantity),
      maxQuantity: Number(productData.maxQuantity),
      supplierId: Number(productData.supplierId),
      purchasePrice: Number(productData.purchasePrice),
      sellingPrice: Number(productData.sellingPrice)
    };
    
    if (isNaN(payload.purchasePrice) || isNaN(payload.sellingPrice)) {
      throw new Error('Precio de compra y precio de venta deben ser valores numéricos');
    }
    
    const response = await api.post<ApiResponse<Product>>('/products', payload);
    return response.data.data;
  },

  // Create a new product with optional price and discount
  createProductWithPrice: async (productData: CreateProductWithPriceData): Promise<Product> => {
    const response = await api.post<ApiResponse<Product>>('/products/with-price', productData);
    return response.data.data;
  },

  // Update a product
  updateProduct: async (id: number, productData: Partial<Product>): Promise<Product> => {
    const response = await api.patch<ApiResponse<Product>>(`/products/${id}`, productData);
    return response.data.data;
  },

  // Deactivate a product (logical deletion)
  deactivateProduct: async (id: number): Promise<Product> => {
    const response = await api.delete<ApiResponse<Product>>(`/products/${id}`);
    return response.data.data;
  },

  // Activate a product
  activateProduct: async (id: number): Promise<Product> => {
    const response = await api.patch<ApiResponse<Product>>(`/products/${id}/activate`);
    return response.data.data;
  },

  // Manually adjust product stock
  adjustStock: async (id: number, adjustment: StockAdjustment): Promise<Product> => {
    const response = await api.patch<ApiResponse<Product>>(`/products/${id}/stock`, adjustment);
    return response.data.data;
  },

  // Get price history for a product
  getPriceHistory: async (productId: number): Promise<PriceHistory[]> => {
    const response = await api.get<ApiResponse<PriceHistory[]>>(`/products/${productId}/price-history`);
    return response.data.data;
  },

  // Price management methods
  createPrice: async (priceData: {
    purchasePrice: number;
    sellingPrice: number;
    isCurrentPrice: boolean;
    productId: number;
  }): Promise<Price> => {
    const response = await api.post<Price>('/prices', priceData);
    return response.data;
  },

  getCurrentPrice: async (productId: number): Promise<Price> => {
    const response = await api.get(`/prices/product/${productId}/current`);
    return response.data;
  },

  updatePrice: async (id: number, priceData: {
    purchasePrice?: number;
    sellingPrice?: number;
    isCurrentPrice?: boolean;
  }): Promise<Price> => {
    const response = await api.patch<Price>(`/prices/${id}`, priceData);
    return response.data;
  },

  // Reports
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