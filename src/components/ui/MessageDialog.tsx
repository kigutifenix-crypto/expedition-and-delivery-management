import React from 'react';
import { Info } from 'lucide-react';
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
  buttonText = 'Entendi',
  onClose,
}) => (
  <Modal open={open} title={title} size="sm" onClose={onClose}>
    <div className="space-y-6">
      <div className="flex gap-3">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-info-soft text-info">
          <Info size={18} />
        </span>
        <p className="whitespace-pre-line text-sm leading-relaxed text-ink-soft">{message}</p>
      </div>
      <div className="flex justify-end">
        <Button type="button" onClick={onClose}>
          {buttonText}
        </Button>
      </div>
    </div>
  </Modal>
);
