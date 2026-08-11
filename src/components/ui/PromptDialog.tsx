import React, { useEffect, useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';

interface PromptDialogProps {
  open: boolean;
  title?: string;
  description?: string;
  label?: string;
  placeholder?: string;
  defaultValue?: string;
  confirmText?: string;
  cancelText?: string;
  onCancel: () => void;
  onSubmit: (value: string) => void;
}

export const PromptDialog: React.FC<PromptDialogProps> = ({
  open,
  title = 'Entrada necessária',
  description,
  label = '',
  placeholder = '',
  defaultValue = '',
  confirmText = 'Enviar',
  cancelText = 'Cancelar',
  onCancel,
  onSubmit,
}) => {
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    if (open) setValue(defaultValue);
  }, [open, defaultValue]);

  return (
    <Modal open={open} title={title} description={description} size="sm" onClose={onCancel}>
      <div className="space-y-5">
        <div>
          {label && <span className="label-field">{label}</span>}
          <textarea
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder={placeholder}
            rows={4}
            autoFocus
            className="field resize-none"
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" type="button" onClick={onCancel}>
            {cancelText}
          </Button>
          <Button type="button" onClick={() => onSubmit(value)}>
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
