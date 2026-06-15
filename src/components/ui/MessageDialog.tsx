import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';

interface MessageDialogProps {
  open: boolean;
  title?: string;
  message: string;
  buttonText?: string;
  onClose: () => void;
}

export const MessageDialog: React.FC<MessageDialogProps> = ({
  open,
  title = 'Aviso',
  message,
  buttonText = 'Fechar',
  onClose,
}) => {
  return (
    <Modal open={open} title={title} onClose={onClose}>
      <div className="space-y-6">
        <p className="text-sm leading-relaxed text-slate-600 whitespace-pre-line">{message}</p>
        <div className="flex justify-end">
          <Button size="md" type="button" onClick={onClose}>
            {buttonText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
