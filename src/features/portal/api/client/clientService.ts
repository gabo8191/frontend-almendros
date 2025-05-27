import api from "../../../../utils/axiosConfig";

export interface Client {
  id: number;
  name: string;
  email: string;
  phoneNumber: string;
  address: string;
  documentType: string;
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

interface CreateClientData {
  name: string;
  email: string;
  phoneNumber: string;
  address: string;
  documentType: string;
  documentNumber: string;
}

export const clientService = {
  getClients: async (
    page = 1,
    limit = 10,
    filters?: {
      isActive?: boolean;
      search?: string;
    }
  ): Promise<PaginatedResponse<Client>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (filters?.isActive !== undefined) {
      params.append('isActive', filters.isActive.toString());
    }
    
    if (filters?.search) {
      params.append('name', filters.search);
    }
    
    const response = await api.get<PaginatedResponse<Client>>(`/clients?${params}`);
    return response.data;
  },

  getClientById: async (id: number): Promise<Client> => {
    const response = await api.get<{ message: string; client: Client }>(`/clients/${id}`);
    return response.data.client;
  },

  createClient: async (data: CreateClientData): Promise<Client> => {
    const cleanedData = {
      ...data,
      name: data.name?.trim(),
      email: data.email?.trim(),
      phoneNumber: data.phoneNumber?.trim(),
      address: data.address?.trim(),
      documentNumber: data.documentNumber?.trim()
    };
    
    const response = await api.post<{ message: string; client: Client }>('/clients', cleanedData);
    return response.data.client;
  },

  updateClient: async (id: number, data: Partial<CreateClientData>): Promise<Client> => {
    // Filter out undefined, null, and empty string values
    const cleanedData: Record<string, any> = {};
    
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (typeof value === 'string') {
          const trimmedValue = value.trim();
          // Only include non-empty strings
          if (trimmedValue.length > 0) {
            cleanedData[key] = trimmedValue;
          }
        } else {
          cleanedData[key] = value;
        }
      }
    });

    console.log('=== UPDATE CLIENT DEBUG ===');
    console.log('Client ID:', id);
    console.log('Original data received:', data);
    console.log('Cleaned data being sent:', cleanedData);
    console.log('Request URL:', `/clients/${id}`);
    console.log('=== END DEBUG ===');
    
    try {
      const response = await api.patch<{ message: string; client: Client }>(`/clients/${id}`, cleanedData);
      console.log('=== SUCCESS RESPONSE ===');
      console.log('Response data:', response.data);
      console.log('=== END SUCCESS ===');
      return response.data.client;
    } catch (error: any) {
      console.log('=== ERROR RESPONSE ===');
      console.log('Error object:', error);
      console.log('Error response:', error.response);
      console.log('Error response data:', error.response?.data);
      console.log('Error response status:', error.response?.status);
      console.log('Error response statusText:', error.response?.statusText);
      console.log('Error request config:', error.config);
      console.log('=== END ERROR ===');
      throw error;
    }
  },

  deactivateClient: async (id: number): Promise<Client> => {
    console.log('=== DEACTIVATE CLIENT DEBUG ===');
    console.log('Deactivating client with ID:', id);
    console.log('Request URL:', `/clients/${id}`);
    console.log('Request Method: DELETE');
    console.log('=== END DEACTIVATE DEBUG ===');
    
    try {
      const response = await api.delete<{ message: string; client: Client }>(`/clients/${id}`);
      console.log('=== DEACTIVATE SUCCESS ===');
      console.log('Response data:', response.data);
      console.log('=== END DEACTIVATE SUCCESS ===');
      return response.data.client;
    } catch (error: any) {
      console.log('=== DEACTIVATE ERROR ===');
      console.log('Error object:', error);
      console.log('Error response:', error.response);
      console.log('Error response data:', error.response?.data);
      console.log('Error response status:', error.response?.status);
      console.log('Error response headers:', error.response?.headers);
      console.log('Request headers:', error.config?.headers);
      console.log('=== END DEACTIVATE ERROR ===');
      throw error;
    }
  },

  activateClient: async (id: number): Promise<Client> => {
    console.log('=== ACTIVATE CLIENT DEBUG ===');
    console.log('Activating client with ID:', id);
    console.log('Request URL:', `/clients/${id}/activate`);
    console.log('Request Method: PATCH');
    console.log('=== END ACTIVATE DEBUG ===');
    
    try {
      const response = await api.patch<{ message: string; client: Client }>(`/clients/${id}/activate`);
      console.log('=== ACTIVATE SUCCESS ===');
      console.log('Response data:', response.data);
      console.log('=== END ACTIVATE SUCCESS ===');
      return response.data.client;
    } catch (error: any) {
      console.log('=== ACTIVATE ERROR ===');
      console.log('Error object:', error);
      console.log('Error response:', error.response);
      console.log('Error response data:', error.response?.data);
      console.log('Error response status:', error.response?.status);
      console.log('Error response headers:', error.response?.headers);
      console.log('Request headers:', error.config?.headers);
      console.log('=== END ACTIVATE ERROR ===');
      throw error;
    }
  },

  toggleClientStatus: async (id: number, isActive: boolean): Promise<Client> => {
    console.log('=== TOGGLE CLIENT STATUS DEBUG ===');
    console.log('Client ID:', id);
    console.log('Target isActive:', isActive);
    console.log('Action:', isActive ? 'Activate' : 'Deactivate');
    console.log('=== END TOGGLE DEBUG ===');
    
    try {
      let result: Client;
      
      if (isActive) {
        result = await clientService.activateClient(id);
      } else {
        result = await clientService.deactivateClient(id);
      }
      
      console.log('=== TOGGLE SUCCESS ===');
      console.log('Final result:', result);
      console.log('=== END TOGGLE SUCCESS ===');
      
      return result;
    } catch (error: any) {
      console.log('=== TOGGLE ERROR ===');
      console.log('Toggle failed for client ID:', id);
      console.log('Attempted action:', isActive ? 'Activate' : 'Deactivate');
      console.log('Error:', error);
      console.log('=== END TOGGLE ERROR ===');
      throw error;
    }
  },
};
