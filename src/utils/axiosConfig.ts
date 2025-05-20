import axios, { InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

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
    
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
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
    
    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Clear token and redirect to login if unauthorized
      localStorage.removeItem('token');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
    
    // Handle 403 Forbidden errors
    if (error.response?.status === 403) {
      console.error('Permiso denegado');
    }
    
    // Handle network errors
    if (!error.response) {
      console.error('Error de red - por favor revise su conexión');
    }
    
    return Promise.reject(error);
  }
);

export default api;