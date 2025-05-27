import api from '../../../../utils/axiosConfig';
import { Product, ProductWithPriceAndDiscount, CreateProductData, CreateProductWithPriceData, ProductFilters, StockAdjustment, PaginatedResponse, ApiResponse } from './types';

const buildParams = (obj: Record<string, any>) => {
  const params = new URLSearchParams();
  Object.entries(obj).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      params.append(key, String(value));
    }
  });
  return params.toString();
};

export const productService = {
  getProducts: async (page = 1, limit = 10, filters?: ProductFilters): Promise<PaginatedResponse<Product>> => {
    const query = buildParams({ page, limit, ...filters });
    const response = await api.get<PaginatedResponse<Product>>(`/products?${query}`);
    return response.data;
  },

  getLowStockProducts: async (): Promise<Product[]> => {
    const response = await api.get<ApiResponse<Product[]>>('/products/low-stock');
    return response.data.data;
  },

  getProductById: async (id: number): Promise<Product> => {
    const response = await api.get<ApiResponse<Product>>(`/products/${id}`);
    return response.data.data;
  },

  getProductWithPriceAndDiscount: async (id: number): Promise<ProductWithPriceAndDiscount> => {
    const response = await api.get<ApiResponse<ProductWithPriceAndDiscount>>(`/products/${id}/with-price-and-discount`);
    return response.data.data;
  },

  createProduct: async (productData: CreateProductData): Promise<Product> => {
    const payload = {
      ...productData,
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

  createProductWithPrice: async (productData: CreateProductWithPriceData): Promise<Product> => {
    const response = await api.post<ApiResponse<Product>>('/products/with-price', productData);
    return response.data.data;
  },

  updateProduct: async (id: number, productData: Partial<Product>): Promise<Product> => {
    const response = await api.patch<ApiResponse<Product>>(`/products/${id}`, productData);
    return response.data.data;
  },

  deactivateProduct: async (id: number): Promise<Product> => {
    const response = await api.delete<ApiResponse<Product>>(`/products/${id}`);
    return response.data.data;
  },

  activateProduct: async (id: number): Promise<Product> => {
    const response = await api.patch<ApiResponse<Product>>(`/products/${id}/activate`);
    return response.data.data;
  },

  adjustStock: async (id: number, adjustment: StockAdjustment): Promise<Product> => {
    const response = await api.patch<ApiResponse<Product>>(`/products/${id}/stock`, adjustment);
    return response.data.data;
  },
};
