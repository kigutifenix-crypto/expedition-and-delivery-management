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
    if (open) {
      setValue(defaultValue);
    }
  }, [open, defaultValue]);

  return (
    <Modal open={open} title={title} onClose={onCancel}>
      <div className="space-y-4">
        {description ? <p className="text-sm text-slate-600">{description}</p> : null}
        <label className="block text-sm font-medium text-slate-700">
          {label}
          <textarea
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder={placeholder}
            rows={4}
            className="mt-2 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </label>
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" size="md" type="button" onClick={onCancel}>
            {cancelText}
          </Button>
          <Button size="md" type="button" onClick={() => onSubmit(value)}>
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
