import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../api/authService';
import { User, Role } from '../types';
import { useToast } from '../../../shared/context/ToastContext';

export interface AuthContextProps {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    phoneNumber?: string,
    address?: string
  ) => Promise<void>;
  logout: () => void;
}

const USER_STORAGE_KEY = 'almendros_user';
const TOKEN_STORAGE_KEY = 'token';

/**
 * Helper for localStorage operations
 */
const authStorage = {
  getUser: (): User | null => {
    try {
      const stored = localStorage.getItem(USER_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },
  setUser: (user: User) => {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  },
  getToken: () => localStorage.getItem(TOKEN_STORAGE_KEY),
  setToken: (token: string) => {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  },
  clear: () => {
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  }
};

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const { showToast } = useToast();

  /**
   * Clear all authentication data
   */
  const clearAuthData = () => {
    authStorage.clear();
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  /**
   * Set authenticated user data
   */
  const setAuthenticatedUser = (userData: User, token?: string) => {
    setUser(userData);
    setIsAuthenticated(true);
    authStorage.setUser(userData);
    
    if (token) {
      authStorage.setToken(token);
    }
  };

  /**
   * Initialize authentication state from stored data
   */
  const initializeAuth = () => {
    const token = authService.getToken();
    const storedUser = authStorage.getUser();

    if (token && storedUser) {
      if (storedUser.isActive) {
        authStorage.setToken(token);
        setAuthenticatedUser(storedUser);
      } else {
        clearAuthData();
        showToast('error', 'Tu cuenta está desactivada. Contacta al administrador.');
      }
    } else {
      clearAuthData();
    }
    
    setIsLoading(false);
  };

  /**
   * Load user data on component mount
   */
  useEffect(() => {
    initializeAuth();
  }, []);

  /**
   * Authenticate user with email and password
   */
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authService.login({ email, password });
      
      if (!response.user.isActive) {
        throw new Error('Tu cuenta está desactivada. Contacta al administrador.');
      }
      
      setAuthenticatedUser(response.user, response.token);
      showToast('success', '¡Inicio de sesión exitoso!');
      
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Error al iniciar sesión';
      showToast('error', errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Register new user account
   */
  const register = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    phoneNumber?: string,
    address?: string
  ) => {
    setIsLoading(true);
    try {
      const response = await authService.signup({
        email,
        password,
        firstName,
        lastName,
        role: Role.SALESPERSON,
        phoneNumber,
        address,
      });
      
      setAuthenticatedUser(response.user, response.token);
      showToast('success', '¡Cuenta creada exitosamente!');
      
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al registrarse';
      showToast('error', errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Log out current user
   */
  const logout = () => {
    clearAuthData();
    showToast('info', 'Has cerrado sesión');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextProps => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};