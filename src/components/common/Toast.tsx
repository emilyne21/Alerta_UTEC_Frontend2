// src/components/common/Toast.tsx
import { useEffect, useState } from 'react';
import { X, CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';
import { clsx } from 'clsx';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastProps {
  toast: Toast;
  onClose: (id: string) => void;
}

export const ToastComponent: React.FC<ToastProps> = ({ toast, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose(toast.id), 300);
    }, toast.duration || 5000);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onClose]);

  const iconConfig = {
    success: { icon: CheckCircle, color: 'text-success-600', bg: 'bg-success-50', border: 'border-success-200' },
    error: { icon: XCircle, color: 'text-danger-600', bg: 'bg-danger-50', border: 'border-danger-200' },
    warning: { icon: AlertCircle, color: 'text-warning-600', bg: 'bg-warning-50', border: 'border-warning-200' },
    info: { icon: Info, color: 'text-primary-600', bg: 'bg-primary-50', border: 'border-primary-200' },
  };

  const config = iconConfig[toast.type];
  const Icon = config.icon;

  return (
    <div
      className={clsx(
        'flex items-center gap-3 p-4 rounded-lg shadow-lg border min-w-[300px] max-w-md transition-all duration-300',
        config.bg,
        config.border,
        isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
      )}
      role="alert"
      aria-live="polite"
    >
      <Icon className={clsx('flex-shrink-0', config.color)} size={20} />
      <p className="flex-1 text-sm font-medium text-gray-900">{toast.message}</p>
      <button
        onClick={() => {
          setIsVisible(false);
          setTimeout(() => onClose(toast.id), 300);
        }}
        className="text-gray-400 hover:text-gray-600 transition-colors"
        aria-label="Cerrar notificación"
      >
        <X size={16} />
      </button>
    </div>
  );
};

interface ToastContainerProps {
  toasts: Toast[];
  onClose: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onClose }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <ToastComponent key={toast.id} toast={toast} onClose={onClose} />
      ))}
    </div>
  );
};

// Hook para manejar toasts (UI only, sin persistencia)
let toastIdCounter = 0;
export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (type: ToastType, message: string, duration?: number) => {
    const id = `toast-${toastIdCounter++}`;
    const newToast: Toast = { id, type, message, duration };
    setToasts((prev) => [...prev, newToast]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return { toasts, showToast, removeToast };
};



