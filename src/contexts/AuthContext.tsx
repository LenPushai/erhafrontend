// AuthContext.tsx - Self-contained with all types
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define all types locally
interface LoginRequest {
  username: string;
  password: string;
}

interface AuthResponse {
  token: string;
  username: string;
  roles: string[];
}

interface User {
  username: string;
  roles: string[];
  token: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  hasRole: (role: string) => boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

// Inline auth service
const API_BASE_URL = 'http://localhost:8080';

const authService = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    // FIXED: Changed to testlogin endpoint and fixed syntax
    const response = await fetch(`${API_BASE_URL}/api/auth/testlogin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Login failed');
    }

    const data = await response.json();

    // Handle testlogin response format
    return {
      token: data.token || 'test-token',
      username: data.username || credentials.username,
      roles: data.roles || ['USER']
    };
  },

  saveUser(authResponse: AuthResponse): void {
    const user: User = {
      username: authResponse.username,
      roles: authResponse.roles,
      token: authResponse.token,
    };
    localStorage.setItem('user', JSON.stringify(user));
  },

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch (error) {
      return null;
    }
  },

  logout(): void {
    localStorage.removeItem('user');
  },
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    const response = await authService.login({ username, password });
    authService.saveUser(response);
    setUser({
      username: response.username,
      roles: response.roles,
      token: response.token,
    });
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const hasRole = (role: string): boolean => {
    if (!user) return false;
    return user.roles.includes(role);
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    hasRole,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};