// src/pages/worker/MyCases.tsx
import { useState, useMemo, useEffect } from 'react';
import { getCurrentUser } from '@/mocks/usuarios';
import { Incident } from '@/utils/types';
import { IncidentCard } from '@/components/incidents/IncidentCard';
import { IncidentDetailPanel } from '@/components/incidents/IncidentDetailPanel';
import { FiltersPanel, FilterState } from '@/components/dashboard/FiltersPanel';
import { EmptyState } from '@/components/common/EmptyState';
import { FolderOpen, Loader2 } from 'lucide-react';
import apiClient from '@/services/api';

export const MyCases = () => {
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
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
      console.log('Evento incidentAssigned recibido en MyCases:', customEvent.detail);
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
    
    console.log('=== FILTRANDO MIS CASOS ===');
    console.log('Usuario actual:', currentUser);
    console.log('Nombre:', userNombre);
    console.log('Email:', userEmail);
    console.log('ID:', userId);
    console.log('Total incidentes a filtrar:', incidentes.length);
    
    // Mostrar todos los incidentes y sus asignados para debug
    console.log('Todos los incidentes con atendidoPor:');
    incidentes.forEach((inc) => {
      console.log(`  - ID: ${inc.id}, AtendidoPor: "${inc.atendidoPor || 'NO ASIGNADO'}", Estado: ${inc.estado}`);
    });
    
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
      
      if (matches) {
        console.log(`✓ Caso asignado encontrado: ${inc.id}, AtendidoPor: "${assignedTo}"`);
      }
      
      return matches;
    });
    
    console.log(`=== RESULTADO: ${filtered.length} casos encontrados ===`);
    if (filtered.length > 0) {
      filtered.forEach((inc) => {
        console.log(`  - ${inc.id}: ${inc.titulo} (Atendido por: "${inc.atendidoPor}")`);
      });
    }

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

  const handleViewIncident = (incident: Incident) => {
    console.log('handleViewIncident llamado con:', incident);
    setSelectedIncident(incident);
    setIsDetailOpen(true);
    console.log('Estado actualizado - selectedIncident:', incident, 'isDetailOpen: true');
  };

  const handleAction = async (action: string, incidentId: string) => {
    if (action === 'resolver') {
      try {
        console.log('Resolviendo incidente:', incidentId);
        
        // Llamar al backend para resolver el incidente
        const response = await apiClient.patch(`/incidentes/${incidentId}/resolver`);

        console.log('Respuesta del backend al resolver:', response.data);

        // Obtener el incidente actualizado de la respuesta del backend
        const updatedIncident = response.data?.incidente || response.data;
        
        // Normalizar el incidente actualizado
        let normalizedIncident: Incident | null = null;
        if (updatedIncident) {
          normalizedIncident = {
            id: updatedIncident.id || updatedIncident._id || incidentId,
            titulo: updatedIncident.titulo || updatedIncident.title || 'Sin título',
            descripcion: updatedIncident.descripcion || updatedIncident.description || '',
            tipo: (updatedIncident.tipo || updatedIncident.type || 'otro') as Incident['tipo'],
            urgencia: (updatedIncident.urgencia || updatedIncident.urgency || 'media') as Incident['urgencia'],
            estado: (updatedIncident.estado || updatedIncident.status || 'resuelto') as Incident['estado'],
            ubicacion: updatedIncident.ubicacion || updatedIncident.location || '',
            reportadoPor: updatedIncident.reportadoPor || updatedIncident.reportedBy || updatedIncident.reportado_por || '',
            atendidoPor: updatedIncident.atendidoPor || updatedIncident.asignadoA || updatedIncident.assignedTo || updatedIncident.asignado_a || undefined,
            fechaReporte: updatedIncident.fechaReporte ? new Date(updatedIncident.fechaReporte) : new Date(updatedIncident.fecha_reporte || updatedIncident.createdAt || updatedIncident.created_at || Date.now()),
            fechaActualizacion: updatedIncident.fechaActualizacion ? new Date(updatedIncident.fechaActualizacion) : new Date(updatedIncident.fecha_actualizacion || updatedIncident.updatedAt || updatedIncident.updated_at || Date.now()),
            fechaResolucion: updatedIncident.fechaResolucion ? new Date(updatedIncident.fechaResolucion) : (updatedIncident.fecha_resolucion || updatedIncident.resolvedAt || updatedIncident.resolved_at ? new Date(updatedIncident.fecha_resolucion || updatedIncident.resolvedAt || updatedIncident.resolved_at) : new Date()),
            comentarios: updatedIncident.comentarios || updatedIncident.comments || [],
            evidencias: updatedIncident.evidencias || updatedIncident.evidence || [],
            tiempoResolucion: updatedIncident.tiempoResolucion || updatedIncident.resolutionTime || undefined,
          };
        }

        // Actualizar el estado local del incidente resuelto
        setIncidentes((prev) => 
          prev.map((inc) => 
            inc.id === incidentId 
              ? normalizedIncident || {
                  ...inc, 
                  estado: 'resuelto' as const,
                  fechaResolucion: new Date(),
                  fechaActualizacion: new Date(),
                }
              : inc
          )
        );

        // Actualizar el incidente seleccionado si está abierto
        if (selectedIncident?.id === incidentId) {
          if (normalizedIncident) {
            setSelectedIncident(normalizedIncident);
          } else {
            setSelectedIncident({
              ...selectedIncident,
              estado: 'resuelto' as const,
              fechaResolucion: new Date(),
              fechaActualizacion: new Date(),
            });
          }
        }

        // Disparar evento personalizado para notificar que se resolvió un caso
        window.dispatchEvent(new CustomEvent('incidentResolved', { 
          detail: { incidentId } 
        }));

        if ((window as any).showToast) {
          (window as any).showToast('success', `Incidente ${incidentId} marcado como resuelto`);
        }
      } catch (err: any) {
        console.error('Error al resolver incidente:', err);
        let errorMessage = 'No se pudo resolver el incidente. Por favor intenta nuevamente.';
        
        if (err.response) {
          const status = err.response.status;
          const message = err.response.data?.message || err.response.data?.error;
          
          if (status === 401) {
            errorMessage = 'No tienes permisos para resolver este incidente.';
          } else if (status === 404) {
            errorMessage = 'El incidente no fue encontrado.';
          } else if (status === 403) {
            errorMessage = 'Solo el trabajador asignado puede resolver este incidente.';
          } else if (status >= 500) {
            errorMessage = 'Error del servidor. Por favor intenta más tarde.';
          } else if (message) {
            errorMessage = message;
          }
        } else if (err.request) {
          errorMessage = 'No se pudo conectar al servidor. Verifica tu conexión a internet.';
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mis Casos</h1>
        <p className="text-gray-600">Incidentes asignados a ti</p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {myIncidents.map((incident) => (
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
          console.log('Cerrando panel de detalles');
          setIsDetailOpen(false);
          setSelectedIncident(null);
        }}
        userRole="trabajador"
        onAction={handleAction}
      />
    </div>
  );
};



