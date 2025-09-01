import axios, { AxiosError, AxiosResponse } from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { getToken, clearToken } from './auth';
import { router } from 'expo-router';

// API Error interface matching backend format
export interface ApiError {
  success: false;
  statusCode: number;
  errorCode: string;
  message: string;
  details?: any;
}

// Get platform-specific API base URL
const getApiBaseUrl = () => {
  const apiUrls = Constants.expoConfig?.extra?.apiBaseUrl;
  if (apiUrls) {
    return Platform.select({
      android: apiUrls.android,
      ios: apiUrls.ios,
      default: apiUrls.default,
    });
  }
  return 'http://localhost:3000';
};

// Create axios instance
const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 30_000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      // Log for PDF export requests
      if (config.url?.includes('export.pdf')) {
        console.log('API Interceptor: Adding token to PDF request');
        console.log('API Interceptor: Token exists:', !!token);
        console.log('API Interceptor: Token length:', token.length);
        console.log('API Interceptor: Request URL:', config.url);
        console.log('API Interceptor: Request headers:', config.headers);
      }
    } else if (config.url?.includes('export.pdf')) {
      console.warn('API Interceptor: No token found for PDF request!');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors and normalize error format
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    // Handle 401 - clear token and redirect to login (unless suppressed for exploratory calls)
    if (error.response?.status === 401) {
      const suppress = (error.config as any)?.headers?.['X-Suppress-401-Logout'] === '1';
      if (!suppress) {
        await clearToken();
        router.replace('/(auth)/login');
      }
    }

    // Normalize error response format
    if (error.response?.data) {
      const errorData = error.response.data as any;
      
      // If it's already in our expected format, return as is
      if (errorData.success === false && errorData.statusCode && errorData.errorCode) {
        return Promise.reject(errorData as ApiError);
      }
      
      // Otherwise, normalize it
      const normalizedError: ApiError = {
        success: false,
        statusCode: error.response.status,
        errorCode: errorData.errorCode || 'UNKNOWN_ERROR',
        message: errorData.message || error.message || 'Đã xảy ra lỗi không xác định',
        details: errorData.details,
      };
      
      return Promise.reject(normalizedError);
    }

    // Network or other errors
    const networkError: ApiError = {
      success: false,
      statusCode: 0,
      errorCode: 'NETWORK_ERROR',
      message: 'Không thể kết nối tới máy chủ. Vui lòng kiểm tra kết nối mạng.',
    };

    return Promise.reject(networkError);
  }
);

// Auth API methods
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: {
    id: number | string;
    email: string;
    role: { id: number; name: string } | string;
  };
}

export interface UserProfile {
  id: number | string;
  email: string;
  name?: string;
  fullName?: string;
  role: { id: number; name: string } | string;
  phone?: string;
  gender?: 'Nam' | 'Nữ' | 'Khác';
  dateOfBirth?: string;
  birthDate?: string;
  address?: string;
  avatarUrl?: string;
}

export interface PermissionsResponse {
  permissions: string[];
}

// /me aggregate response for patient
export interface MeResponse {
  id: number | string;
  email: string;
  phone?: string;
  role: { id: number; name: string } | string;
  staff: any | null;
  patient: {
    id: number;
    fullName: string;
    gender?: string;
    birthYear?: number;
    phone?: string;
    address?: string;
    createdAt?: string;
    updatedAt?: string;
  } | null;
  permissions: string[];
}

export const authLogin = async (data: LoginRequest): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>('/auth/login', data);
  return response.data;
};

export const getProfile = async (): Promise<UserProfile> => {
  const response = await api.get<UserProfile>('/auth/profile');
  return response.data;
};

export const getMyPermissions = async (): Promise<PermissionsResponse> => {
  const response = await api.get<PermissionsResponse>('/auth/my-permissions');
  return response.data;
};

export const getMe = async (): Promise<MeResponse> => {
  const response = await api.get<MeResponse>('/me');
  return response.data;
};

// Profile update
export type UpdateProfileDto = Partial<{
  email: string;
  phone: string;
  fullName: string;
  gender: 'Nam' | 'Nữ' | 'Khác';
  birthDate: string; // YYYY-MM-DD
  address: string;
  avatarUrl: string;
}>;

export const updateProfile = async (dto: UpdateProfileDto): Promise<UserProfile> => {
  const response = await api.put<UserProfile>('/auth/profile', dto);
  return response.data;
};

export default api;
