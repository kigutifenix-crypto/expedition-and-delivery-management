import React from 'react';
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
  title,
  description,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  isLoading = false,
  onConfirm,
  onCancel,
}) => {
  return (
    <Modal open={open} title={title} onClose={onCancel}>
      <div className="space-y-6">
        <div className="text-sm text-slate-600">{description}</div>
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="secondary" size="md" type="button" onClick={onCancel}>
            {cancelText}
          </Button>
          <Button variant="danger" size="md" type="button" onClick={onConfirm} isLoading={isLoading}>
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
