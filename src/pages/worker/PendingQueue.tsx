// src/pages/worker/PendingQueue.tsx
import { useState, useMemo, useEffect } from 'react';
import { Incident } from '@/utils/types';
import { IncidentCard } from '@/components/incidents/IncidentCard';
import { IncidentDetailPanel } from '@/components/incidents/IncidentDetailPanel';
import { FiltersPanel, FilterState } from '@/components/dashboard/FiltersPanel';
import { EmptyState } from '@/components/common/EmptyState';
import { Clock, Loader2 } from 'lucide-react';
import apiClient from '@/services/api';

export const PendingQueue = () => {
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({});
  const [incidentes, setIncidentes] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar incidentes del backend
  useEffect(() => {
    const fetchIncidents = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        console.log('Fetching incidents from:', '/incidentes');
        const response = await apiClient.get('/incidentes');
        
        console.log('Response status:', response.status);
        console.log('Response data:', response.data);
        console.log('Response data type:', typeof response.data);
        console.log('Is array?', Array.isArray(response.data));
        
        // Verificar si la respuesta es un array o está dentro de un objeto
        let incidentsData = response.data;
        if (!Array.isArray(incidentsData)) {
          // Si no es un array, puede estar en una propiedad como 'data', 'incidentes', 'incidents', etc.
          if (incidentsData.data && Array.isArray(incidentsData.data)) {
            incidentsData = incidentsData.data;
          } else if (incidentsData.incidentes && Array.isArray(incidentsData.incidentes)) {
            incidentsData = incidentsData.incidentes;
          } else if (incidentsData.incidents && Array.isArray(incidentsData.incidents)) {
            incidentsData = incidentsData.incidents;
          } else {
            console.warn('Response data is not an array and no array property found:', incidentsData);
            setError('Formato de respuesta inesperado del servidor');
            setIsLoading(false);
            return;
          }
        }
        
        console.log('Processing incidents array, length:', incidentsData.length);
        
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
        
        console.log('Normalized incidents:', incidents);
        console.log('Total incidents after normalization:', incidents.length);
        
        setIncidentes(incidents);
      } catch (err: any) {
        console.error('Error al cargar incidentes:', err);
        console.error('Error response:', err.response);
        console.error('Error request:', err.request);
        
        let errorMessage = 'No se pudieron cargar los incidentes. Por favor intenta más tarde.';
        
        if (err.response) {
          const status = err.response.status;
          const message = err.response.data?.message || err.response.data?.error;
          
          if (status === 401) {
            errorMessage = 'Sesión expirada. Por favor inicia sesión nuevamente.';
          } else if (status === 403) {
            errorMessage = 'No tienes permisos para ver los incidentes.';
          } else if (status === 404) {
            errorMessage = 'Endpoint no encontrado. Verifica la configuración del servidor.';
          } else if (status >= 500) {
            errorMessage = 'Error del servidor. Por favor intenta más tarde.';
          } else if (message) {
            errorMessage = message;
          }
        } else if (err.request) {
          errorMessage = 'No se pudo conectar al servidor. Verifica tu conexión a internet.';
        }
        
        setError(errorMessage);
        
        if ((window as any).showToast) {
          (window as any).showToast('error', errorMessage);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchIncidents();
    
    // Recargar la lista cada 10 segundos para que otros trabajadores vean los cambios
    const interval = setInterval(() => {
      fetchIncidents();
    }, 10000); // 10 segundos
    
    return () => {
      clearInterval(interval);
    };
  }, []);

  // Escuchar cuando alguien se asigna un caso para actualizar la lista
  useEffect(() => {
    const handleIncidentAssigned = (event: CustomEvent) => {
      console.log('Evento incidentAssigned recibido:', event.detail);
      // Recargar la lista de incidentes para reflejar los cambios
      const fetchIncidents = async () => {
        try {
          const response = await apiClient.get('/incidentes');
          
          let incidentsData = response.data;
          if (!Array.isArray(incidentsData)) {
            if (incidentsData.data && Array.isArray(incidentsData.data)) {
              incidentsData = incidentsData.data;
            } else if (incidentsData.incidentes && Array.isArray(incidentsData.incidentes)) {
              incidentsData = incidentsData.incidentes;
            } else if (incidentsData.incidents && Array.isArray(incidentsData.incidents)) {
              incidentsData = incidentsData.incidents;
            } else {
              return;
            }
          }
          
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
          console.log('Lista de incidentes actualizada después de asignación');
        } catch (err) {
          console.error('Error al recargar incidentes después de asignación:', err);
        }
      };
      
      fetchIncidents();
    };

    window.addEventListener('incidentAssigned', handleIncidentAssigned as EventListener);
    
    return () => {
      window.removeEventListener('incidentAssigned', handleIncidentAssigned as EventListener);
    };
  }, []);

  // Filtrar incidentes pendientes y sin asignar (por defecto)
  // Pero permitir filtrar por estado si el usuario lo selecciona
  const pendingIncidents = useMemo(() => {
    let filtered = incidentes.filter(
      (inc) => {
        // Si hay un filtro de estado específico, usarlo
        if (filters.estado) {
          return inc.estado === filters.estado && !inc.atendidoPor;
        }
        // Por defecto, solo mostrar pendientes sin asignar
        return inc.estado === 'pendiente' && !inc.atendidoPor;
      }
    );

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

    // Ordenar por urgencia (crítica primero)
    const urgencyOrder = { critica: 4, alta: 3, media: 2, baja: 1 };
    filtered.sort((a, b) => urgencyOrder[b.urgencia] - urgencyOrder[a.urgencia]);

    return filtered;
  }, [filters, incidentes]);

  const handleViewIncident = (incident: Incident) => {
    setSelectedIncident(incident);
    setIsDetailOpen(true);
  };

  const handleAction = async (action: string, incidentId: string) => {
    if (action === 'asignar') {
      try {
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        console.log('=== ASIGNANDO INCIDENTE ===');
        console.log('Incidente ID:', incidentId);
        console.log('Usuario completo:', currentUser);
        console.log('Nombre:', currentUser.nombre);
        console.log('Email:', currentUser.email);
        console.log('ID:', currentUser.id);
        
        // Intentar enviar tanto nombre como email para que el backend pueda usar cualquiera
        const assignData: any = {};
        if (currentUser.nombre) {
          assignData.atendidoPor = currentUser.nombre;
        }
        if (currentUser.email) {
          assignData.atendidoEmail = currentUser.email;
        }
        if (currentUser.id) {
          assignData.atendidoId = currentUser.id;
        }
        
        // Llamar al backend para asignar el incidente
        const response = await apiClient.patch(`/incidentes/${incidentId}/asignar`, assignData);

        console.log('=== RESPUESTA DEL BACKEND ===');
        console.log('Status:', response.status);
        console.log('Data completa:', response.data);
        console.log('Incidente actualizado:', response.data?.incidente || response.data);
        
        // Verificar qué formato devuelve el backend
        const updatedIncident = response.data?.incidente || response.data;
        if (updatedIncident) {
          console.log('Campo atendidoPor en respuesta:', updatedIncident.atendidoPor);
          console.log('Campo asignadoA en respuesta:', updatedIncident.asignadoA);
          console.log('Campo assignedTo en respuesta:', updatedIncident.assignedTo);
          console.log('Campo asignado_a en respuesta:', updatedIncident.asignado_a);
        }

        // Actualizar el estado local removiendo el incidente asignado
        setIncidentes((prev) => {
          const updated = prev.filter((inc) => inc.id !== incidentId);
          console.log('Incidentes actualizados en PendingQueue:', updated.length);
          return updated;
        });

        // Cerrar el panel de detalle si está abierto
        if (selectedIncident?.id === incidentId) {
          setIsDetailOpen(false);
          setSelectedIncident(null);
        }

        // Disparar evento personalizado para notificar que se asignó un caso
        console.log('Disparando evento incidentAssigned');
        window.dispatchEvent(new CustomEvent('incidentAssigned', { 
          detail: { incidentId, user: currentUser } 
        }));

        // También forzar un pequeño delay y luego disparar el evento nuevamente para asegurar
        setTimeout(() => {
          console.log('Re-disparando evento incidentAssigned después de delay');
          window.dispatchEvent(new CustomEvent('incidentAssigned', { 
            detail: { incidentId, user: currentUser } 
          }));
        }, 500);

        if ((window as any).showToast) {
          (window as any).showToast('success', `Te has asignado al incidente ${incidentId}`);
        }
      } catch (err: any) {
        console.error('Error al asignar incidente:', err);
        let errorMessage = 'No se pudo asignar el incidente. Por favor intenta nuevamente.';
        
        if (err.response) {
          const status = err.response.status;
          const message = err.response.data?.message || err.response.data?.error;
          
          if (status === 404) {
            errorMessage = 'El incidente no fue encontrado.';
          } else if (status === 409) {
            errorMessage = 'Este incidente ya está asignado a otro trabajador.';
          } else if (message) {
            errorMessage = message;
          }
        }
        
        if ((window as any).showToast) {
          (window as any).showToast('error', errorMessage);
        }
      }
    } else {
      console.log(`Action: ${action} on incident ${incidentId}`);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Cola de Pendientes</h1>
        <p className="text-gray-600">Incidentes pendientes disponibles para asignación</p>
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
      ) : pendingIncidents.length === 0 ? (
        <EmptyState
          icon={<Clock size={64} className="text-gray-400" />}
          title="No hay incidentes pendientes"
          description="Todos los incidentes pendientes han sido asignados o no hay nuevos casos en la cola."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pendingIncidents.map((incident) => (
            <IncidentCard
              key={incident.id}
              incident={incident}
              onView={handleViewIncident}
              onAction={handleAction}
              userRole="trabajador"
            />
          ))}
        </div>
      )}

      <IncidentDetailPanel
        incident={selectedIncident}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedIncident(null);
        }}
        userRole="trabajador"
        onAction={handleAction}
      />
    </div>
  );
};



