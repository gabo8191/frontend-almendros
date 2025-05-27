import api from '../../../../utils/axiosConfig';

export interface Supplier {
  id: number;
  name: string;
  contactName: string;
  email: string;
  phoneNumber: string;
  address: string;
  documentType: 'NIT' | 'CC' | 'CE' | 'PP' | 'TI';
  documentNumber: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PaginatedResponse<T> {
  message: string;
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

interface CreateSupplierData {
  name: string;
  contactName: string;
  email: string;
  phoneNumber: string;
  address: string;
  documentType: 'NIT' | 'CC' | 'CE' | 'PP' | 'TI';
  documentNumber: string;
}

export const supplierService = {
  getSuppliers: async (
    page = 1,
    limit = 10,
    filters?: {
      isActive?: boolean;
      search?: string;
    }
  ): Promise<PaginatedResponse<Supplier>> => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(filters?.isActive !== undefined && { isActive: filters.isActive.toString() }),
        ...(filters?.search && { search: filters.search }),
      });
      
      const response = await api.get<PaginatedResponse<Supplier>>(`/suppliers?${params}`);
      return response.data;
    } catch (error: any) {
      // if (error.response) {
      // }
      
      throw error;
    }
  },
  
  getSupplierById: async (id: number): Promise<Supplier> => {
    try {
      const response = await api.get<{ message: string; data: Supplier }>(`/suppliers/${id}`);
      return response.data.data;
    } catch (error: any) {
      // if (error.response) {
      // }
      
      throw error;
    }
  },
  
  createSupplier: async (supplierData: CreateSupplierData): Promise<Supplier> => {
    try {
      const cleanedData = {
        ...supplierData,
        name: supplierData.name?.trim(),
        contactName: supplierData.contactName?.trim(),
        email: supplierData.email?.trim(),
        phoneNumber: supplierData.phoneNumber?.trim(),
        address: supplierData.address?.trim(),
        documentNumber: supplierData.documentNumber?.trim()
      };
      
      const response = await api.post<{ message: string; data: Supplier }>('/suppliers', cleanedData);
      return response.data.data;
    } catch (error: any) {
      // if (error.response) {
      // }
      
      throw error;
    }
  },
  
  updateSupplier: async (id: number, supplierData: Partial<CreateSupplierData>): Promise<Supplier> => {
    try {
      const cleanedData: Partial<CreateSupplierData> = { ...supplierData };
      (Object.keys(cleanedData) as Array<keyof CreateSupplierData>).forEach(key => {
        if (typeof cleanedData[key] === 'string') {
          const value = cleanedData[key] as string;
          (cleanedData[key] as any) = value.trim();
        }
      });
      
      const response = await api.put<{ message: string; data: Supplier }>(`/suppliers/${id}`, cleanedData);
      return response.data.data;
    } catch (error: any) {
      // if (error.response) {
      // }
      
      throw error;
    }
  },
  
  deactivateSupplier: async (id: number): Promise<void> => {
    try {
      await api.delete(`/suppliers/${id}`);
    } catch (error: any) {
      // if (error.response) {
      // }
      
      throw error;
    }
  },
  
  activateSupplier: async (id: number): Promise<void> => {
    try {
      await api.patch(`/suppliers/${id}/activate`);
    } catch (error: any) {
      // if (error.response) {
      // }
      
      throw error;
    }
  },
};
