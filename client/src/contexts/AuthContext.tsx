import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { authAPI } from '../services/api';
import type { User, LoginCredentials, RegisterCredentials } from '../types/auth';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  register: (credentials: RegisterCredentials) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Ellenőrizzük a token érvényességét az oldal betöltésekor
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await authAPI.getProfile();
        setUser(response.data);
        setToken(storedToken);
      } catch (error) {
        console.error('Hiba az autentikáció ellenőrzésekor:', error);
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Bejelentkezési függvény
  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authAPI.login(credentials);
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      setToken(token);
      setUser(user);
      
      return { success: true };
    } catch (error: any) {
      console.error('Bejelentkezési hiba:', error);
      const errorMessage = error.response?.data?.message || 'Hibás email cím vagy jelszó.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    setIsLoading(true);
    setError(null);
    try {
      await authAPI.register(credentials);
      return { success: true };
    } catch (error: any) {
      console.error('Regisztrációs hiba:', error);
      const errorMessage = error.response?.data?.message || 'Hiba történt a regisztráció során.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  }, []);

  // Hibaüzenet törlése
  const clearError = () => {
    setError(null);
  };

  // A context értéke
  const value = {
    user,
    token,
    isAuthenticated: !!token,
    isLoading,
    error,
    login,
    register,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook a context használatához
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth hook-ot AuthProvider-en belül kell használni');
  }
  return context;
};
