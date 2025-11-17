// src/services/api.ts
import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from 'axios';

/**
 * Cliente de API configurado con Axios
 * 
 * Características:
 * - Base URL hardcodeada a '/api' para usar el proxy de Amplify
 * - Interceptor para añadir token JWT automáticamente
 * - Manejo de errores centralizado
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: '/api',
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
    
    // Log para debugging
    const fullUrl = `${config.baseURL}${config.url}`;
    console.log(`[API Request] ${config.method?.toUpperCase()} ${fullUrl}`, {
      hasToken: !!token,
      data: config.data ? { ...config.data, password: config.data.password ? '***' : undefined } : undefined
    });
    
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
      // Solo redirigir si NO es una petición de registro o login
      if (status === 401) {
        const url = error.config?.url || '';
        const isAuthEndpoint = url.includes('/auth/register') || url.includes('/auth/login');
        
        if (!isAuthEndpoint) {
          // Limpiar token y redirigir al login solo si no es un endpoint de autenticación
          localStorage.removeItem('token');
          localStorage.removeItem('authToken');
          window.location.href = '/login';
        }
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

