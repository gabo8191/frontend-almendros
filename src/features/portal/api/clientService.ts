import api from '../../../utils/axiosConfig';

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
  getClients: async (page = 1, limit = 10): Promise<PaginatedResponse<Client>> => {
    const response = await api.get<PaginatedResponse<Client>>(`/clients?page=${page}&limit=${limit}`);
    return response.data;
  },

  getClientById: async (id: number): Promise<Client> => {
    const response = await api.get<{ message: string; client: Client }>(`/clients/${id}`);
    return response.data.client;
  },

  createClient: async (data: CreateClientData): Promise<Client> => {
    const response = await api.post<{ message: string; client: Client }>('/clients', data);
    return response.data.client;
  },

  updateClient: async (id: number, data: Partial<CreateClientData>): Promise<Client> => {
    const response = await api.patch<{ message: string; client: Client }>(`/clients/${id}`, data);
    return response.data.client;
  },

  toggleClientStatus: async (id: number, isActive: boolean): Promise<Client> => {
    if (!isActive) {
      const response = await api.delete<{ message: string; client: Client }>(`/clients/${id}`);
      return response.data.client;
    } else {
      // For reactivation, we'll use the update endpoint since there's no specific reactivation endpoint
      const response = await api.patch<{ message: string; client: Client }>(`/clients/${id}`, { isActive: true });
      return response.data.client;
    }
  },
};