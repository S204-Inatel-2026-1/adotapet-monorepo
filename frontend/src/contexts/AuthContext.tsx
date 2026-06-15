'use client';

// src/contexts/AuthContext.tsx
// EXPANDIDO: adicionado role, name e avatar para o Layout Privado funcionar
//Devemos conectar esses dados ao retorno real da API de login

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

//Tipos

export type UserRole = 'adopter' | 'ong';

export interface AuthUser {
  id: string | number;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string; // URL da foto de perfil (opcional)
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: AuthUser | null;
  login: (token: string, userData: AuthUser) => void;
  logout: () => void;
  loading: boolean;
}

//Contexto

const AuthContext = createContext<AuthContextType | undefined>(undefined);

//Provider

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<{
    isAuthenticated: boolean;
    user: AuthUser | null;
    loading: boolean;
  }>({
    isAuthenticated: false,
    user: null,
    loading: true,
  });

  useEffect(() => {
    const initializeAuth = async () => {
      // Verifica token e dados do usuário no localStorage ao carregar
      const token = localStorage.getItem('adotapet_token');
      const storedUser = localStorage.getItem('adotapet_user');

      if (token && storedUser) {
        try {
          setAuthState({
            isAuthenticated: true,
            user: JSON.parse(storedUser),
            loading: false,
          });
          return;
        } catch {
          // Dados corrompidos — limpa tudo
          localStorage.removeItem('adotapet_token');
          localStorage.removeItem('adotapet_user');
          document.cookie = 'adotapet_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        }
      }
      setAuthState(prev => ({ ...prev, loading: false }));
    };

    initializeAuth();
  }, []);

  const login = (token: string, userData: AuthUser) => {
    localStorage.setItem('adotapet_token', token);
    localStorage.setItem('adotapet_user', JSON.stringify(userData));
    
    // Define cookie para o middleware funcionar (expira em 7 dias)
    document.cookie = `adotapet_token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;

    setAuthState({
      isAuthenticated: true,
      user: userData,
      loading: false,
    });
  };

  const logout = () => {
    localStorage.removeItem('adotapet_token');
    localStorage.removeItem('adotapet_user');
    
    // Remove cookie
    document.cookie = 'adotapet_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';

    setAuthState({
      isAuthenticated: false,
      user: null,
      loading: false,
    });
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated: authState.isAuthenticated, 
      user: authState.user, 
      login, 
      logout, 
      loading: authState.loading 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}