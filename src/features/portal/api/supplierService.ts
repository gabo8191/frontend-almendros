import api from '../../../utils/axiosConfig';

export interface Supplier {
  id: number;
  name: string;
  contactName: string;
  email: string;
  phoneNumber: string;
  address: string;
  documentType: 'CC' | 'TI';
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
  documentType: 'CC' | 'TI';
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
      
      console.log(`Fetching suppliers with params: ${params.toString()}`);
      const response = await api.get<PaginatedResponse<Supplier>>(`/suppliers?${params}`);
      return response.data;
    } catch (error) {
      console.error('API error in getSuppliers:', error);
      
      if (error.response) {
        console.error('Error response:', error.response.status, error.response.data);
      }
      
      throw error;
    }
  },
  
  getSupplierById: async (id: number): Promise<Supplier> => {
    try {
      console.log(`Fetching supplier with id: ${id}`);
      const response = await api.get<{ message: string; data: Supplier }>(`/suppliers/${id}`);
      return response.data.data;
    } catch (error) {
      console.error(`API error in getSupplierById(${id}):`, error);
      
      if (error.response) {
        console.error('Error response:', error.response.status, error.response.data);
      }
      
      throw error;
    }
  },
  
  createSupplier: async (supplierData: CreateSupplierData): Promise<Supplier> => {
    try {
      console.log('Creating supplier with data:', JSON.stringify(supplierData, null, 2));
      
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
      console.log('Supplier created successfully:', response.data);
      return response.data.data;
    } catch (error) {
      console.error('API error in createSupplier:', error);
      
      if (error.response) {
        console.error('Error response status:', error.response.status);
        console.error('Error response data:', error.response.data);
        console.error('Request that caused the error:', error.config);
      }
      
      throw error;
    }
  },
  
  updateSupplier: async (id: number, supplierData: Partial<CreateSupplierData>): Promise<Supplier> => {
    try {
      console.log(`Updating supplier ${id} with data:`, JSON.stringify(supplierData, null, 2));
      
      const cleanedData = { ...supplierData };
      Object.keys(cleanedData).forEach(key => {
        if (typeof cleanedData[key] === 'string') {
          cleanedData[key] = cleanedData[key].trim();
        }
      });
      
      const response = await api.put<{ message: string; data: Supplier }>(`/suppliers/${id}`, cleanedData);
      console.log('Supplier updated successfully:', response.data);
      return response.data.data;
    } catch (error) {
      console.error(`API error in updateSupplier(${id}):`, error);
      
      if (error.response) {
        console.error('Error response:', error.response.status, error.response.data);
      }
      
      throw error;
    }
  },
  
  deactivateSupplier: async (id: number): Promise<void> => {
    try {
      console.log(`Deactivating supplier ${id}`);
      await api.delete(`/suppliers/${id}`);
      console.log(`Supplier ${id} deactivated successfully`);
    } catch (error) {
      console.error(`API error in deactivateSupplier(${id}):`, error);
      
      if (error.response) {
        console.error('Error response:', error.response.status, error.response.data);
      }
      
      throw error;
    }
  },
  
  activateSupplier: async (id: number): Promise<void> => {
    try {
      console.log(`Activating supplier ${id}`);
      await api.put(`/suppliers/${id}/activate`);
      console.log(`Supplier ${id} activated successfully`);
    } catch (error) {
      console.error(`API error in activateSupplier(${id}):`, error);
      
      if (error.response) {
        console.error('Error response:', error.response.status, error.response.data);
      }
      
      throw error;
    }
  },
};