// src/pages/worker/WorkerDashboard.tsx
import { useState, useMemo } from 'react';
import { incidentes } from '@/mocks/incidentes';
import { getCurrentUser } from '@/mocks/usuarios';
import { Incident } from '@/utils/types';
import { IncidentCard } from '@/components/incidents/IncidentCard';
import { IncidentDetailPanel } from '@/components/incidents/IncidentDetailPanel';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, getDay, addMonths, subMonths } from 'date-fns';
import es from 'date-fns/locale/es';
import { 
  BookOpen, 
  CheckCircle, 
  AlertCircle, 
  Search,
  Filter,
  Eye,
  MessageSquare,
  HelpCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import chicaImage from '@/assets/chica.png';

export const WorkerDashboard = () => {
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const currentUser = getCurrentUser();

  // Obtener casos pendientes y en proceso
  const myIncidents = useMemo(() => {
    return incidentes.filter((inc) => inc.atendidoPor === currentUser?.nombre);
  }, [currentUser]);

  const pendientes = myIncidents.filter((inc) => inc.estado === 'pendiente' || inc.estado === 'en_proceso').length;
  const nuevosHoy = myIncidents.filter((inc) => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    return inc.fechaReporte >= hoy;
  }).length;

  // Calendario
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Obtener el primer día del mes y llenar días anteriores
  const firstDayOfWeek = getDay(monthStart);
  const daysBeforeMonth = Array.from({ length: firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1 }, (_, i) => {
    const date = new Date(monthStart);
    date.setDate(date.getDate() - (firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1) + i);
    return date;
  });

  // Obtener incidentes por fecha para el calendario
  const incidentsByDate = useMemo(() => {
    const map: Record<string, Incident[]> = {};
    myIncidents.forEach((inc) => {
      const dateKey = format(inc.fechaReporte, 'yyyy-MM-dd');
      if (!map[dateKey]) {
        map[dateKey] = [];
      }
      map[dateKey].push(inc);
    });
    return map;
  }, [myIncidents]);

  const getIncidentsForDate = (date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    return incidentsByDate[dateKey] || [];
  };

  const handlePrevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mi Panel</h1>
        <p className="text-gray-600">Resumen de tus casos y actividades</p>
      </div>

      {/* Panel de Bienvenida y Resumen */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Panel de Bienvenida (Grande) */}
        <div className="lg:col-span-2 rounded-xl p-6 text-white relative overflow-visible" style={{ backgroundColor: '#E05A29' }}>
          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-2">
              {getGreeting()} {currentUser?.nombre?.split(' ')[0] || 'Usuario'}!
            </h2>
            <p className="text-lg mb-4 opacity-95">
              Bienvenido al sistema de gestión de incidentes de UTEC. Aquí podrás gestionar, supervisar y resolver todos los incidentes asignados a ti de manera eficiente y organizada.
            </p>
            <button
              onClick={() => window.location.href = '/trabajador/mis-casos'}
              className="text-white underline text-sm font-medium hover:opacity-80 transition-opacity"
            >
              Ver mis casos →
            </button>
          </div>
          {/* Imagen por encima de todo */}
          <div className="absolute -right-12 bottom-0 z-20">
            <img 
              src={chicaImage} 
              alt="Ilustración" 
              className="h-72 object-contain"
            />
          </div>
        </div>

        {/* Calendario */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Calendario</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevMonth}
                className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Mes anterior"
              >
                <ChevronLeft size={18} className="text-gray-600" />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Mes siguiente"
              >
                <ChevronRight size={18} className="text-gray-600" />
              </button>
            </div>
          </div>
          <div className="mb-4">
            <p className="text-lg font-semibold text-gray-900">
              {format(currentDate, 'MMMM yyyy', { locale: es })}
            </p>
          </div>
          
          {/* Días de la semana */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day) => (
              <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Días del calendario */}
          <div className="grid grid-cols-7 gap-1">
            {/* Días del mes anterior */}
            {daysBeforeMonth.map((date) => {
              const incidents = getIncidentsForDate(date);
              return (
                <div
                  key={date.toISOString()}
                  className="aspect-square p-1 text-gray-400 text-sm"
                >
                  <div className="h-full rounded-lg flex flex-col items-center justify-center">
                    <span>{format(date, 'd')}</span>
                  </div>
                </div>
              );
            })}
            
            {/* Días del mes actual */}
            {daysInMonth.map((date) => {
              const incidents = getIncidentsForDate(date);
              const isToday = isSameDay(date, new Date());
              const hasIncidents = incidents.length > 0;
              
              return (
                <div
                  key={date.toISOString()}
                  className="aspect-square p-1"
                >
                  <div
                    className={`h-full rounded-lg flex flex-col items-center justify-center text-sm transition-colors ${
                      hasIncidents ? 'cursor-pointer' : ''
                    } ${
                      isToday
                        ? 'font-bold text-white'
                        : hasIncidents
                        ? 'font-medium text-gray-900'
                        : 'text-gray-600'
                    } ${
                      isToday
                        ? 'hover:opacity-90'
                        : hasIncidents
                        ? 'hover:opacity-80'
                        : 'hover:bg-gray-100'
                    }`}
                    style={{
                      backgroundColor: isToday 
                        ? '#9C90FC' 
                        : hasIncidents 
                        ? '#FEF3C7' 
                        : 'transparent'
                    }}
                    onClick={() => hasIncidents && handleViewIncident(incidents[0])}
                    title={hasIncidents ? `${incidents.length} incidente(s)` : ''}
                  >
                    <span>{format(date, 'd')}</span>
                    {hasIncidents && (
                      <span className="text-xs mt-0.5 font-semibold" style={{ color: '#E05A29' }}>
                        {incidents.length}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Leyenda */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#9C90FC' }}></div>
                <span className="text-gray-600">Hoy</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#FEF3C7' }}></div>
                <span className="text-gray-600">Con incidentes</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progreso de Incidentes */}
      {myIncidents.length > 0 && (
        <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Progreso de Incidentes</h2>
            <button
              onClick={() => window.location.href = '/trabajador/mis-casos'}
              className="text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              style={{ color: '#E05A29', backgroundColor: '#F2ECEC' }}
            >
              Ver Todos
            </button>
          </div>
          <div className="space-y-3">
            {myIncidents.slice(0, 3).map((incident) => (
              <div key={incident.id} className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: '#F2ECEC' }}>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{incident.titulo}</p>
                  <p className="text-sm text-gray-600">
                    {format(incident.fechaReporte, 'dd MMM yyyy', { locale: es })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span 
                    className="px-3 py-1 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: incident.estado === 'resuelto' ? '#10B981' : incident.estado === 'en_proceso' ? '#F59E0B' : '#6B7280',
                      color: 'white'
                    }}
                  >
                    {incident.estado === 'resuelto' ? 'Resuelto' : incident.estado === 'en_proceso' ? 'En Proceso' : 'Pendiente'}
                  </span>
                  <button
                    onClick={() => handleViewIncident(incident)}
                    className="p-2 rounded-lg hover:opacity-80 transition-opacity"
                    style={{ color: '#9C90FC' }}
                  >
                    <Eye size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Guía de Uso */}
      <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <HelpCircle size={24} style={{ color: '#9C90FC' }} />
          <h2 className="text-xl font-semibold text-gray-900">Guía de Uso</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg border border-gray-200">
            <div className="flex items-start gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#F2ECEC' }}>
                <Search size={18} style={{ color: '#9C90FC' }} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Buscar Incidentes</h3>
                <p className="text-sm text-gray-600">
                  Usa la barra de búsqueda en la parte superior para encontrar incidentes por título, descripción o ID.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg border border-gray-200">
            <div className="flex items-start gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#F2ECEC' }}>
                <Filter size={18} style={{ color: '#9C90FC' }} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Filtrar Casos</h3>
                <p className="text-sm text-gray-600">
                  En "Mis Casos" puedes filtrar por estado, urgencia, tipo y fecha para encontrar casos específicos.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg border border-gray-200">
            <div className="flex items-start gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#F2ECEC' }}>
                <Eye size={18} style={{ color: '#9C90FC' }} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Ver Detalles</h3>
                <p className="text-sm text-gray-600">
                  Haz clic en "Ver" en cualquier tarjeta de incidente para ver todos los detalles, comentarios e historial.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg border border-gray-200">
            <div className="flex items-start gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#F2ECEC' }}>
                <CheckCircle size={18} style={{ color: '#9C90FC' }} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Resolver Casos</h3>
                <p className="text-sm text-gray-600">
                  Cuando completes un incidente, haz clic en "Resolver" en el panel de detalles para marcarlo como resuelto.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg border border-gray-200">
            <div className="flex items-start gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#F2ECEC' }}>
                <MessageSquare size={18} style={{ color: '#9C90FC' }} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Comentarios</h3>
                <p className="text-sm text-gray-600">
                  Puedes ver y agregar comentarios en el panel de detalles de cada incidente para mantener comunicación.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg border border-gray-200">
            <div className="flex items-start gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#F2ECEC' }}>
                <BookOpen size={18} style={{ color: '#9C90FC' }} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Historial</h3>
                <p className="text-sm text-gray-600">
                  Ve a la pestaña "Historial" para ver el historial completo de todos tus casos asignados con todos los eventos.
                </p>
              </div>
            </div>
          </div>
        </div>
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



