// src/pages/supervisor/SupervisorHistory.tsx
import { useState, useMemo, useEffect } from 'react';
import { Incident, TimelineEvent } from '@/utils/types';
import { IncidentTimeline } from '@/components/incidents/IncidentTimeline';
import { FiltersPanel, FilterState } from '@/components/dashboard/FiltersPanel';
import { EmptyState } from '@/components/common/EmptyState';
import { StatusBadge, UrgencyBadge, TypeBadge } from '@/components/common/Badge';
import { FolderOpen, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import apiClient from '@/services/api';
import { format } from 'date-fns';
import es from 'date-fns/locale/es';

export const SupervisorHistory = () => {
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  const [incidentHistory, setIncidentHistory] = useState<Record<string, TimelineEvent[]>>({});
  const [loadingHistory, setLoadingHistory] = useState<Record<string, boolean>>({});
  const [filters, setFilters] = useState<FilterState>({});
  const [incidentes, setIncidentes] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar todos los incidentes del backend
  useEffect(() => {
    const fetchIncidents = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Construir query parameters basados en los filtros
        const queryParams = new URLSearchParams();
        
        if (filters.estado) {
          queryParams.append('estado', filters.estado);
        }
        if (filters.tipo) {
          queryParams.append('tipo', filters.tipo);
        }
        if (filters.urgencia) {
          queryParams.append('urgencia', filters.urgencia);
        }
        if (filters.fechaDesde) {
          queryParams.append('fechaDesde', filters.fechaDesde);
        }
        if (filters.fechaHasta) {
          queryParams.append('fechaHasta', filters.fechaHasta);
        }
        
        // Construir la URL con query parameters
        const url = queryParams.toString() 
          ? `/incidentes?${queryParams.toString()}`
          : '/incidentes';
        
        const response = await apiClient.get(url);
        
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
                // Mapear en_atencion a en_proceso para compatibilidad
                if (estado === 'en_atencion') {
                  return 'en_proceso' as Incident['estado'];
                }
                return estado as Incident['estado'];
              })(),
              ubicacion: inc.ubicacion || inc.location || '',
              reportadoPor: inc.reportadoPor || inc.reportedBy || inc.reportado_por || '',
              atendidoPor: (() => {
                const assigned = inc.atendidoPor || inc.asignadoA || inc.assignedTo || inc.asignado_a;
                // Si está vacío, null, undefined o es "NO ASIGNADO", retornar undefined
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
  }, [filters.estado, filters.tipo, filters.urgencia, filters.fechaDesde, filters.fechaHasta]);

  // Filtrar incidentes por búsqueda de texto
  const filteredIncidents = useMemo(() => {
    let filtered = [...incidentes];

    if (filters.busqueda) {
      const query = filters.busqueda.toLowerCase();
      filtered = filtered.filter(
        (inc) =>
          inc.titulo.toLowerCase().includes(query) ||
          inc.descripcion.toLowerCase().includes(query) ||
          inc.id.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [incidentes, filters.busqueda]);

  // Función para cargar el historial de un incidente
  const handleToggleHistory = async (incidentId: string) => {
    if (selectedIncidentId === incidentId) {
      // Si ya está seleccionado, cerrarlo
      setSelectedIncidentId(null);
      return;
    }

    // Si ya tenemos el historial cargado, solo cambiar la selección
    if (incidentHistory[incidentId]) {
      setSelectedIncidentId(incidentId);
      return;
    }

    // Cargar el historial desde el endpoint
    setSelectedIncidentId(incidentId);
    setLoadingHistory((prev) => ({ ...prev, [incidentId]: true }));

    try {
      const response = await apiClient.get(`/incidentes/${incidentId}/historial`);
      
      // Normalizar los eventos del historial
      let historyData = response.data;
      if (!Array.isArray(historyData)) {
        if (historyData.data && Array.isArray(historyData.data)) {
          historyData = historyData.data;
        } else if (historyData.historial && Array.isArray(historyData.historial)) {
          historyData = historyData.historial;
        } else if (historyData.events && Array.isArray(historyData.events)) {
          historyData = historyData.events;
        } else {
          console.warn('Formato de respuesta inesperado para historial:', historyData);
          historyData = [];
        }
      }

      const timelineEvents: TimelineEvent[] = historyData.map((event: any, index: number) => {
        try {
          return {
            id: event.id || event._id || `hist-${incidentId}-${index}`,
            tipo: (event.tipo || event.type || 'comentario') as TimelineEvent['tipo'],
            usuario: event.usuario || event.user || event.usuario_nombre || 'Sistema',
            descripcion: event.descripcion || event.description || event.mensaje || '',
            fecha: event.fecha ? new Date(event.fecha) : (event.fecha_evento ? new Date(event.fecha_evento) : (event.createdAt ? new Date(event.createdAt) : new Date())),
            metadata: event.metadata || event.metadatos || {},
          };
        } catch (mapError) {
          console.error(`Error mapping history event at index ${index}:`, mapError, event);
          return null;
        }
      }).filter((event: TimelineEvent | null) => event !== null) as TimelineEvent[];

      // Ordenar eventos por fecha
      timelineEvents.sort((a, b) => a.fecha.getTime() - b.fecha.getTime());
      
      setIncidentHistory((prev) => ({
        ...prev,
        [incidentId]: timelineEvents,
      }));
    } catch (err: any) {
      console.error('Error al cargar historial del incidente:', err);
      if ((window as any).showToast) {
        (window as any).showToast('error', 'Error al cargar el historial del incidente');
      }
      // Guardar array vacío en caso de error
      setIncidentHistory((prev) => ({
        ...prev,
        [incidentId]: [],
      }));
    } finally {
      setLoadingHistory((prev) => ({ ...prev, [incidentId]: false }));
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Historial de Incidentes</h1>
        <p className="text-gray-600">Consulta el historial completo de todos los incidentes del sistema</p>
      </div>

      <FiltersPanel onFilterChange={setFilters} />

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="animate-spin h-12 w-12 text-primary-600 mx-auto mb-4" />
            <p className="text-gray-600">Cargando incidentes...</p>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      ) : filteredIncidents.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="No hay incidentes"
          message={
            filters.busqueda || filters.estado || filters.tipo || filters.urgencia
              ? 'No se encontraron incidentes con los filtros aplicados'
              : 'No hay incidentes registrados en el sistema'
          }
        />
      ) : (
        <div className="space-y-6">
          {filteredIncidents.map((incident) => (
            <div
              key={incident.id}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Encabezado del incidente */}
              <div
                className="p-6 cursor-pointer"
                onClick={() => handleToggleHistory(incident.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{incident.titulo}</h3>
                      <StatusBadge status={incident.estado} />
                      <UrgencyBadge urgency={incident.urgencia} />
                      <TypeBadge type={incident.tipo} />
                    </div>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{incident.descripcion}</p>
                    <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                      <span>ID: {incident.id}</span>
                      <span>Ubicación: {incident.ubicacion}</span>
                      <span>Reportado por: {incident.reportadoPor}</span>
                      {incident.atendidoPor && (
                        <span>Asignado a: {incident.atendidoPor}</span>
                      )}
                      <span>
                        Fecha: {format(incident.fechaReporte, 'dd MMM yyyy, HH:mm', { locale: es })}
                      </span>
                    </div>
                  </div>
                  <div className="ml-4">
                    {selectedIncidentId === incident.id ? (
                      <ChevronUp className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                </div>
              </div>

              {/* Historial del incidente */}
              {selectedIncidentId === incident.id && (
                <div className="bg-gray-50 p-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Historial Completo del Incidente
                  </h3>
                  {loadingHistory[incident.id] ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="text-center">
                        <Loader2 className="animate-spin h-8 w-8 text-primary-600 mx-auto mb-2" />
                        <p className="text-gray-600 text-sm">Cargando historial...</p>
                      </div>
                    </div>
                  ) : incidentHistory[incident.id] && incidentHistory[incident.id].length > 0 ? (
                    <IncidentTimeline events={incidentHistory[incident.id]} />
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No hay eventos en el historial de este incidente.
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

