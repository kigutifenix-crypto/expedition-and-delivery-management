import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';

interface ConfirmDialogProps {
  open: boolean;
  title?: string;
  description: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title = 'Confirmar ação',
  description,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  isLoading = false,
  onConfirm,
  onCancel,
}) => (
  <Modal open={open} title={title} size="sm" onClose={onCancel}>
    <div className="space-y-6">
      <div className="flex gap-3">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-danger-soft text-danger">
          <AlertTriangle size={18} />
        </span>
        <div className="text-sm leading-relaxed text-ink-soft">{description}</div>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="secondary" type="button" onClick={onCancel}>
          {cancelText}
        </Button>
        <Button variant="danger" type="button" onClick={onConfirm} isLoading={isLoading}>
          {confirmText}
        </Button>
      </div>
    </div>
  </Modal>
);
