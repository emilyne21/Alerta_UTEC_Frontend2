// src/components/dashboard/SummaryCards.tsx
import { KPI } from '@/utils/types';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { clsx } from 'clsx';

interface SummaryCardsProps {
  kpis: KPI[];
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ kpis }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {kpis.map((kpi, index) => (
        <div
          key={index}
          className="rounded-lg border p-6 shadow-sm hover:shadow-md transition-shadow"
          style={{ backgroundColor: '#F2ECEC', borderColor: '#9C90FC' }}
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium" style={{ color: '#132436', opacity: 0.7 }}>{kpi.label}</p>
            {kpi.trend && (
              <div
                className={clsx(
                  'flex items-center gap-1 text-xs',
                  kpi.trend === 'up' && 'text-success-600',
                  kpi.trend === 'down' && 'text-danger-600',
                  kpi.trend === 'neutral' && 'text-gray-500'
                )}
              >
                {kpi.trend === 'up' && <TrendingUp size={16} />}
                {kpi.trend === 'down' && <TrendingDown size={16} />}
                {kpi.trend === 'neutral' && <Minus size={16} />}
                {kpi.change !== undefined && (
                  <span>{Math.abs(kpi.change)}%</span>
                )}
              </div>
            )}
          </div>
          <p className="text-2xl font-bold" style={{ color: '#132436' }}>{kpi.value}</p>
        </div>
      ))}
    </div>
  );
};



