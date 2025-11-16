// src/components/common/Badge.tsx
import { clsx } from 'clsx';
import { IncidentStatus, IncidentUrgency, IncidentType } from '@/utils/types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'status' | 'urgency' | 'type';
  className?: string;
  style?: React.CSSProperties;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', className, style }) => {
  const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
  
  const variantClasses = {
    default: 'bg-gray-100 text-gray-800',
    status: '',
    urgency: '',
    type: 'bg-blue-100 text-blue-800',
  };

  return (
    <span className={clsx(baseClasses, variantClasses[variant], className)} style={style}>
      {children}
    </span>
  );
};

interface StatusBadgeProps {
  status: IncidentStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const statusConfig = {
    pendiente: { label: 'Pendiente', style: { backgroundColor: '#F2ECEC', color: '#132436' } },
    en_proceso: { label: 'En Proceso', style: { backgroundColor: '#9C90FC', color: '#132436' } },
    resuelto: { label: 'Resuelto', style: { backgroundColor: '#9C90FC', color: '#132436' } },
    rechazado: { label: 'Rechazado', style: { backgroundColor: '#E05A29', color: '#F2ECEC' } },
    aprobado: { label: 'Aprobado', style: { backgroundColor: '#9C90FC', color: '#132436' } },
  };

  const config = statusConfig[status];
  return (
    <Badge variant="status" className="bg-transparent" style={config.style}>
      {config.label}
    </Badge>
  );
};

interface UrgencyBadgeProps {
  urgency: IncidentUrgency;
}

export const UrgencyBadge: React.FC<UrgencyBadgeProps> = ({ urgency }) => {
  const urgencyConfig = {
    baja: { label: 'Baja', style: { backgroundColor: '#F2ECEC', color: '#132436' } },
    media: { label: 'Media', style: { backgroundColor: '#9C90FC', color: '#132436' } },
    alta: { label: 'Alta', style: { backgroundColor: '#E05A29', color: '#F2ECEC' } },
    critica: { label: 'Crítica', style: { backgroundColor: '#E05A29', color: '#F2ECEC' } },
  };

  const config = urgencyConfig[urgency];
  return (
    <Badge variant="urgency" className="bg-transparent" style={config.style}>
      {config.label}
    </Badge>
  );
};

interface TypeBadgeProps {
  type: IncidentType;
}

export const TypeBadge: React.FC<TypeBadgeProps> = ({ type }) => {
  const typeLabels: Record<IncidentType, string> = {
    infraestructura: 'Infraestructura',
    seguridad: 'Seguridad',
    software: 'Software',
    hardware: 'Hardware',
    red: 'Red',
    otro: 'Otro',
  };

  return (
    <Badge 
      variant="type" 
      className="bg-transparent"
      style={{ backgroundColor: '#9C90FC', color: '#132436' }}
    >
      {typeLabels[type]}
    </Badge>
  );
};



