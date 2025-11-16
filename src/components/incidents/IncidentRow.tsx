// src/components/incidents/IncidentRow.tsx
import { Incident } from '@/utils/types';
import { StatusBadge, UrgencyBadge, TypeBadge } from '../common/Badge';
import { format } from 'date-fns';
import es from 'date-fns/locale/es';
import { MoreVertical, Eye } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../common/Button';

interface IncidentRowProps {
  incident: Incident;
  onView: (incident: Incident) => void;
  onAction?: (action: string, incidentId: string) => void;
  userRole?: 'supervisor' | 'trabajador';
}

export const IncidentRow: React.FC<IncidentRowProps> = ({
  incident,
  onView,
  onAction,
  userRole = 'trabajador',
}) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <div>
            <p className="font-medium text-gray-900">{incident.id}</p>
            <p className="text-sm text-gray-500">{incident.titulo}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-4">
        <TypeBadge type={incident.tipo} />
      </td>
      <td className="px-4 py-4">
        <UrgencyBadge urgency={incident.urgencia} />
      </td>
      <td className="px-4 py-4">
        <StatusBadge status={incident.estado} />
      </td>
      <td className="px-4 py-4 text-sm text-gray-600">
        {incident.ubicacion}
      </td>
      <td className="px-4 py-4 text-sm text-gray-600">
        {incident.atendidoPor || 'Sin asignar'}
      </td>
      <td className="px-4 py-4 text-sm text-gray-600">
        {format(incident.fechaReporte, 'dd MMM yyyy', { locale: es })}
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onView(incident)}
            aria-label="Ver detalle"
          >
            <Eye size={16} />
          </Button>
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Más opciones"
            >
              <MoreVertical size={16} />
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                {userRole === 'supervisor' && incident.estado === 'pendiente' && (
                  <>
                    <button
                      onClick={() => {
                        onAction?.('aprobar', incident.id);
                        setShowMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Aprobar
                    </button>
                    <button
                      onClick={() => {
                        onAction?.('rechazar', incident.id);
                        setShowMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      Rechazar
                    </button>
                  </>
                )}
                {userRole === 'trabajador' && !incident.atendidoPor && (
                  <button
                    onClick={() => {
                      onAction?.('asignar', incident.id);
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Asignarme
                  </button>
                )}
                <button
                  onClick={() => {
                    onView(incident);
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Ver detalle
                </button>
              </div>
            )}
          </div>
        </div>
      </td>
    </tr>
  );
};

