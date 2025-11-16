// src/mocks/incidentes.ts
import { Incident, TimelineEvent } from '@/utils/types';

export const incidentes: Incident[] = [
  {
    id: 'INC-001',
    titulo: 'Fallo en servidor principal del laboratorio',
    descripcion: 'El servidor del laboratorio de cómputo ha dejado de responder. Los estudiantes no pueden acceder a los recursos compartidos.',
    tipo: 'infraestructura',
    urgencia: 'critica',
    estado: 'pendiente',
    ubicacion: 'Laboratorio 301',
    reportadoPor: 'Prof. Juan Pérez',
    fechaReporte: new Date('2024-01-15T08:30:00'),
    fechaActualizacion: new Date('2024-01-15T08:30:00'),
    comentarios: [
      {
        id: 'c1',
        autor: 'Sistema',
        contenido: 'Incidente creado',
        fecha: new Date('2024-01-15T08:30:00'),
        tipo: 'sistema',
      },
    ],
  },
  {
    id: 'INC-002',
    titulo: 'Problema de conectividad WiFi en edificio A',
    descripcion: 'Múltiples usuarios reportan intermitencia en la conexión WiFi del segundo y tercer piso del edificio A.',
    tipo: 'red',
    urgencia: 'alta',
    estado: 'en_proceso',
    ubicacion: 'Edificio A - Pisos 2 y 3',
    reportadoPor: 'Estudiante - María López',
    atendidoPor: 'Carlos Ramírez',
    fechaReporte: new Date('2024-01-14T14:20:00'),
    fechaActualizacion: new Date('2024-01-15T09:15:00'),
    comentarios: [
      {
        id: 'c2',
        autor: 'Sistema',
        contenido: 'Incidente creado',
        fecha: new Date('2024-01-14T14:20:00'),
        tipo: 'sistema',
      },
      {
        id: 'c3',
        autor: 'Carlos Ramírez',
        contenido: 'Revisando configuración de puntos de acceso. Se detectó sobrecarga en el AP-02.',
        fecha: new Date('2024-01-15T09:15:00'),
        tipo: 'usuario',
      },
    ],
  },
  {
    id: 'INC-003',
    titulo: 'Actualización requerida en sistema de gestión académica',
    descripcion: 'El módulo de calificaciones requiere actualización de seguridad. Se detectó vulnerabilidad menor.',
    tipo: 'software',
    urgencia: 'media',
    estado: 'aprobado',
    ubicacion: 'Sistema Central',
    reportadoPor: 'Admin - Ana Martínez',
    atendidoPor: 'Luis Fernández',
    fechaReporte: new Date('2024-01-13T10:00:00'),
    fechaActualizacion: new Date('2024-01-14T16:30:00'),
    fechaResolucion: new Date('2024-01-14T16:30:00'),
    tiempoResolucion: 390,
    comentarios: [
      {
        id: 'c4',
        autor: 'Sistema',
        contenido: 'Incidente creado',
        fecha: new Date('2024-01-13T10:00:00'),
        tipo: 'sistema',
      },
      {
        id: 'c5',
        autor: 'María González',
        contenido: 'Aprobado para resolución inmediata',
        fecha: new Date('2024-01-14T15:00:00'),
        tipo: 'usuario',
      },
    ],
  },
  {
    id: 'INC-004',
    titulo: 'Teclado defectuoso en estación de trabajo',
    descripcion: 'El teclado de la estación 12 del laboratorio 201 tiene teclas que no responden correctamente.',
    tipo: 'hardware',
    urgencia: 'baja',
    estado: 'resuelto',
    ubicacion: 'Laboratorio 201 - Estación 12',
    reportadoPor: 'Estudiante - Pedro Sánchez',
    atendidoPor: 'Carlos Ramírez',
    fechaReporte: new Date('2024-01-12T11:45:00'),
    fechaActualizacion: new Date('2024-01-12T15:20:00'),
    fechaResolucion: new Date('2024-01-12T15:20:00'),
    tiempoResolucion: 215,
    comentarios: [
      {
        id: 'c6',
        autor: 'Sistema',
        contenido: 'Incidente creado',
        fecha: new Date('2024-01-12T11:45:00'),
        tipo: 'sistema',
      },
      {
        id: 'c7',
        autor: 'Carlos Ramírez',
        contenido: 'Teclado reemplazado. Estación operativa nuevamente.',
        fecha: new Date('2024-01-12T15:20:00'),
        tipo: 'usuario',
      },
    ],
  },
  {
    id: 'INC-005',
    titulo: 'Intento de acceso no autorizado detectado',
    descripcion: 'Sistema de seguridad detectó múltiples intentos de acceso fallidos a la red administrativa desde IP externa.',
    tipo: 'seguridad',
    urgencia: 'critica',
    estado: 'en_proceso',
    ubicacion: 'Red Administrativa',
    reportadoPor: 'Sistema Automático',
    atendidoPor: 'Luis Fernández',
    fechaReporte: new Date('2024-01-15T07:00:00'),
    fechaActualizacion: new Date('2024-01-15T08:45:00'),
    comentarios: [
      {
        id: 'c8',
        autor: 'Sistema',
        contenido: 'Incidente creado automáticamente',
        fecha: new Date('2024-01-15T07:00:00'),
        tipo: 'sistema',
      },
      {
        id: 'c9',
        autor: 'Luis Fernández',
        contenido: 'IP bloqueada temporalmente. Investigando origen.',
        fecha: new Date('2024-01-15T08:45:00'),
        tipo: 'usuario',
      },
    ],
  },
  {
    id: 'INC-006',
    titulo: 'Proyector no funciona en aula 405',
    descripcion: 'El proyector del aula 405 no enciende. Clase programada para las 10:00 AM.',
    tipo: 'hardware',
    urgencia: 'alta',
    estado: 'pendiente',
    ubicacion: 'Aula 405',
    reportadoPor: 'Prof. Laura Torres',
    fechaReporte: new Date('2024-01-15T09:30:00'),
    fechaActualizacion: new Date('2024-01-15T09:30:00'),
    comentarios: [
      {
        id: 'c10',
        autor: 'Sistema',
        contenido: 'Incidente creado',
        fecha: new Date('2024-01-15T09:30:00'),
        tipo: 'sistema',
      },
    ],
  },
  {
    id: 'INC-007',
    titulo: 'Solicitud de instalación de software especializado',
    descripcion: 'Se requiere instalar MATLAB en las estaciones del laboratorio 301 para el curso de Análisis Numérico.',
    tipo: 'software',
    urgencia: 'media',
    estado: 'aprobado',
    ubicacion: 'Laboratorio 301',
    reportadoPor: 'Prof. Roberto Silva',
    atendidoPor: 'Carlos Ramírez',
    fechaReporte: new Date('2024-01-10T13:00:00'),
    fechaActualizacion: new Date('2024-01-11T10:00:00'),
    comentarios: [
      {
        id: 'c11',
        autor: 'Sistema',
        contenido: 'Incidente creado',
        fecha: new Date('2024-01-10T13:00:00'),
        tipo: 'sistema',
      },
      {
        id: 'c12',
        autor: 'María González',
        contenido: 'Aprobado. Proceder con instalación.',
        fecha: new Date('2024-01-11T10:00:00'),
        tipo: 'usuario',
      },
    ],
  },
  {
    id: 'INC-008',
    titulo: 'Aire acondicionado fuera de servicio en oficinas',
    descripcion: 'El sistema de aire acondicionado de las oficinas del tercer piso no está funcionando correctamente.',
    tipo: 'infraestructura',
    urgencia: 'media',
    estado: 'rechazado',
    ubicacion: 'Edificio B - Piso 3',
    reportadoPor: 'Personal Administrativo',
    fechaReporte: new Date('2024-01-11T08:00:00'),
    fechaActualizacion: new Date('2024-01-11T14:00:00'),
    comentarios: [
      {
        id: 'c13',
        autor: 'Sistema',
        contenido: 'Incidente creado',
        fecha: new Date('2024-01-11T08:00:00'),
        tipo: 'sistema',
      },
      {
        id: 'c14',
        autor: 'María González',
        contenido: 'Rechazado: Este tipo de incidente debe ser reportado a Mantenimiento General, no a IT.',
        fecha: new Date('2024-01-11T14:00:00'),
        tipo: 'usuario',
      },
    ],
  },
];

export const generateTimeline = (incident: Incident): TimelineEvent[] => {
  const timeline: TimelineEvent[] = [];

  timeline.push({
    id: `tl-${incident.id}-1`,
    tipo: 'creado',
    usuario: incident.reportadoPor,
    descripcion: `Incidente creado por ${incident.reportadoPor}`,
    fecha: incident.fechaReporte,
  });

  if (incident.atendidoPor) {
    timeline.push({
      id: `tl-${incident.id}-2`,
      tipo: 'asignado',
      usuario: 'Sistema',
      descripcion: `Asignado a ${incident.atendidoPor}`,
      fecha: incident.fechaActualizacion,
      metadata: { atendidoPor: incident.atendidoPor },
    });
  }

  if (incident.estado === 'aprobado') {
    timeline.push({
      id: `tl-${incident.id}-3`,
      tipo: 'aprobado',
      usuario: 'María González',
      descripcion: 'Incidente aprobado por supervisor',
      fecha: incident.fechaActualizacion,
    });
  }

  if (incident.estado === 'rechazado') {
    timeline.push({
      id: `tl-${incident.id}-4`,
      tipo: 'rechazado',
      usuario: 'María González',
      descripcion: 'Incidente rechazado',
      fecha: incident.fechaActualizacion,
    });
  }

  if (incident.estado === 'resuelto' && incident.fechaResolucion) {
    timeline.push({
      id: `tl-${incident.id}-5`,
      tipo: 'resuelto',
      usuario: incident.atendidoPor || 'Sistema',
      descripcion: 'Incidente marcado como resuelto',
      fecha: incident.fechaResolucion,
    });
  }

  incident.comentarios
    .filter(c => c.tipo === 'usuario')
    .forEach((comment, idx) => {
      timeline.push({
        id: `tl-${incident.id}-comment-${idx}`,
        tipo: 'comentario',
        usuario: comment.autor,
        descripcion: comment.contenido,
        fecha: comment.fecha,
      });
    });

  return timeline.sort((a, b) => a.fecha.getTime() - b.fecha.getTime());
};



