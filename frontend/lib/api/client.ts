import axios, { AxiosError, AxiosInstance } from 'axios';
import { API_BASE_URL } from './config';
import type { ApiResponse, ApiError } from '@/types/api';
import { getErrorCode, getFriendlyError } from '@/lib/error-messages';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<{ error: ApiError }>) => {
        // If server returned a structured error, use it
        if (error.response?.data?.error) {
          const serverError = error.response.data.error;
          // Enrich with HTTP status code for better error mapping
          return Promise.reject({
            ...serverError,
            status: error.response.status,
          });
        }

        // Map axios error to friendly error
        const errorCode = getErrorCode(error);
        const friendlyError = getFriendlyError(error);

        return Promise.reject({
          code: errorCode,
          message: friendlyError.message,
          status: error.response?.status,
          originalError: error,
        });
      }
    );
  }

  async get<T>(url: string, params?: Record<string, unknown> | undefined): Promise<ApiResponse<T>> {
    const response = await this.client.get<ApiResponse<T>>(url, { params });
    return response.data;
  }

  async post<T>(url: string, data?: unknown): Promise<ApiResponse<T>> {
    const response = await this.client.post<ApiResponse<T>>(url, data);
    return response.data;
  }

  async put<T>(url: string, data?: unknown): Promise<ApiResponse<T>> {
    const response = await this.client.put<ApiResponse<T>>(url, data);
    return response.data;
  }

  async delete<T>(url: string): Promise<ApiResponse<T>> {
    const response = await this.client.delete<ApiResponse<T>>(url);
    return response.data;
  }

  async patch<T>(url: string, data?: unknown): Promise<ApiResponse<T>> {
    const response = await this.client.patch<ApiResponse<T>>(url, data);
    return response.data;
  }
}

export const apiClient = new ApiClient();
