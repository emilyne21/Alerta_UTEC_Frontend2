// src/components/incidents/IncidentDetailPanel.tsx
import { X } from 'lucide-react';
import { Incident } from '@/utils/types';
import { StatusBadge, UrgencyBadge, TypeBadge } from '../common/Badge';
import { Button } from '../common/Button';
import { IncidentTimeline } from './IncidentTimeline';
import { generateTimeline } from '@/mocks/incidentes';
import { format } from 'date-fns';
import es from 'date-fns/locale/es';
import { useState } from 'react';
import { ConfirmDialog } from '../common/ConfirmDialog';

interface IncidentDetailPanelProps {
  incident: Incident | null;
  isOpen: boolean;
  onClose: () => void;
  userRole?: 'supervisor' | 'trabajador';
  onAction?: (action: string, incidentId: string) => void;
}

export const IncidentDetailPanel: React.FC<IncidentDetailPanelProps> = ({
  incident,
  isOpen,
  onClose,
  userRole = 'trabajador',
  onAction,
}) => {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  if (!incident || !isOpen) return null;

  const timeline = generateTimeline(incident);

  const handleAction = (action: string) => {
    setPendingAction(action);
    setShowConfirmDialog(true);
  };

  const confirmAction = () => {
    if (pendingAction && incident) {
      // NOTE: Aquí se integraría la llamada a la API
      onAction?.(pendingAction, incident.id);
      
      // Simular cambio visual
      if ((window as any).showToast) {
        (window as any).showToast('success', `Acción "${pendingAction}" ejecutada correctamente`);
      }
    }
    setShowConfirmDialog(false);
    setPendingAction(null);
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      aprobar: 'Aprobar',
      rechazar: 'Rechazar',
      asignar: 'Asignarme',
      resolver: 'Marcar como resuelto',
      recordatorio: 'Enviar recordatorio',
    };
    return labels[action] || action;
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-[100] transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className="fixed right-0 top-0 bottom-0 w-full max-w-2xl bg-white shadow-xl z-[101] transform transition-transform duration-300 ease-in-out overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{incident.titulo}</h2>
            <p className="text-sm text-gray-500 mt-1">ID: {incident.id}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
            aria-label="Cerrar panel"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Badges y estado */}
          <div className="flex flex-wrap gap-3">
            <StatusBadge status={incident.estado} />
            <UrgencyBadge urgency={incident.urgencia} />
            <TypeBadge type={incident.tipo} />
          </div>

          {/* Información básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Ubicación</label>
              <p className="text-gray-900 mt-1">{incident.ubicacion}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Reportado por</label>
              <p className="text-gray-900 mt-1">{incident.reportadoPor}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Asignado a</label>
              <p className="text-gray-900 mt-1">{incident.atendidoPor || 'Sin asignar'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Fecha de reporte</label>
              <p className="text-gray-900 mt-1">
                {format(incident.fechaReporte, 'dd MMM yyyy, HH:mm', { locale: es })}
              </p>
            </div>
            {incident.tiempoResolucion && (
              <div>
                <label className="text-sm font-medium text-gray-500">Tiempo de resolución</label>
                <p className="text-gray-900 mt-1">{incident.tiempoResolucion} minutos</p>
              </div>
            )}
          </div>

          {/* Descripción */}
          <div>
            <label className="text-sm font-medium text-gray-500">Descripción</label>
            <p className="text-gray-900 mt-2 whitespace-pre-wrap">{incident.descripcion}</p>
          </div>

          {/* Acciones (según rol) */}
          {userRole === 'supervisor' && (
            <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
              {incident.estado === 'pendiente' && (
                <>
                  <Button
                    variant="primary"
                    onClick={() => handleAction('aprobar')}
                  >
                    Aprobar
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => handleAction('rechazar')}
                  >
                    Rechazar
                  </Button>
                </>
              )}
              {incident.estado === 'en_proceso' && (
                <Button
                  variant="secondary"
                  onClick={() => handleAction('recordatorio')}
                >
                  Enviar recordatorio
                </Button>
              )}
            </div>
          )}

          {userRole === 'trabajador' && (
            <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
              {!incident.atendidoPor && (
                <Button
                  variant="primary"
                  onClick={() => handleAction('asignar')}
                >
                  Asignarme
                </Button>
              )}
              {/* Mostrar botón de resolver si está asignado y no está resuelto ni rechazado */}
              {incident.atendidoPor && 
               incident.estado !== 'resuelto' && 
               incident.estado !== 'rechazado' && (
                <Button
                  variant="primary"
                  onClick={() => handleAction('resolver')}
                  className="min-w-[120px]"
                >
                  Resolver
                </Button>
              )}
            </div>
          )}

          {/* Comentarios */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Comentarios</h3>
            <div className="space-y-3">
              {incident.comentarios.length === 0 ? (
                <p className="text-gray-500 text-sm">No hay comentarios aún</p>
              ) : (
                incident.comentarios.map((comment) => (
                  <div
                    key={comment.id}
                    className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="font-medium text-gray-900">{comment.autor}</span>
                      <span className="text-xs text-gray-500">
                        {format(comment.fecha, 'dd MMM yyyy, HH:mm', { locale: es })}
                      </span>
                    </div>
                    <p className="text-gray-700 text-sm">{comment.contenido}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Timeline */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Historial</h3>
            {timeline.length > 0 ? (
              <IncidentTimeline events={timeline} />
            ) : (
              <div className="text-center py-8 text-gray-500">
                No hay eventos en el historial
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showConfirmDialog}
        onClose={() => {
          setShowConfirmDialog(false);
          setPendingAction(null);
        }}
        onConfirm={confirmAction}
        title="Confirmar acción"
        message={`¿Estás seguro de que deseas ${getActionLabel(pendingAction || '')} este incidente?`}
        type={pendingAction === 'rechazar' ? 'danger' : 'warning'}
        confirmText="Confirmar"
        cancelText="Cancelar"
      />
    </>
  );
};

