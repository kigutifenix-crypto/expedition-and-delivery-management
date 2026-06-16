import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  title?: string;
  onClose: () => void;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ open, title, onClose, children }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 flex items-center justify-center p-4">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative w-full max-w-xl rounded-[28px] bg-white shadow-2xl border border-slate-300 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-300 bg-slate-50">
          {title ? <h3 className="text-lg font-semibold text-slate-900">{title}</h3> : null}
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 transition"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-6 text-slate-800">{children}</div>
      </div>
    </div>
  );
};
