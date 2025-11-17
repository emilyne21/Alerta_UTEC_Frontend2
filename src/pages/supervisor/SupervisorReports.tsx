// src/pages/supervisor/SupervisorReports.tsx
import { useState, useEffect, useMemo } from 'react';
import { KPI, Incident, IncidentType } from '@/utils/types';
import apiClient from '@/services/api';
import { Loader2 } from 'lucide-react';

export const SupervisorReports = () => {
  const [incidentes, setIncidentes] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar incidentes del backend
  useEffect(() => {
    const fetchIncidents = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await apiClient.get('/incidentes');
        
        // Verificar si la respuesta es un array o está dentro de un objeto
        let incidentsData = response.data;
        if (!Array.isArray(incidentsData)) {
          if (incidentsData.data && Array.isArray(incidentsData.data)) {
            incidentsData = incidentsData.data;
          } else if (incidentsData.incidentes && Array.isArray(incidentsData.incidentes)) {
            incidentsData = incidentsData.incidentes;
          } else if (incidentsData.incidents && Array.isArray(incidentsData.incidents)) {
            incidentsData = incidentsData.incidents;
          } else {
            setError('Formato de respuesta inesperado del servidor');
            setIsLoading(false);
            return;
          }
        }
        
        // Normalizar los datos del backend al formato esperado
        const incidents = incidentsData.map((inc: any, index: number) => {
          try {
            return {
              id: inc.id || inc._id || `inc-${index}-${Date.now()}`,
              titulo: inc.titulo || inc.title || inc.descripcion || inc.description || '',
              descripcion: inc.descripcion || inc.description || '',
              tipo: (inc.tipo || inc.type || 'otro') as Incident['tipo'],
              urgencia: (inc.urgencia || inc.urgency || 'media') as Incident['urgencia'],
              estado: (() => {
                const estado = inc.estado || inc.status || 'pendiente';
                if (estado === 'en_atencion') {
                  return 'en_proceso' as Incident['estado'];
                }
                return estado as Incident['estado'];
              })(),
              ubicacion: inc.ubicacion || inc.location || '',
              reportadoPor: inc.reportadoPor || inc.reportedBy || inc.reportado_por || '',
              atendidoPor: (() => {
                const assigned = inc.atendidoPor || inc.asignadoA || inc.assignedTo || inc.asignado_a;
                if (!assigned || assigned === 'NO ASIGNADO' || assigned.trim() === '') {
                  return undefined;
                }
                return assigned;
              })(),
              fechaReporte: inc.fechaReporte ? new Date(inc.fechaReporte) : new Date(inc.fecha_reporte || inc.createdAt || inc.created_at || Date.now()),
              fechaActualizacion: inc.fechaActualizacion ? new Date(inc.fechaActualizacion) : new Date(inc.fecha_actualizacion || inc.updatedAt || inc.updated_at || Date.now()),
              fechaResolucion: inc.fechaResolucion ? new Date(inc.fechaResolucion) : (inc.fecha_resolucion || inc.resolvedAt || inc.resolved_at ? new Date(inc.fecha_resolucion || inc.resolvedAt || inc.resolved_at) : undefined),
              comentarios: inc.comentarios || inc.comments || [],
              evidencias: inc.evidencias || inc.evidence || [],
              tiempoResolucion: inc.tiempoResolucion || inc.resolutionTime || undefined,
            };
          } catch (mapError) {
            console.error(`Error mapping incident at index ${index}:`, mapError, inc);
            return null;
          }
        }).filter((inc: Incident | null) => inc !== null) as Incident[];
        
        setIncidentes(incidents);
      } catch (err: any) {
        console.error('Error al cargar incidentes:', err);
        setError('No se pudieron cargar los incidentes. Por favor intenta más tarde.');
        
        if ((window as any).showToast) {
          (window as any).showToast('error', 'Error al cargar los incidentes');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchIncidents();
  }, []);

  // Calcular KPIs desde los incidentes reales
  const kpis: KPI[] = useMemo(() => {
    const total = incidentes.length;
    const pendientes = incidentes.filter((inc) => inc.estado === 'pendiente').length;
    const criticos = incidentes.filter((inc) => inc.urgencia === 'critica').length;

    return [
      {
        label: 'Incidentes Totales',
        value: total,
        change: 5,
        trend: 'up',
      },
      {
        label: 'Pendientes',
        value: pendientes,
        change: -2,
        trend: 'down',
      },
      {
        label: 'Casos Críticos',
        value: criticos,
        change: 1,
        trend: 'up',
      },
    ];
  }, [incidentes]);

  // Calcular distribución por tipo
  const distribucionPorTipo = useMemo(() => {
    const tipoCounts: Record<IncidentType, number> = {
      infraestructura: 0,
      seguridad: 0,
      software: 0,
      hardware: 0,
      red: 0,
      otro: 0,
    };

    incidentes.forEach((inc) => {
      tipoCounts[inc.tipo] = (tipoCounts[inc.tipo] || 0) + 1;
    });

    return Object.entries(tipoCounts)
      .map(([tipo, cantidad]) => ({ tipo: tipo as IncidentType, cantidad }))
      .filter((item) => item.cantidad > 0)
      .sort((a, b) => b.cantidad - a.cantidad);
  }, [incidentes]);

  // Calcular distribución por ubicación
  const distribucionPorUbicacion = useMemo(() => {
    const ubicacionCounts: Record<string, number> = {};

    incidentes.forEach((inc) => {
      const ubicacion = inc.ubicacion || 'Sin ubicación';
      ubicacionCounts[ubicacion] = (ubicacionCounts[ubicacion] || 0) + 1;
    });

    return Object.entries(ubicacionCounts)
      .map(([ubicacion, cantidad]) => ({ ubicacion, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 10); // Top 10 ubicaciones
  }, [incidentes]);

  // Calcular altura máxima para gráficos
  const maxTipo = distribucionPorTipo.length > 0 
    ? Math.max(...distribucionPorTipo.map((d) => d.cantidad))
    : 1;
  const maxUbicacion = distribucionPorUbicacion.length > 0
    ? Math.max(...distribucionPorUbicacion.map((d) => d.cantidad))
    : 1;

  const tipoLabels: Record<string, string> = {
    infraestructura: 'Infraestructura',
    seguridad: 'Seguridad',
    software: 'Software',
    hardware: 'Hardware',
    red: 'Red',
    otro: 'Otro',
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Reportes y Estadísticas</h1>
        <p className="text-gray-600">Análisis de incidentes y métricas del sistema</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="animate-spin h-12 w-12 text-primary-600 mx-auto mb-4" />
            <p className="text-gray-600">Cargando reportes...</p>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      ) : (
        <>
          <div className="flex justify-center">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl w-full">
              {kpis.map((kpi, index) => (
                <div
                  key={index}
                  className="rounded-lg border p-6 shadow-sm hover:shadow-md transition-shadow"
                  style={{ backgroundColor: '#F2ECEC', borderColor: '#9C90FC' }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium" style={{ color: '#132436', opacity: 0.7 }}>{kpi.label}</p>
                    {kpi.trend && (
                      <div
                        className={`flex items-center gap-1 text-xs ${
                          kpi.trend === 'up' ? 'text-success-600' :
                          kpi.trend === 'down' ? 'text-danger-600' :
                          'text-gray-500'
                        }`}
                      >
                        {kpi.trend === 'up' && <span>↑</span>}
                        {kpi.trend === 'down' && <span>↓</span>}
                        {kpi.change !== undefined && (
                          <span>{Math.abs(kpi.change)}%</span>
                        )}
                      </div>
                    )}
                  </div>
                  <p className="text-2xl font-bold" style={{ color: '#132436' }}>{kpi.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6 max-w-6xl mx-auto">
            {/* Gráfico de distribución por tipo */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Distribución por Tipo
              </h2>
              {distribucionPorTipo.length > 0 ? (
                <div className="space-y-4">
                  {distribucionPorTipo.map((item) => {
                    const percentage = (item.cantidad / maxTipo) * 100;
                    return (
                      <div key={item.tipo}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700">
                            {tipoLabels[item.tipo] || item.tipo}
                          </span>
                          <span className="text-sm text-gray-600">{item.cantidad}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className="bg-primary-600 h-3 rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                            role="progressbar"
                            aria-valuenow={item.cantidad}
                            aria-valuemin={0}
                            aria-valuemax={maxTipo}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No hay datos disponibles
                </div>
              )}
            </div>

            {/* Gráfico de distribución por ubicación */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Distribución por Ubicación
              </h2>
              {distribucionPorUbicacion.length > 0 ? (
                <div className="space-y-4">
                  {distribucionPorUbicacion.map((item) => {
                    const percentage = (item.cantidad / maxUbicacion) * 100;
                    return (
                      <div key={item.ubicacion}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700">
                            {item.ubicacion}
                          </span>
                          <span className="text-sm text-gray-600">{item.cantidad}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className="bg-success-600 h-3 rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                            role="progressbar"
                            aria-valuenow={item.cantidad}
                            aria-valuemin={0}
                            aria-valuemax={maxUbicacion}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No hay datos disponibles
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};




