import axios, { InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { isTokenExpired } from './tokenUtils';

// Base URL for the API
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Create an axios instance
const api = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const token = localStorage.getItem('token');
    
    // Solo añadir token si existe y NO está expirado
    if (token && !isTokenExpired(token)) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    } else if (token && isTokenExpired(token)) {
      // Si el token está expirado, limpiarlo automáticamente
      localStorage.removeItem('token');
      localStorage.removeItem('almendros_user');
    }
    
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    // Handle 401 Unauthorized errors (token expirado/inválido)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Limpiar TODOS los datos de autenticación
      localStorage.removeItem('token');
      localStorage.removeItem('almendros_user');
      
      // Redirigir a login solo si no estamos ya ahí
      if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
        window.location.href = '/login';
      }
      
      return Promise.reject(error);
    }
    
    // Handle 403 Forbidden errors
    if (error.response?.status === 403) {
      console.error('Permiso denegado - No tienes autorización para esta acción');
    }
    
    // Handle network errors
    if (!error.response) {
      console.error('Error de red - por favor revise su conexión a internet');
    }
    
    // Handle 500 Internal Server Error
    if (error.response?.status === 500) {
      console.error('Error interno del servidor - intente nuevamente más tarde');
    }
    
    return Promise.reject(error);
  }
);

export default api;
