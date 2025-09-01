import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { getToken, clearToken } from '../lib/auth';

export function useSession() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const queryClient = useQueryClient();

  const checkAuthStatus = async () => {
    try {
      const token = await getToken();
      const isAuth = !!token;

      setIsAuthenticated(isAuth);
      return isAuth;
    } catch (error) {
      console.error('Error checking auth status:', error);
      setIsAuthenticated(false);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await clearToken();
      queryClient.invalidateQueries({ queryKey: ['auth'] });
      queryClient.removeQueries({ queryKey: ['auth'] });
      setIsAuthenticated(false);
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  useEffect(() => {
    // Delay auth check slightly to avoid SSR/hydration issues
    const timer = setTimeout(() => {
      checkAuthStatus();
    }, 200); // Increased delay
    return () => clearTimeout(timer);
  }, []);

  return {
    isLoading,
    isAuthenticated,
    useToken: () => isAuthenticated,
    logout,
    refreshAuth: checkAuthStatus,
  };
}
