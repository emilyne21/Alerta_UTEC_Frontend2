// src/components/common/Skeleton.tsx
import { clsx } from 'clsx';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'rectangular',
  width,
  height,
}) => {
  const baseClasses = 'animate-pulse bg-gray-200 rounded';
  
  const variantClasses = {
    text: 'h-4',
    circular: 'rounded-full',
    rectangular: 'rounded',
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      className={clsx(baseClasses, variantClasses[variant], className)}
      style={style}
      aria-busy="true"
      aria-label="Cargando..."
    />
  );
};

export const SkeletonCard: React.FC = () => (
  <div className="p-4 border border-gray-200 rounded-lg">
    <Skeleton variant="text" width="60%" className="mb-2" />
    <Skeleton variant="text" width="40%" className="mb-4" />
    <Skeleton variant="rectangular" height={100} className="mb-2" />
    <div className="flex gap-2">
      <Skeleton variant="rectangular" width={80} height={24} />
      <Skeleton variant="rectangular" width={80} height={24} />
    </div>
  </div>
);

export const SkeletonTable: React.FC = () => (
  <div className="space-y-3">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
        <Skeleton variant="rectangular" width={60} height={20} />
        <Skeleton variant="text" width="30%" />
        <Skeleton variant="text" width="20%" />
        <Skeleton variant="text" width="15%" />
        <Skeleton variant="rectangular" width={80} height={24} className="ml-auto" />
      </div>
    ))}
  </div>
);




