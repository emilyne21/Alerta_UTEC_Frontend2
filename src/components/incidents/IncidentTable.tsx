// src/components/incidents/IncidentTable.tsx
import { Incident } from '@/utils/types';
import { IncidentRow } from './IncidentRow';
import { SkeletonTable } from '../common/Skeleton';
import { EmptyState } from '../common/EmptyState';

interface IncidentTableProps {
  incidents: Incident[];
  isLoading?: boolean;
  onView: (incident: Incident) => void;
  onAction?: (action: string, incidentId: string) => void;
  userRole?: 'supervisor' | 'trabajador';
}

export const IncidentTable: React.FC<IncidentTableProps> = ({
  incidents,
  isLoading = false,
  onView,
  onAction,
  userRole = 'trabajador',
}) => {
  if (isLoading) {
    return <SkeletonTable />;
  }

  if (incidents.length === 0) {
    return (
      <EmptyState
        title="No hay incidentes"
        description="No se encontraron incidentes que coincidan con los filtros aplicados."
      />
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Incidente
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Urgencia
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ubicación
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Asignado
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {incidents.map((incident) => (
              <IncidentRow
                key={incident.id}
                incident={incident}
                onView={onView}
                onAction={onAction}
                userRole={userRole}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};




