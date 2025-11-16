// src/pages/supervisor/SupervisorDashboard.tsx
import { useState, useMemo } from 'react';
import { incidentes } from '@/mocks/incidentes';
import { reporteData } from '@/mocks/reportes';
import { Incident } from '@/utils/types';
import { SummaryCards } from '@/components/dashboard/SummaryCards';
import { FiltersPanel, FilterState } from '@/components/dashboard/FiltersPanel';
import { IncidentTable } from '@/components/incidents/IncidentTable';
import { IncidentDetailPanel } from '@/components/incidents/IncidentDetailPanel';
import { Pagination } from '@/components/common/Pagination';
import { KPI } from '@/utils/types';

export const SupervisorDashboard = () => {
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Calcular KPIs desde datos mock
  const kpis: KPI[] = useMemo(() => {
    return [
      {
        label: 'Incidentes Totales',
        value: reporteData.totalIncidentes,
        change: 5,
        trend: 'up',
      },
      {
        label: 'Pendientes',
        value: reporteData.pendientes,
        change: -2,
        trend: 'down',
      },
      {
        label: 'Tiempo Promedio',
        value: `${reporteData.tiempoPromedioResolucion} min`,
        change: -10,
        trend: 'down',
      },
      {
        label: 'Casos Críticos',
        value: reporteData.casosCriticos,
        change: 1,
        trend: 'up',
      },
    ];
  }, []);

  // Filtrar incidentes
  const filteredIncidents = useMemo(() => {
    let filtered = [...incidentes];

    if (filters.estado) {
      filtered = filtered.filter((inc) => inc.estado === filters.estado);
    }
    if (filters.urgencia) {
      filtered = filtered.filter((inc) => inc.urgencia === filters.urgencia);
    }
    if (filters.tipo) {
      filtered = filtered.filter((inc) => inc.tipo === filters.tipo);
    }
    if (filters.fechaDesde) {
      const desde = new Date(filters.fechaDesde);
      filtered = filtered.filter((inc) => inc.fechaReporte >= desde);
    }
    if (filters.fechaHasta) {
      const hasta = new Date(filters.fechaHasta);
      hasta.setHours(23, 59, 59, 999);
      filtered = filtered.filter((inc) => inc.fechaReporte <= hasta);
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
  }, [filters]);

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




