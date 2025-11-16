// src/components/common/ConfirmDialog.tsx
import { Modal } from './Modal';
import { Button } from './Button';
import { AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  type?: 'danger' | 'warning' | 'info' | 'success';
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = 'warning',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  isLoading = false,
}) => {
  const handleConfirm = () => {
    onConfirm();
    // NOTE: En producción, aquí se haría la llamada a la API
    // Por ahora solo cerramos el modal después de un delay simulado
    setTimeout(() => {
      onClose();
    }, 500);
  };

  const iconConfig = {
    danger: { icon: XCircle, color: 'text-danger-600' },
    warning: { icon: AlertTriangle, color: 'text-warning-600' },
    info: { icon: Info, color: 'text-primary-600' },
    success: { icon: CheckCircle, color: 'text-success-600' },
  };

  const Icon = iconConfig[type].icon;
  const iconColor = iconConfig[type].color;

  const buttonVariant = type === 'danger' ? 'danger' : 'primary';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="flex flex-col items-center text-center space-y-4">
        <div className={`${iconColor} p-3 rounded-full bg-opacity-10`}>
          <Icon size={48} />
        </div>
        <p className="text-gray-700">{message}</p>
        <div className="flex gap-3 w-full pt-4">
          <Button
            variant="ghost"
            onClick={onClose}
            className="flex-1"
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            variant={buttonVariant}
            onClick={handleConfirm}
            className="flex-1"
            isLoading={isLoading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};




