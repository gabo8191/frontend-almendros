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
  // ✅ AÑADIR: Array de precios dinámicos (opcional)
  prices?: Array<{
    id: number;
    purchasePrice: number;
    sellingPrice: number;
    isCurrentPrice: boolean;
  }>;
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
  
  export interface PaginatedResponse<T> {
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
  
  export interface ApiResponse<T> {
    data: T;
  }
  