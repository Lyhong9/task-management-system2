import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from local token
  useEffect(() => {
    const initializeAuth = async () => {
      const token = api.getAuthToken();
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.getMe();
        if (response.success && response.user) {
          setUser(response.user);
        } else {
          api.setAuthToken(null);
        }
      } catch (err) {
        console.warn('Session expired or invalid:', err.message);
        api.setAuthToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await api.login({ email, password });
    if (res.success && res.token) {
      api.setAuthToken(res.token);
      setUser(res.user);
    }
    return res;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const res = await api.register({ name, email, password });
    if (res.success && res.token) {
      api.setAuthToken(res.token);
      setUser(res.user);
    }
    return res;
  }, []);

  const logout = useCallback(() => {
    api.setAuthToken(null);
    setUser(null);
    queryClient.clear();
  }, [queryClient]);

  const value = {
    user,
    token: api.getAuthToken(),
    isAuthenticated: !!user,
    loading,
    login,
    register,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
