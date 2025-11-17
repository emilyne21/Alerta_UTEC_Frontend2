// src/utils/types.ts

export type UserRole = 'supervisor' | 'trabajador' | 'admin';

export type WorkerArea = 'limpieza' | 'TI' | 'seguridad' | 'mantenimiento' | 'administracion';

export type IncidentStatus = 'pendiente' | 'en_proceso' | 'resuelto' | 'rechazado' | 'aprobado';

export type IncidentUrgency = 'baja' | 'media' | 'alta' | 'critica';

export type IncidentType = 'infraestructura' | 'seguridad' | 'software' | 'hardware' | 'red' | 'otro';

export interface User {
  id: string;
  nombre: string;
  email: string;
  rol: UserRole;
  area?: WorkerArea; // Solo para trabajadores
  avatar?: string;
}

export interface Incident {
  id: string;
  titulo: string;
  descripcion: string;
  tipo: IncidentType;
  urgencia: IncidentUrgency;
  estado: IncidentStatus;
  ubicacion: string;
  reportadoPor: string;
  atendidoPor?: string;
  fechaReporte: Date;
  fechaActualizacion: Date;
  fechaResolucion?: Date;
  comentarios: Comment[];
  evidencias?: string[];
  tiempoResolucion?: number; // minutos
}

export interface Comment {
  id: string;
  autor: string;
  contenido: string;
  fecha: Date;
  tipo?: 'sistema' | 'usuario';
}

export interface TimelineEvent {
  id: string;
  tipo: 'creado' | 'asignado' | 'comentario' | 'estado_cambiado' | 'resuelto' | 'aprobado' | 'rechazado';
  usuario: string;
  descripcion: string;
  fecha: Date;
  metadata?: Record<string, any>;
}

export interface ReportData {
  totalIncidentes: number;
  pendientes: number;
  tiempoPromedioResolucion: number; // minutos
  casosCriticos: number;
  distribucionPorTipo: { tipo: IncidentType; cantidad: number }[];
  distribucionPorUbicacion: { ubicacion: string; cantidad: number }[];
}

export interface KPI {
  label: string;
  value: number | string;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
}


