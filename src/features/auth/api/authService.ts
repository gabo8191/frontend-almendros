import api from '../../../utils/axiosConfig';
import { AuthResponse, LoginCredentials, RegisterData } from '../types';
import { isTokenExpired, getTokenTimeRemaining, formatTimeRemaining, decodeToken } from '../../../utils/tokenUtils';

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
    localStorage.removeItem('almendros_user');
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
  },

  /**
   * Verifica si el token actual es válido (existe y no está expirado)
   */
  isTokenValid: (): boolean => {
    const token = localStorage.getItem('token');
    if (!token) return false;
    
    return !isTokenExpired(token);
  },

  /**
   * Obtiene información detallada del token actual
   */
  getTokenInfo: () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    const timeRemaining = getTokenTimeRemaining(token);
    
    return {
      isValid: !isTokenExpired(token),
      timeRemaining,
      formattedTime: formatTimeRemaining(timeRemaining),
      payload: decodeToken(token),
      isExpiringSoon: timeRemaining <= 300 // Expira en menos de 5 minutos
    };
  },

  /**
   * Limpia todos los datos de autenticación
   */
  clearAuthData: (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('almendros_user');
  },

  /**
   * Verifica si el usuario actual tiene un rol específico
   */
  hasRole: (requiredRole: string): boolean => {
    const token = localStorage.getItem('token');
    if (!token || isTokenExpired(token)) return false;
    
    const payload = decodeToken(token);
    return payload?.role === requiredRole;
  },

  /**
   * Obtiene el ID del usuario actual desde el token
   */
  getCurrentUserId: (): number | null => {
    const token = localStorage.getItem('token');
    if (!token || isTokenExpired(token)) return null;
    
    const payload = decodeToken(token);
    return payload?.userId || null;
  }
};
