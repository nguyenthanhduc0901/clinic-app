import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// NOTE: '/' is not allowed in SecureStore keys. Use a valid key and migrate from legacy.
const AUTH_TOKEN_KEY = 'auth.token';
const LEGACY_TOKEN_KEYS = ['auth/token'];

export const getToken = async (): Promise<string | null> => {
  try {
    // Prefer SecureStore when available (native). Fallback to AsyncStorage on web.
    const canUseSecureStore = Platform.OS !== 'web' && (await SecureStore.isAvailableAsync());

    // Try current key first
    const current = canUseSecureStore
      ? await SecureStore.getItemAsync(AUTH_TOKEN_KEY)
      : await AsyncStorage.getItem(AUTH_TOKEN_KEY);

    if (current) return current;

    // Attempt migration from any legacy keys
    for (const legacyKey of LEGACY_TOKEN_KEYS) {
      try {
        const legacyValue = canUseSecureStore
          ? await SecureStore.getItemAsync(legacyKey)
          : await AsyncStorage.getItem(legacyKey);
        if (legacyValue) {
          // Migrate to current key
          if (canUseSecureStore) {
            await SecureStore.setItemAsync(AUTH_TOKEN_KEY, legacyValue);
          } else {
            await AsyncStorage.setItem(AUTH_TOKEN_KEY, legacyValue);
          }
          // Best-effort cleanup of legacy key
          try {
            if (canUseSecureStore) {
              await SecureStore.deleteItemAsync(legacyKey);
            } else {
              await AsyncStorage.removeItem(legacyKey);
            }
          } catch {}
          return legacyValue;
        }
      } catch {
        // Ignore legacy read errors
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

export const setToken = async (token: string): Promise<void> => {
  try {
    const canUseSecureStore = Platform.OS !== 'web' && (await SecureStore.isAvailableAsync());
    
    if (canUseSecureStore) {
      await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);
    } else {
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
    }
  } catch (error) {
    console.error('Error setting token:', error);
    throw error;
  }
};

export const clearToken = async (): Promise<void> => {
  try {
    const canUseSecureStore = Platform.OS !== 'web' && (await SecureStore.isAvailableAsync());
    if (canUseSecureStore) {
      await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
    } else {
      await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
    }
  } catch (error) {
    console.error('Error clearing token:', error);
  }
  // Best-effort cleanup for legacy keys
  for (const legacyKey of LEGACY_TOKEN_KEYS) {
    try {
      const canUseSecureStore = Platform.OS !== 'web' && (await SecureStore.isAvailableAsync());
      if (canUseSecureStore) {
        await SecureStore.deleteItemAsync(legacyKey);
      } else {
        await AsyncStorage.removeItem(legacyKey);
      }
    } catch {}
  }
};
