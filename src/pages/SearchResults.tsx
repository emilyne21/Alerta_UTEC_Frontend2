// src/pages/SearchResults.tsx
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Incident } from '@/utils/types';
import { IncidentTable } from '@/components/incidents/IncidentTable';
import { IncidentDetailPanel } from '@/components/incidents/IncidentDetailPanel';
import { Loader2 } from 'lucide-react';
import apiClient from '@/services/api';
import { NotFound } from './NotFound';

export const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [incidentes, setIncidentes] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setIsLoading(false);
      setIncidentes([]);
      return;
    }

    const searchIncidents = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Buscar incidentes - intentar buscar por ID primero, luego por texto
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
        
        // Normalizar y filtrar los datos
        const allIncidents = incidentsData.map((inc: any, index: number) => {
          try {
            return {
              id: inc.id || inc._id || `inc-${index}-${Date.now()}`,
              titulo: inc.titulo || inc.title || inc.descripcion || inc.description || '',
              descripcion: inc.descripcion || inc.description || '',
              tipo: (inc.tipo || inc.type || 'otro') as Incident['tipo'],
              urgencia: (inc.urgencia || inc.urgency || 'media') as Incident['urgencia'],
              estado: (() => {
                const estado = inc.estado || inc.status || 'pendiente';
                if (estado === 'en_atencion') {
                  return 'en_proceso' as Incident['estado'];
                }
                return estado as Incident['estado'];
              })(),
              ubicacion: inc.ubicacion || inc.location || '',
              reportadoPor: inc.reportadoPor || inc.reportedBy || inc.reportado_por || '',
              atendidoPor: (() => {
                const assigned = inc.atendidoPor || inc.asignadoA || inc.assignedTo || inc.asignado_a;
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
        
        // Filtrar por término de búsqueda
        const searchLower = query.toLowerCase().trim();
        const filtered = allIncidents.filter((inc) => {
          return (
            inc.id.toLowerCase().includes(searchLower) ||
            inc.titulo.toLowerCase().includes(searchLower) ||
            inc.descripcion.toLowerCase().includes(searchLower) ||
            inc.ubicacion.toLowerCase().includes(searchLower) ||
            inc.reportadoPor.toLowerCase().includes(searchLower) ||
            (inc.atendidoPor && inc.atendidoPor.toLowerCase().includes(searchLower))
          );
        });
        
        setIncidentes(filtered);
      } catch (err: any) {
        console.error('Error al buscar incidentes:', err);
        setError('Error al realizar la búsqueda. Por favor intenta más tarde.');
      } finally {
        setIsLoading(false);
      }
    };

    searchIncidents();
  }, [query]);

  const handleViewIncident = (incident: Incident) => {
    setSelectedIncident(incident);
    setIsDetailOpen(true);
  };

  const handleAction = (action: string, incidentId: string) => {
    console.log(`Action: ${action} on incident ${incidentId}`);
    if ((window as any).showToast) {
      (window as any).showToast('success', `Acción "${action}" ejecutada correctamente`);
    }
  };

  // Si no hay query, redirigir a 404
  if (!query.trim()) {
    return <NotFound />;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Resultados de Búsqueda</h1>
        <p className="text-gray-600">
          {isLoading ? 'Buscando...' : `Se encontraron ${incidentes.length} resultado(s) para "${query}"`}
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="animate-spin h-12 w-12 text-primary-600 mx-auto mb-4" />
            <p className="text-gray-600">Buscando incidentes...</p>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      ) : incidentes.length === 0 ? (
        <NotFound />
      ) : (
        <>
          <IncidentTable
            incidents={incidentes}
            onView={handleViewIncident}
            onAction={handleAction}
            userRole="supervisor"
          />

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
        </>
      )}
    </div>
  );
};

