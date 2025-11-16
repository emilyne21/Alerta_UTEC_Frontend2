// src/mocks/reportes.ts
import { ReportData } from '@/utils/types';

export const reporteData: ReportData = {
  totalIncidentes: 156,
  pendientes: 12,
  tiempoPromedioResolucion: 245, // minutos
  casosCriticos: 3,
  distribucionPorTipo: [
    { tipo: 'infraestructura', cantidad: 45 },
    { tipo: 'software', cantidad: 38 },
    { tipo: 'hardware', cantidad: 32 },
    { tipo: 'red', cantidad: 25 },
    { tipo: 'seguridad', cantidad: 12 },
    { tipo: 'otro', cantidad: 4 },
  ],
  distribucionPorUbicacion: [
    { ubicacion: 'Laboratorio 301', cantidad: 28 },
    { ubicacion: 'Laboratorio 201', cantidad: 22 },
    { ubicacion: 'Edificio A', cantidad: 35 },
    { ubicacion: 'Edificio B', cantidad: 31 },
    { ubicacion: 'Aula 405', cantidad: 18 },
    { ubicacion: 'Sistema Central', cantidad: 22 },
  ],
};



