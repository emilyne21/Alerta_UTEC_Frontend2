// src/pages/supervisor/SupervisorReports.tsx
import { reporteData } from '@/mocks/reportes';
import { SummaryCards } from '@/components/dashboard/SummaryCards';
import { KPI } from '@/utils/types';

export const SupervisorReports = () => {
  const kpis: KPI[] = [
    {
      label: 'Incidentes Totales',
      value: reporteData.totalIncidentes,
    },
    {
      label: 'Pendientes',
      value: reporteData.pendientes,
    },
    {
      label: 'Tiempo Promedio',
      value: `${reporteData.tiempoPromedioResolucion} min`,
    },
    {
      label: 'Casos Críticos',
      value: reporteData.casosCriticos,
    },
  ];

  // Calcular altura máxima para gráficos
  const maxTipo = Math.max(...reporteData.distribucionPorTipo.map((d) => d.cantidad));
  const maxUbicacion = Math.max(...reporteData.distribucionPorUbicacion.map((d) => d.cantidad));

  const tipoLabels: Record<string, string> = {
    infraestructura: 'Infraestructura',
    seguridad: 'Seguridad',
    software: 'Software',
    hardware: 'Hardware',
    red: 'Red',
    otro: 'Otro',
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Reportes y Estadísticas</h1>
        <p className="text-gray-600">Análisis de incidentes y métricas del sistema</p>
      </div>

      <SummaryCards kpis={kpis} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Gráfico de distribución por tipo */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Distribución por Tipo
          </h2>
          <div className="space-y-4">
            {reporteData.distribucionPorTipo.map((item) => {
              const percentage = (item.cantidad / maxTipo) * 100;
              return (
                <div key={item.tipo}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">
                      {tipoLabels[item.tipo]}
                    </span>
                    <span className="text-sm text-gray-600">{item.cantidad}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-primary-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                      role="progressbar"
                      aria-valuenow={item.cantidad}
                      aria-valuemin={0}
                      aria-valuemax={maxTipo}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Gráfico de distribución por ubicación */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Distribución por Ubicación
          </h2>
          <div className="space-y-4">
            {reporteData.distribucionPorUbicacion.map((item) => {
              const percentage = (item.cantidad / maxUbicacion) * 100;
              return (
                <div key={item.ubicacion}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">
                      {item.ubicacion}
                    </span>
                    <span className="text-sm text-gray-600">{item.cantidad}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-success-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                      role="progressbar"
                      aria-valuenow={item.cantidad}
                      aria-valuemin={0}
                      aria-valuemax={maxUbicacion}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Nota:</strong> Estos gráficos son estáticos y muestran datos mock. En producción,
          se integrarían con una librería de gráficos (Chart.js, Recharts, etc.) y datos reales
          desde la API.
        </p>
      </div>
    </div>
  );
};



