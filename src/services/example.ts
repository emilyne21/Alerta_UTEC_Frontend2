// src/services/example.ts
/**
 * Ejemplos de uso de los servicios de API y WebSocket
 * 
 * Este archivo es solo para referencia, no se importa en producción
 */

import apiClient from './api';
import socketService from './socket';

// ============================================
// EJEMPLOS DE USO DEL CLIENTE API
// ============================================

/**
 * Ejemplo 1: Obtener lista de incidentes
 */
export const getIncidents = async () => {
  try {
    const response = await apiClient.get('/incidents');
    return response.data;
  } catch (error) {
    console.error('Error al obtener incidentes:', error);
    throw error;
  }
};

/**
 * Ejemplo 2: Crear un nuevo incidente
 */
export const createIncident = async (incidentData: {
  tipo: string;
  descripcion: string;
  ubicacion: string;
}) => {
  try {
    const response = await apiClient.post('/incidents', incidentData);
    return response.data;
  } catch (error) {
    console.error('Error al crear incidente:', error);
    throw error;
  }
};

/**
 * Ejemplo 3: Actualizar un incidente
 */
export const updateIncident = async (id: string, updates: any) => {
  try {
    const response = await apiClient.put(`/incidents/${id}`, updates);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar incidente:', error);
    throw error;
  }
};

/**
 * Ejemplo 4: Eliminar un incidente
 */
export const deleteIncident = async (id: string) => {
  try {
    await apiClient.delete(`/incidents/${id}`);
  } catch (error) {
    console.error('Error al eliminar incidente:', error);
    throw error;
  }
};

// ============================================
// EJEMPLOS DE USO DEL CLIENTE WEBSOCKET
// ============================================

/**
 * Ejemplo 1: Conectar y escuchar eventos de incidentes
 */
export const setupIncidentListeners = () => {
  // Conectar al servidor
  socketService.connect();

  // Escuchar cuando se crea un nuevo incidente
  socketService.on('incident:created', (incident) => {
    console.log('Nuevo incidente creado:', incident);
    // Aquí puedes actualizar el estado de tu aplicación
    // Por ejemplo, añadir el incidente a una lista
  });

  // Escuchar cuando se actualiza un incidente
  socketService.on('incident:updated', (incident) => {
    console.log('Incidente actualizado:', incident);
    // Actualizar el incidente en tu estado
  });

  // Escuchar cuando se elimina un incidente
  socketService.on('incident:deleted', (incidentId) => {
    console.log('Incidente eliminado:', incidentId);
    // Remover el incidente de tu estado
  });
};

/**
 * Ejemplo 2: Emitir eventos al servidor
 */
export const emitIncidentUpdate = (incidentId: string, status: string) => {
  socketService.emit('incident:update', {
    id: incidentId,
    estado: status,
  });
};

/**
 * Ejemplo 3: Desconectar cuando el componente se desmonte
 */
export const cleanupSocket = () => {
  socketService.disconnect();
};

/**
 * Ejemplo 4: Uso en un componente React (hook personalizado)
 */
/*
import { useEffect } from 'react';
import socketService from '@/services/socket';

export const useIncidentSocket = () => {
  useEffect(() => {
    // Conectar al montar
    socketService.connect();

    // Escuchar eventos
    const handleNewIncident = (incident: any) => {
      console.log('Nuevo incidente:', incident);
    };

    socketService.on('incident:created', handleNewIncident);

    // Limpiar al desmontar
    return () => {
      socketService.off('incident:created', handleNewIncident);
      socketService.disconnect();
    };
  }, []);
};
*/

