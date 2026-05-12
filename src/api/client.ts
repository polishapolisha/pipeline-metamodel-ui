// src/api/client.ts
import axios from 'axios';
import type { AxiosError } from 'axios'; // ← Важно: type для импорта типов

// Создаём инстанс без явного указания типа — TypeScript сам поймёт
const apiClient = axios.create({
  baseURL: '/api', // Проксируется через Vite на бэкенд
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Интерцептор запросов
apiClient.interceptors.request.use((config) => {
  // Позже: добавление токена или X-Branch-Id
  return config;
});

// Интерцептор ответов
apiClient.interceptors.response.use(
  (response) => response.data, // Возвращаем сразу данные
  (error: AxiosError) => {
    console.error('API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
    });

    // Глобальная обработка ошибок (можно расширить)
    if (error.response?.status === 401) {
      // TODO: redirect to login
    }
    if (error.response?.status === 403) {
      alert('Доступ запрещён');
    }
    if (error.response?.status === 404) {
      // 404 — не всегда ошибка, иногда ожидаемое поведение
      console.warn('Resource not found:', error.config?.url);
    }
    if (error.response?.status >= 500) {
      alert('Ошибка сервера. Попробуйте позже.');
    }

    return Promise.reject(error);
  }
);

export default apiClient;