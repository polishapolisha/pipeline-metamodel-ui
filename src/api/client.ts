// src/api/client.ts
import axios from 'axios';
import type { AxiosError } from 'axios';

const apiClient = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

//  Интерцептор: всегда возвращаем только тело ответа (response.data)
apiClient.interceptors.response.use(
  (response) => response.data,
  (error: AxiosError) => {
    console.error('🔥 API Error:', error.message);
    return Promise.reject(error);
  }
);

export default apiClient;