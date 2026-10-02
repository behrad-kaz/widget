// ============================================================
// FILE: lib/api/client.ts
// ============================================================
import axios from 'axios';

export const createApiClient = (baseURL: string) => {
  const client = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: 15000,
  });

  // Interceptor برای اضافه کردن token
  client.interceptors.request.use((config) => {
    const token = localStorage.getItem('customerToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Interceptor برای handling errors
  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem('customerToken');
        localStorage.removeItem('customerId');
      }
      return Promise.reject(error);
    }
  );

  return client;
};
// ============================================================