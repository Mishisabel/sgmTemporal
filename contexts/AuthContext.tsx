import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { User } from '@/types';
import { apiService } from '@/services/apiService';

const AUTH_STORAGE_KEY = '@maintenance_system_user';

export const [AuthContext, useAuth] = createContextHook(() => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  useEffect(() => {
    loadStoredUser();
  }, []);

  const loadStoredUser = async () => {
    try {
      const storedUser = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      if (storedUser) {
        setCurrentUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Error loading stored user:', error);
    } finally {
      setIsLoading(false);
      setIsInitialized(true);
    }
  };

  const login = useCallback(async (email: string, password: string): Promise<void> => {
    try {
      const user = await apiService.login(email, password);
      setCurrentUser(user);
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    try {
      setCurrentUser(null);
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, []);

  const hasRole = useCallback((roles: string[]): boolean => {
    if (!currentUser) return false;
    return roles.includes(currentUser.rol);
  }, [currentUser]);

  const canAccess = useCallback((feature: string): boolean => {
    if (!currentUser) return false;

    const permissions: Record<string, string[]> = {
      'machinery.create': ['Analista', 'Coordinador'],
      'machinery.edit': ['Analista', 'Coordinador'],
      'machinery.delete': ['Coordinador'],
      'workorder.create': ['Analista', 'Coordinador'],
      'workorder.edit': ['Analista', 'Coordinador'],
      'workorder.validate': ['Analista'],
      'inventory.edit': ['Coordinador'],
      'inventory.view': ['Analista', 'Coordinador', 'Gerencia'],
      'reports.view': ['Analista', 'Coordinador', 'Gerencia'],
      'horometro.update': ['Operador'],
      'incidencia.report': ['Operador'],
    };

    const allowedRoles = permissions[feature] || [];
    return allowedRoles.includes(currentUser.rol);
  }, [currentUser]);

  return useMemo(() => ({
    currentUser,
    isLoading,
    isInitialized,
    isAuthenticated: !!currentUser,
    login,
    logout,
    hasRole,
    canAccess,
  }), [currentUser, isLoading, isInitialized, login, logout, hasRole, canAccess]);
});
