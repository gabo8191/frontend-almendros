import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../api/authService';
import { User, Role } from '../types';
import { useToast } from '../../../shared/context/ToastContext';

interface AuthContextProps {
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

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const { showToast } = useToast();

  // Load user from localStorage on mount
  useEffect(() => {
    const initializeAuth = () => {
      console.log('🔍 Initializing auth...');
      
      const token = authService.getToken();
      const storedUser = localStorage.getItem(USER_STORAGE_KEY);

      console.log('📊 Auth Debug:', {
        hasToken: !!token,
        hasStoredUser: !!storedUser,
        token: token ? `${token.substring(0, 20)}...` : 'None'
      });

      if (token && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          
          // Ensure token is also stored separately for axios
          localStorage.setItem(TOKEN_STORAGE_KEY, token);
          
          // Only set the user as authenticated if they are active
          if (parsedUser.isActive) {
            setUser(parsedUser);
            setIsAuthenticated(true);
            console.log('✅ User authenticated:', parsedUser.email);
          } else {
            // Clear stored data if user is inactive
            console.log('❌ User account is inactive');
            localStorage.removeItem(USER_STORAGE_KEY);
            localStorage.removeItem(TOKEN_STORAGE_KEY);
            authService.logout();
            showToast('error', 'Tu cuenta está desactivada. Contacta al administrador.');
          }
        } catch (error) {
          console.error('❌ Error parsing stored user:', error);
          // Clear invalid data
          localStorage.removeItem(USER_STORAGE_KEY);
          localStorage.removeItem(TOKEN_STORAGE_KEY);
          authService.logout();
        }
      } else {
        console.log('❌ No valid auth data found');
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      console.log('🔑 Attempting login for:', email);
      const response = await authService.login({ email, password });
      
      console.log('📨 Login response:', response);
      
      // Check if the user is active before allowing login
      if (!response.user.isActive) {
        throw new Error('Tu cuenta está desactivada. Contacta al administrador.');
      }
      
      // Store both user data and token
      setUser(response.user);
      setIsAuthenticated(true);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(response.user));
      
      // Store token separately for axios to use
      if (response.token) {
        localStorage.setItem(TOKEN_STORAGE_KEY, response.token);
        console.log('💾 Token stored successfully');
      } else {
        console.warn('⚠️ No token in login response');
      }
      
      console.log('✅ Login successful');
      showToast('success', '¡Inicio de sesión exitoso!');
    } catch (error: any) {
      console.error('❌ Login error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Error al iniciar sesión';
      showToast('error', errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

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
      console.log('📝 Attempting registration for:', email);
      const response = await authService.signup({
        email,
        password,
        firstName,
        lastName,
        role: Role.SALESPERSON,
        phoneNumber,
        address,
      });
      
      console.log('📨 Registration response:', response);
      
      setUser(response.user);
      setIsAuthenticated(true);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(response.user));
      
      // Store token separately for axios to use
      if (response.token) {
        localStorage.setItem(TOKEN_STORAGE_KEY, response.token);
        console.log('💾 Token stored successfully');
      } else {
        console.warn('⚠️ No token in registration response');
      }
      
      console.log('✅ Registration successful');
      showToast('success', '¡Cuenta creada exitosamente!');
    } catch (error: any) {
      console.error('❌ Registration error:', error);
      const errorMessage = error.response?.data?.message || 'Error al registrarse';
      showToast('error', errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    console.log('🚪 Logging out...');
    authService.logout();
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setUser(null);
    setIsAuthenticated(false);
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