// src/pages/worker/WorkerHistory.tsx
import { useState, useMemo, useEffect } from 'react';
import { getCurrentUser } from '@/mocks/usuarios';
import { Incident, TimelineEvent } from '@/utils/types';
import { IncidentTimeline } from '@/components/incidents/IncidentTimeline';
import { FiltersPanel, FilterState } from '@/components/dashboard/FiltersPanel';
import { EmptyState } from '@/components/common/EmptyState';
import { StatusBadge, UrgencyBadge, TypeBadge } from '@/components/common/Badge';
import { FolderOpen, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import apiClient from '@/services/api';

export const WorkerHistory = () => {
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  const [incidentHistory, setIncidentHistory] = useState<Record<string, TimelineEvent[]>>({});
  const [loadingHistory, setLoadingHistory] = useState<Record<string, boolean>>({});
  const [filters, setFilters] = useState<FilterState>({});
  const [incidentes, setIncidentes] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const currentUser = getCurrentUser();

  // Cargar incidentes del backend
  useEffect(() => {
    const fetchMyIncidents = async () => {
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
        console.error('Error al cargar mis casos:', err);
        setError('No se pudieron cargar tus casos. Por favor intenta más tarde.');
        
        if ((window as any).showToast) {
          (window as any).showToast('error', 'Error al cargar tus casos');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyIncidents();

    // Escuchar evento cuando se asigna un nuevo caso
    const handleIncidentAssigned = (event: Event) => {
      const customEvent = event as CustomEvent;
      console.log('Evento incidentAssigned recibido en WorkerHistory:', customEvent.detail);
      // Recargar los incidentes después de un pequeño delay para dar tiempo al backend
      setTimeout(() => {
        console.log('Recargando mis casos después de asignación...');
        fetchMyIncidents();
      }, 300);
    };

    window.addEventListener('incidentAssigned', handleIncidentAssigned);

    return () => {
      window.removeEventListener('incidentAssigned', handleIncidentAssigned);
    };
  }, []);

  // Filtrar incidentes asignados al usuario actual
  const myIncidents = useMemo(() => {
    if (!currentUser) {
      console.log('No hay usuario actual, retornando array vacío');
      return [];
    }

    const userNombre = currentUser?.nombre || '';
    const userEmail = currentUser?.email || '';
    const userId = currentUser?.id || '';
    
    let filtered = incidentes.filter((inc) => {
      const assignedTo = (inc.atendidoPor || '').trim();
      
      if (!assignedTo) {
        return false;
      }
      
      // Comparar por nombre, email o ID (case insensitive)
      const assignedLower = assignedTo.toLowerCase();
      const nombreLower = userNombre.toLowerCase();
      const emailLower = userEmail.toLowerCase();
      
      const matches = 
        assignedLower === nombreLower ||
        assignedLower === emailLower ||
        assignedTo === userNombre ||
        assignedTo === userEmail ||
        assignedTo === userId ||
        (userId && assignedTo.includes(userId)) ||
        (userNombre && assignedTo.includes(userNombre)) ||
        (userEmail && assignedTo.includes(userEmail));
      
      return matches;
    });

    if (filters.estado) {
      filtered = filtered.filter((inc) => inc.estado === filters.estado);
    }
    if (filters.urgencia) {
      filtered = filtered.filter((inc) => inc.urgencia === filters.urgencia);
    }
    if (filters.tipo) {
      filtered = filtered.filter((inc) => inc.tipo === filters.tipo);
    }
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
  }, [filters, currentUser, incidentes]);

  // Cargar historial cuando se selecciona un incidente
  useEffect(() => {
    if (!selectedIncidentId) return;

    // Si ya tenemos el historial cargado, no volver a cargar
    if (incidentHistory[selectedIncidentId]) {
      return;
    }

    const fetchIncidentHistory = async () => {
      setLoadingHistory((prev) => ({ ...prev, [selectedIncidentId]: true }));
      
      try {
        const response = await apiClient.get(`/incidentes/${selectedIncidentId}/historial`);
        
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
              id: event.id || event._id || `hist-${selectedIncidentId}-${index}`,
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
          [selectedIncidentId]: timelineEvents,
        }));
      } catch (err: any) {
        console.error('Error al cargar historial del incidente:', err);
        
        let errorMessage = 'No se pudo cargar el historial del incidente.';
        if (err.response) {
          const status = err.response.status;
          if (status === 401) {
            errorMessage = 'No tienes permisos para ver el historial de este incidente.';
          } else if (status === 404) {
            errorMessage = 'El incidente no fue encontrado.';
          } else if (status === 403) {
            errorMessage = 'No tienes permisos para ver este historial.';
          } else if (status >= 500) {
            errorMessage = 'Error del servidor. Por favor intenta más tarde.';
          }
        }
        
        // Guardar array vacío para evitar intentar cargar de nuevo
        setIncidentHistory((prev) => ({
          ...prev,
          [selectedIncidentId]: [],
        }));

        if ((window as any).showToast) {
          (window as any).showToast('error', errorMessage);
        }
      } finally {
        setLoadingHistory((prev) => ({ ...prev, [selectedIncidentId]: false }));
      }
    };

    fetchIncidentHistory();
  }, [selectedIncidentId, incidentHistory]);

  const handleToggleHistory = (incidentId: string) => {
    if (selectedIncidentId === incidentId) {
      setSelectedIncidentId(null);
    } else {
      setSelectedIncidentId(incidentId);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Historial</h1>
        <p className="text-gray-600">Incidentes asignados a ti - Ver historial completo</p>
      </div>

      <FiltersPanel onFilterChange={setFilters} />

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="animate-spin h-12 w-12 text-primary-600 mx-auto mb-4" />
            <p className="text-gray-600">Cargando tus casos...</p>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      ) : myIncidents.length === 0 ? (
        <EmptyState
          icon={<FolderOpen size={64} className="text-gray-400" />}
          title="No tienes casos asignados"
          description="No hay incidentes asignados a tu cuenta en este momento."
        />
      ) : (
        <div className="space-y-6">
          {myIncidents.map((incident) => (
            <div key={incident.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {/* Card del incidente con botón para expandir/colapsar */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{incident.titulo}</h3>
                        <p className="text-sm text-gray-500">ID: {incident.id}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{incident.descripcion}</p>
                    <div className="flex flex-wrap gap-2">
                      <StatusBadge status={incident.estado} />
                      <UrgencyBadge urgency={incident.urgencia} />
                      <TypeBadge type={incident.tipo} />
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggleHistory(incident.id)}
                    className="flex-shrink-0 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                    aria-label={selectedIncidentId === incident.id ? 'Ocultar historial' : 'Mostrar historial'}
                  >
                    {selectedIncidentId === incident.id ? (
                      <ChevronUp size={20} />
                    ) : (
                      <ChevronDown size={20} />
                    )}
                  </button>
                </div>
              </div>

              {/* Historial del incidente */}
              {selectedIncidentId === incident.id && (
                <div className="bg-gray-50 p-6">
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

