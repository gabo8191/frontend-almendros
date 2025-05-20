import api from '../../../utils/axiosConfig';
import { AuthResponse, LoginCredentials, RegisterData } from '../types';

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>('/auth/login', {
        email: credentials.email,
        password: credentials.password
      });
      
      if (response.data.token) {
        // Store the token in localStorage
        localStorage.setItem('token', response.data.token);
        return response.data;
      }
      
      throw new Error('No token received from server');
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Credenciales inválidas');
      }
      throw error;
    }
  },
  
  signup: async (userData: RegisterData): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>('/auth/signup', userData);
      
      if (response.data.token) {
        // Store the token in localStorage
        localStorage.setItem('token', response.data.token);
        return response.data;
      }
      
      throw new Error('No token received from server');
    } catch (error: any) {
      if (error.response?.status === 409) {
        throw new Error('El correo electrónico ya está registrado');
      }
      throw error;
    }
  },
  
  logout: (): void => {
    localStorage.removeItem('token');
  },
  
  getCurrentUserRole: async (): Promise<{ role: string }> => {
    const response = await api.get<{ role: string }>('/auth/role');
    return response.data;
  },
  
  getToken: (): string | null => {
    return localStorage.getItem('token');
  },
  
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('token');
  }
};