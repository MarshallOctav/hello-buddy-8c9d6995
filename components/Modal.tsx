import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  hideHeader?: boolean;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, hideHeader = false }) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEsc);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6">
      <div 
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      <div className="relative w-full sm:max-w-2xl transform overflow-hidden rounded-t-3xl sm:rounded-2xl bg-white shadow-2xl transition-all max-h-[90vh] sm:max-h-none">
        {!hideHeader && (
          <div className="flex items-center justify-between border-b border-slate-100 px-4 sm:px-6 py-3 sm:py-4 sticky top-0 bg-white z-10">
            <h3 className="text-base sm:text-lg font-bold text-slate-900">{title}</h3>
            <button 
              onClick={onClose}
              className="rounded-full p-1.5 sm:p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-500"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
        {hideHeader && (
          <button 
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-500 bg-white/80 backdrop-blur-sm"
          >
            <X className="h-5 w-5" />
          </button>
        )}
        <div className="max-h-[80vh] sm:max-h-[80vh] overflow-y-auto px-4 sm:px-6 py-4 sm:py-6">
          {children}
        </div>
      </div>
    </div>
  );
};