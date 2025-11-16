// src/components/incidents/IncidentTimeline.tsx
import { TimelineEvent } from '@/utils/types';
import { format } from 'date-fns';
import es from 'date-fns/locale/es';
import { 
  CheckCircle, 
  User, 
  MessageSquare, 
  Clock, 
  XCircle, 
  AlertCircle,
  FileCheck
} from 'lucide-react';
import { clsx } from 'clsx';

interface IncidentTimelineProps {
  events: TimelineEvent[];
}

export const IncidentTimeline: React.FC<IncidentTimelineProps> = ({ events }) => {
  const getEventIcon = (tipo: TimelineEvent['tipo']) => {
    const iconConfig = {
      creado: { icon: Clock, color: 'text-blue-600', bg: 'bg-blue-100' },
      asignado: { icon: User, color: 'text-purple-600', bg: 'bg-purple-100' },
      comentario: { icon: MessageSquare, color: 'text-gray-600', bg: 'bg-gray-100' },
      estado_cambiado: { icon: AlertCircle, color: 'text-yellow-600', bg: 'bg-yellow-100' },
      resuelto: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
      aprobado: { icon: FileCheck, color: 'text-green-600', bg: 'bg-green-100' },
      rechazado: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100' },
    };

    const config = iconConfig[tipo] || iconConfig.comentario;
    const Icon = config.icon;

    return (
      <div className={clsx('flex items-center justify-center w-10 h-10 rounded-full', config.bg)}>
        <Icon className={config.color} size={20} />
      </div>
    );
  };

  const getEventTitle = (event: TimelineEvent): string => {
    const tipo = event.tipo;
    const usuario = event.usuario || 'Sistema';
    const metadata = event.metadata || {};

    switch (tipo) {
      case 'creado':
        return `Incidente creado por ${usuario}`;
      case 'asignado':
        const asignadoA = metadata.asignadoA || metadata.asignado_a || metadata.assignedTo || metadata.asignadoPor || 'un trabajador';
        return `Asignado a ${asignadoA}`;
      case 'estado_cambiado':
        const nuevoEstado = metadata.nuevoEstado || metadata.nuevo_estado || metadata.newStatus || metadata.estado || 'nuevo estado';
        const estadoAnterior = metadata.estadoAnterior || metadata.estado_anterior || metadata.oldStatus || '';
        if (estadoAnterior) {
          return `Estado cambiado de "${estadoAnterior}" a "${nuevoEstado}"`;
        }
        return `Estado cambiado a "${nuevoEstado}"`;
      case 'resuelto':
        return `Incidente resuelto por ${usuario}`;
      case 'aprobado':
        return `Incidente aprobado por ${usuario}`;
      case 'rechazado':
        return `Incidente rechazado por ${usuario}`;
      case 'comentario':
        return event.descripcion || `Comentario de ${usuario}`;
      default:
        return event.descripcion || `Evento: ${tipo}`;
    }
  };

  const getEventDescription = (event: TimelineEvent): string | null => {
    const tipo = event.tipo;
    const descripcion = event.descripcion;
    const metadata = event.metadata || {};

    // Si hay una descripción explícita, usarla
    if (descripcion && descripcion.trim() !== '') {
      return descripcion;
    }

    // Generar descripciones basadas en el tipo y metadatos
    switch (tipo) {
      case 'creado':
        const titulo = metadata.titulo || metadata.title || '';
        const tipoIncidente = metadata.tipo || metadata.type || '';
        if (titulo) {
          return `Título: "${titulo}"${tipoIncidente ? ` | Tipo: ${tipoIncidente}` : ''}`;
        }
        return tipoIncidente ? `Tipo de incidente: ${tipoIncidente}` : null;
      case 'asignado':
        const asignadoA = metadata.asignadoA || metadata.asignado_a || metadata.assignedTo || metadata.asignadoPor || '';
        const asignadoPor = metadata.asignadoPor || metadata.asignado_por || metadata.assignedBy || '';
        if (asignadoPor && asignadoPor !== asignadoA) {
          return `Asignado por ${asignadoPor}`;
        }
        return null;
      case 'estado_cambiado':
        const razon = metadata.razon || metadata.reason || metadata.motivo || '';
        if (razon) {
          return `Razón: ${razon}`;
        }
        return null;
      case 'resuelto':
        const solucion = metadata.solucion || metadata.solution || metadata.resolucion || '';
        if (solucion) {
          return `Solución: ${solucion}`;
        }
        return 'El incidente ha sido marcado como resuelto.';
      case 'comentario':
        return descripcion || null;
      default:
        // Mostrar metadatos relevantes si existen
        const relevantMetadata = Object.entries(metadata)
          .filter(([key]) => !['id', '_id', 'timestamp', 'date', 'createdAt'].includes(key))
          .map(([key, value]) => `${key}: ${value}`)
          .join(' | ');
        return relevantMetadata || null;
    }
  };

  if (events.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No hay eventos en el timeline
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Línea vertical */}
      <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200" />

      <div className="space-y-6">
        {events.map((event) => (
          <div key={event.id} className="relative flex gap-4">
            {/* Icono */}
            <div className="relative z-10 flex-shrink-0">
              {getEventIcon(event.tipo)}
            </div>

            {/* Contenido */}
            <div className="flex-1 pb-6">
              <div className="rounded-lg border p-4 shadow-sm" style={{ backgroundColor: '#F2ECEC', borderColor: '#9C90FC' }}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="font-medium" style={{ color: '#132436' }}>
                      {getEventTitle(event)}
                    </p>
                    {getEventDescription(event) && (
                      <p className="text-sm mt-2" style={{ color: '#132436', opacity: 0.8 }}>
                        {getEventDescription(event)}
                      </p>
                    )}
                    {event.usuario && event.usuario !== 'Sistema' && (
                      <p className="text-xs mt-1" style={{ color: '#132436', opacity: 0.6 }}>
                        Por: {event.usuario}
                      </p>
                    )}
                  </div>
                  <span className="text-xs whitespace-nowrap ml-4" style={{ color: '#132436', opacity: 0.6 }}>
                    {format(event.fecha, 'dd MMM yyyy, HH:mm', { locale: es })}
                  </span>
                </div>
                {event.metadata && Object.keys(event.metadata).length > 0 && 
                 !getEventDescription(event) && (
                  <div className="mt-2 pt-2 border-t" style={{ borderColor: '#9C90FC' }}>
                    <div className="space-y-1">
                      {Object.entries(event.metadata)
                        .filter(([key]) => !['id', '_id', 'timestamp', 'date', 'createdAt'].includes(key))
                        .map(([key, value]) => (
                          <p key={key} className="text-xs" style={{ color: '#132436', opacity: 0.7 }}>
                            <span className="font-medium">{key}:</span> {String(value)}
                          </p>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

