// src/components/dashboard/FiltersPanel.tsx
import { useState } from 'react';
import { Filter, X } from 'lucide-react';
import { Button } from '../common/Button';
import { IncidentStatus, IncidentUrgency, IncidentType } from '@/utils/types';
import { clsx } from 'clsx';

interface FiltersPanelProps {
  onFilterChange: (filters: FilterState) => void;
  className?: string;
}

export interface FilterState {
  estado?: IncidentStatus;
  urgencia?: IncidentUrgency;
  tipo?: IncidentType;
  fechaDesde?: string;
  fechaHasta?: string;
  busqueda?: string;
}

export const FiltersPanel: React.FC<FiltersPanelProps> = ({ onFilterChange, className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({});

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const emptyFilters: FilterState = {};
    setFilters(emptyFilters);
    onFilterChange(emptyFilters);
  };

  const hasActiveFilters = Object.values(filters).some((v) => v !== undefined && v !== '');

  return (
    <div className={clsx('mb-4', className)}>
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Filter size={16} />
          Filtros
          {hasActiveFilters && (
            <span className="ml-1 px-2 py-0.5 bg-primary-600 text-white text-xs rounded-full">
              {Object.values(filters).filter((v) => v !== undefined && v !== '').length}
            </span>
          )}
        </button>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X size={16} className="mr-1" />
            Limpiar
          </Button>
        )}
      </div>

      {isOpen && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado
              </label>
              <select
                value={filters.estado || ''}
                onChange={(e) => handleFilterChange('estado', e.target.value || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Todos</option>
                <option value="pendiente">Pendiente</option>
                <option value="en_proceso">En Proceso</option>
                <option value="resuelto">Resuelto</option>
                <option value="rechazado">Rechazado</option>
                <option value="aprobado">Aprobado</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Urgencia
              </label>
              <select
                value={filters.urgencia || ''}
                onChange={(e) => handleFilterChange('urgencia', e.target.value || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Todas</option>
                <option value="baja">Baja</option>
                <option value="media">Media</option>
                <option value="alta">Alta</option>
                <option value="critica">Crítica</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo
              </label>
              <select
                value={filters.tipo || ''}
                onChange={(e) => handleFilterChange('tipo', e.target.value || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Todos</option>
                <option value="infraestructura">Infraestructura</option>
                <option value="seguridad">Seguridad</option>
                <option value="software">Software</option>
                <option value="hardware">Hardware</option>
                <option value="red">Red</option>
                <option value="otro">Otro</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha desde
              </label>
              <input
                type="date"
                value={filters.fechaDesde || ''}
                onChange={(e) => handleFilterChange('fechaDesde', e.target.value || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha hasta
              </label>
              <input
                type="date"
                value={filters.fechaHasta || ''}
                onChange={(e) => handleFilterChange('fechaHasta', e.target.value || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};



