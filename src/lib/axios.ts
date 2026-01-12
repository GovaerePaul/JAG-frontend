import axios, { AxiosInstance, AxiosError } from 'axios';

const createAxiosInstance = (): AxiosInstance => {
  const baseURL = process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000/api'
    : '/api';

  const instance = axios.create({
    baseURL,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  instance.interceptors.request.use(
    (config) => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('auth-token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

      instance.interceptors.response.use(
        (response) => {
          return {
            ...response,
            data: {
              success: true,
              data: response.data.data || response.data,
              message: response.data.message,
            },
          };
        },
    (error: AxiosError) => {
      const response = error.response;
      const responseData = response?.data as { error?: string; message?: string } | undefined;
      const errorMessage = responseData?.error || 
                          responseData?.message || 
                          error.message || 
                          'An error occurred';

      if (response?.status === 401 && typeof window !== 'undefined') {
        localStorage.removeItem('auth-token');
        window.location.href = '/auth';
      }

      return Promise.reject({
        success: false,
        error: errorMessage,
        status: response?.status,
      });
    }
  );

  return instance;
};

export const apiClient = createAxiosInstance();

export const createServerAxios = (token?: string): AxiosInstance => {
  const instance = axios.create({
    baseURL: process.env.NODE_ENV === 'development'
      ? 'http://localhost:3000/api'
      : '/api',
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });

  return instance;
};

export default apiClient;
