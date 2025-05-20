import api from '../../../utils/axiosConfig';

export type DiscountType = 'PERCENTAGE' | 'FIXED_AMOUNT';

export interface Discount {
  id: number;
  name: string;
  description: string;
  type: DiscountType;
  value: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  priceId: number;
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

export const discountService = {
  getDiscounts: async (
    page = 1,
    limit = 10,
    filters?: {
      name?: string;
      type?: DiscountType;
      isActive?: boolean;
      priceId?: number;
      startDateFrom?: string;
      startDateTo?: string;
      endDateFrom?: string;
      endDateTo?: string;
      isCurrentlyValid?: boolean;
    }
  ): Promise<PaginatedResponse<Discount>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(filters?.name && { name: filters.name }),
      ...(filters?.type && { type: filters.type }),
      ...(filters?.isActive !== undefined && { isActive: filters.isActive.toString() }),
      ...(filters?.priceId && { priceId: filters.priceId.toString() }),
      ...(filters?.startDateFrom && { startDateFrom: filters.startDateFrom }),
      ...(filters?.startDateTo && { startDateTo: filters.startDateTo }),
      ...(filters?.endDateFrom && { endDateFrom: filters.endDateFrom }),
      ...(filters?.endDateTo && { endDateTo: filters.endDateTo }),
      ...(filters?.isCurrentlyValid !== undefined && { isCurrentlyValid: filters.isCurrentlyValid.toString() }),
    });

    const response = await api.get<PaginatedResponse<Discount>>(`/discounts?${params}`);
    return response.data;
  },

  getDiscountById: async (id: number): Promise<Discount> => {
    const response = await api.get<{ data: Discount }>(`/discounts/${id}`);
    return response.data.data;
  },

  createDiscount: async (discountData: Omit<Discount, 'id' | 'createdAt' | 'updatedAt'>): Promise<Discount> => {
    const response = await api.post<{ data: Discount }>('/discounts', discountData);
    return response.data.data;
  },

  updateDiscount: async (id: number, discountData: Partial<Discount>): Promise<Discount> => {
    const response = await api.patch<{ data: Discount }>(`/discounts/${id}`, discountData);
    return response.data.data;
  },

  deleteDiscount: async (id: number): Promise<void> => {
    await api.delete(`/discounts/${id}`);
  },

  getCurrentDiscounts: async (priceId: number): Promise<Discount[]> => {
    const response = await api.get<{ data: Discount[] }>(`/discounts/price/${priceId}/current`);
    return response.data.data;
  },
};