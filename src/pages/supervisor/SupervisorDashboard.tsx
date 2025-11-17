// src/pages/supervisor/SupervisorDashboard.tsx
import { useState, useMemo, useEffect } from 'react';
import { reporteData } from '@/mocks/reportes';
import { Incident } from '@/utils/types';
import { SummaryCards } from '@/components/dashboard/SummaryCards';
import { FiltersPanel, FilterState } from '@/components/dashboard/FiltersPanel';
import { IncidentTable } from '@/components/incidents/IncidentTable';
import { IncidentDetailPanel } from '@/components/incidents/IncidentDetailPanel';
import { Pagination } from '@/components/common/Pagination';
import { KPI } from '@/utils/types';
import apiClient from '@/services/api';
import { Loader2 } from 'lucide-react';

export const SupervisorDashboard = () => {
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [incidentes, setIncidentes] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const itemsPerPage = 10;

  // Cargar incidentes del backend con query parameters
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

  // Calcular KPIs desde los incidentes cargados
  const kpis: KPI[] = useMemo(() => {
    const total = incidentes.length;
    const pendientes = incidentes.filter((inc) => inc.estado === 'pendiente').length;
    const resueltos = incidentes.filter((inc) => inc.estado === 'resuelto');
    const tiempoPromedio = resueltos.length > 0
      ? Math.round(
          resueltos
            .filter((inc) => inc.tiempoResolucion)
            .reduce((acc, inc) => acc + (inc.tiempoResolucion || 0), 0) / resueltos.length
        )
      : 0;
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
        label: 'Tiempo Promedio',
        value: tiempoPromedio > 0 ? `${tiempoPromedio} min` : 'N/A',
        change: -10,
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

  // Filtrar incidentes (solo búsqueda de texto, ya que los demás filtros se aplican en el backend)
  const filteredIncidents = useMemo(() => {
    let filtered = [...incidentes];

    // Solo aplicar filtro de búsqueda en el frontend (búsqueda de texto)
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

  // Paginación
  const paginatedIncidents = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredIncidents.slice(start, start + itemsPerPage);
  }, [filteredIncidents, currentPage]);

  const totalPages = Math.ceil(filteredIncidents.length / itemsPerPage);

  const handleViewIncident = (incident: Incident) => {
    setSelectedIncident(incident);
    setIsDetailOpen(true);
  };

  const handleAction = (action: string, incidentId: string) => {
    // NOTE: Aquí se integraría la llamada a la API
    console.log(`Action: ${action} on incident ${incidentId}`);
    if ((window as any).showToast) {
      (window as any).showToast('success', `Acción "${action}" ejecutada correctamente`);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Panel de Control</h1>
        <p className="text-gray-600">Gestiona y supervisa todos los incidentes del sistema</p>
      </div>

      <SummaryCards kpis={kpis} />

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
      ) : (
        <>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Mostrando {paginatedIncidents.length} de {filteredIncidents.length} incidentes
            </p>
          </div>

          <IncidentTable
            incidents={paginatedIncidents}
            onView={handleViewIncident}
            onAction={handleAction}
            userRole="supervisor"
          />
        </>
      )}

      {totalPages > 1 && (
        <div className="mt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      <IncidentDetailPanel
        incident={selectedIncident}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedIncident(null);
        }}
        userRole="supervisor"
        onAction={handleAction}
      />
    </div>
  );
};




