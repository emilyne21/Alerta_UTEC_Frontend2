// src/components/incidents/IncidentCard.tsx
import { Incident } from '@/utils/types';
import { StatusBadge, UrgencyBadge, TypeBadge } from '../common/Badge';
import { format } from 'date-fns';
import es from 'date-fns/locale/es';
import { Button } from '../common/Button';
import { MapPin, User, Clock, Eye } from 'lucide-react';

interface IncidentCardProps {
  incident: Incident;
  onView: (incident: Incident) => void;
  onAction?: (action: string, incidentId: string) => void;
  userRole?: 'supervisor' | 'trabajador';
}

export const IncidentCard: React.FC<IncidentCardProps> = ({
  incident,
  onView,
  onAction,
  userRole = 'trabajador',
}) => {

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{incident.titulo}</h3>
          <p className="text-sm text-gray-500 mb-2">ID: {incident.id}</p>
        </div>
        <div className="flex flex-col gap-2 items-end">
          <StatusBadge status={incident.estado} />
          <UrgencyBadge urgency={incident.urgencia} />
        </div>
      </div>

      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{incident.descripcion}</p>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin size={16} className="text-gray-400" />
          <span>{incident.ubicacion}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <User size={16} className="text-gray-400" />
          <span>{incident.atendidoPor || 'Sin asignar'}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock size={16} className="text-gray-400" />
          <span>{format(incident.fechaReporte, 'dd MMM yyyy, HH:mm', { locale: es })}</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <TypeBadge type={incident.tipo} />
        <div className="flex gap-2">
          {userRole === 'trabajador' && !incident.atendidoPor && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => onAction?.('asignar', incident.id)}
            >
              Asignarme
            </Button>
          )}
          {/* Botón Resolver: solo para casos asignados al trabajador y que no estén resueltos */}
          {userRole === 'trabajador' && 
           incident.atendidoPor && 
           incident.estado !== 'resuelto' && 
           incident.estado !== 'rechazado' && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => onAction?.('resolver', incident.id)}
            >
              Resolver
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onView(incident)}
          >
            <Eye size={16} className="mr-1" />
            Ver
          </Button>
        </div>
      </div>
    </div>
  );
};

