// src/services/socket.ts
import { io, Socket } from 'socket.io-client';

/**
 * Cliente de WebSocket usando Socket.IO
 * 
 * Características:
 * - URL configurada desde variables de entorno
 * - Reconexión automática
 * - Autenticación con token JWT
 */
class SocketService {
  private socket: Socket | null = null;
  private wsUrl: string;

  constructor() {
    this.wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:3001';
  }

  /**
   * Conecta al servidor WebSocket
   * @param token - Token JWT para autenticación (opcional, se obtiene del localStorage si no se proporciona)
   */
  connect(token?: string): Socket {
    if (this.socket?.connected) {
      return this.socket;
    }

    const authToken = token || localStorage.getItem('token') || localStorage.getItem('authToken');

    this.socket = io(this.wsUrl, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      auth: authToken ? { token: authToken } : undefined,
    });

    // Eventos de conexión
    this.socket.on('connect', () => {
      console.log('✅ WebSocket conectado:', this.socket?.id);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ WebSocket desconectado:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Error de conexión WebSocket:', error.message);
    });

    return this.socket;
  }

  /**
   * Desconecta del servidor WebSocket
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  /**
   * Obtiene la instancia del socket (null si no está conectado)
   */
  getSocket(): Socket | null {
    return this.socket;
  }

  /**
   * Verifica si el socket está conectado
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  /**
   * Emite un evento al servidor
   */
  emit(event: string, data?: any): void {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn('⚠️ Socket no conectado. No se puede emitir:', event);
    }
  }

  /**
   * Escucha un evento del servidor
   */
  on(event: string, callback: (...args: any[]) => void): void {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  /**
   * Deja de escuchar un evento
   */
  off(event: string, callback?: (...args: any[]) => void): void {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }
}

// Exportar instancia singleton
const socketService = new SocketService();

export default socketService;

