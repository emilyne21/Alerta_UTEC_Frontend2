// src/services/api.ts
import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from 'axios';

/**
 * Cliente de API configurado con Axios
 * 
 * Características:
 * - Base URL configurada desde variables de entorno
 * - Interceptor para añadir token JWT automáticamente
 * - Manejo de errores centralizado
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  timeout: 30000, // 30 segundos
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Interceptor de peticiones: Añade el token JWT si existe
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    
    return config;
  },
  (error: AxiosError) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

/**
 * Interceptor de respuestas: Manejo centralizado de errores
 */
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    // Manejo de errores HTTP
    if (error.response) {
      const status = error.response.status;
      
      // Token expirado o inválido
      if (status === 401) {
        // Limpiar token y redirigir al login
        localStorage.removeItem('token');
        localStorage.removeItem('authToken');
        window.location.href = '/login';
      }
      
      // Error del servidor
      if (status >= 500) {
        console.error('Error del servidor:', error.response.data);
      }
    } else if (error.request) {
      // Error de red
      console.error('Error de red:', error.request);
    } else {
      // Error al configurar la petición
      console.error('Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;

