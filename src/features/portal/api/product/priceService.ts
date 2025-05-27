import api from '../../../../utils/axiosConfig';
import { Price, PriceHistory, ApiResponse } from './types';

export const priceService = {
  createPrice: async (priceData: {
    purchasePrice: number;
    sellingPrice: number;
    isCurrentPrice: boolean;
    productId: number;
  }): Promise<Price> => {
    const response = await api.post<ApiResponse<Price>>('/prices', priceData);
    return response.data.data;
  },

  getCurrentPrice: async (productId: number): Promise<Price> => {
    const response = await api.get<ApiResponse<Price>>(`/prices/product/${productId}/current`);
    return response.data.data;
  },

  updatePrice: async (id: number, priceData: {
    purchasePrice?: number;
    sellingPrice?: number;
    isCurrentPrice?: boolean;
  }): Promise<Price> => {
    const response = await api.patch<ApiResponse<Price>>(`/prices/${id}`, priceData);
    return response.data.data;
  },

  getPriceHistory: async (productId: number): Promise<PriceHistory[]> => {
    const response = await api.get<ApiResponse<PriceHistory[]>>(`/products/${productId}/price-history`);
    return response.data.data;
  },
};
