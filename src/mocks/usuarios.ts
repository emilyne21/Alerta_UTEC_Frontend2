// src/mocks/usuarios.ts
import { User } from '@/utils/types';

export const usuarios: User[] = [
  {
    id: '1',
    nombre: 'María González',
    email: 'maria.gonzalez@utec.edu.pe',
    rol: 'supervisor',
  },
  {
    id: '2',
    nombre: 'Carlos Ramírez',
    email: 'carlos.ramirez@utec.edu.pe',
    rol: 'trabajador',
    area: 'TI',
  },
  {
    id: '3',
    nombre: 'Ana Martínez',
    email: 'ana.martinez@utec.edu.pe',
    rol: 'admin',
  },
  {
    id: '4',
    nombre: 'Luis Fernández',
    email: 'luis.fernandez@utec.edu.pe',
    rol: 'trabajador',
    area: 'limpieza',
  },
];

// Usuario mock actual (para simular sesión)
export let currentUser: User | null = null;

export const setCurrentUser = (user: User | null) => {
  currentUser = user;
};

export const getCurrentUser = (): User | null => {
  // Primero intentar obtener del estado en memoria
  if (currentUser) {
    return currentUser;
  }
  
  // Si no hay en memoria, intentar obtener del localStorage
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      currentUser = user; // Actualizar el estado en memoria
      return user;
    }
  } catch (error) {
    console.error('Error al leer usuario del localStorage:', error);
  }
  
  return null;
};


