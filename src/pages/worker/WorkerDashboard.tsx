// src/pages/worker/WorkerDashboard.tsx
import { useState, useMemo } from 'react';
import { incidentes } from '@/mocks/incidentes';
import { getCurrentUser } from '@/mocks/usuarios';
import { Incident } from '@/utils/types';
import { SummaryCards } from '@/components/dashboard/SummaryCards';
import { IncidentCard } from '@/components/incidents/IncidentCard';
import { IncidentDetailPanel } from '@/components/incidents/IncidentDetailPanel';
import { KPI } from '@/utils/types';

export const WorkerDashboard = () => {
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const currentUser = getCurrentUser();

  // Calcular KPIs para trabajador
  const kpis: KPI[] = useMemo(() => {
    const myIncidents = incidentes.filter((inc) => inc.atendidoPor === currentUser?.nombre);
    const enProceso = myIncidents.filter((inc) => inc.estado === 'en_proceso').length;
    const resueltos = myIncidents.filter((inc) => inc.estado === 'resuelto').length;
    const promedioTiempo = myIncidents
      .filter((inc) => inc.tiempoResolucion)
      .reduce((acc, inc) => acc + (inc.tiempoResolucion || 0), 0) / resueltos || 0;

    return [
      {
        label: 'Mis Casos',
        value: myIncidents.length,
      },
      {
        label: 'En Proceso',
        value: enProceso,
      },
      {
        label: 'Resueltos',
        value: resueltos,
      },
      {
        label: 'Tiempo Promedio',
        value: promedioTiempo > 0 ? `${Math.round(promedioTiempo)} min` : 'N/A',
      },
    ];
  }, [currentUser]);

  // Obtener casos recientes
  const recentCases = useMemo(() => {
    return incidentes
      .filter((inc) => inc.atendidoPor === currentUser?.nombre)
      .sort((a, b) => b.fechaActualizacion.getTime() - a.fechaActualizacion.getTime())
      .slice(0, 6);
  }, [currentUser]);

  const handleViewIncident = (incident: Incident) => {
    setSelectedIncident(incident);
    setIsDetailOpen(true);
  };

  const handleAction = (action: string, incidentId: string) => {
    // NOTE: Aquí se integraría la llamada a la API
    console.log(`Action: ${action} on incident ${incidentId}`);
    if ((window as any).showToast) {
      (window as any).showToast('success', `Acción ejecutada correctamente`);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mi Panel</h1>
        <p className="text-gray-600">Resumen de tus casos y actividades</p>
      </div>

      <SummaryCards kpis={kpis} />

      <div className="mt-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Casos Recientes</h2>
        {recentCases.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <p className="text-gray-500">No tienes casos asignados aún</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentCases.map((incident) => (
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
      </div>

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



