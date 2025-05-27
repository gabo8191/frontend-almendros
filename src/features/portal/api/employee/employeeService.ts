import api from '../../../../utils/axiosConfig';
import {User , Role} from '../../../auth/types';


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

interface CreateEmployeeData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: Role;
  phoneNumber?: string;
  address?: string;
}

export const employeeService = {
  getEmployees: async (page = 1, limit = 10): Promise<PaginatedResponse<User>> => {
    const response = await api.get<PaginatedResponse<User>>(`/auth/users?page=${page}&limit=${limit}`);
    return response.data;
  },

  getEmployeeById: async (id: string): Promise<User> => {
    const response = await api.get<{ message: string; user: User }>(`/auth/users/${id}`);
    return response.data.user;
  },

  createEmployee: async (data: CreateEmployeeData): Promise<User> => {
    const response = await api.post<{ message: string; user: User }>('/auth/signup', data);
    return response.data.user;
  },

  updateEmployee: async (id: string, data: Partial<User>): Promise<User> => {
    const response = await api.patch<{ message: string; user: User }>(`/auth/users/${id}`, data);
    return response.data.user;
  },

  toggleEmployeeStatus: async (id: string, isActive: boolean): Promise<User> => {
    if (isActive) {
      // ✅ Corregido: usar POST en lugar de PATCH para activación
      const response = await api.post<{ message: string; user: User }>(`/auth/users/${id}/activate`);
      return response.data.user;
    } else {
      // ✅ Mantener DELETE para desactivación
      const response = await api.delete<{ message: string; user: User }>(`/auth/users/${id}`);
      return response.data.user;
    }
  },
};