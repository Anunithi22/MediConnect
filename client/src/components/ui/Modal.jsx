import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import IconButton from './IconButton';

export default function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'max-w-md',
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        aria-hidden="true"
      />

      {/* Modal Dialog (Double Bezel) */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={`relative w-full ${maxWidth} z-10 p-2 sm:p-2.5 rounded-3xl bg-slate-200/60 backdrop-blur-md shadow-elevated border border-white/60 animate-in fade-in zoom-in-95 duration-200`}
      >
        <div className="bg-white rounded-[1.35rem] p-6 shadow-xs border border-slate-100 space-y-4">
          
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <h3 id="modal-title" className="font-display font-bold text-lg text-slate-900">
                {title}
              </h3>
              {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
            </div>

            <IconButton
              icon={X}
              label="Close dialog"
              size="sm"
              variant="ghost"
              onClick={onClose}
            />
          </div>

          {/* Content */}
          <div className="pt-2">{children}</div>

        </div>
      </div>
    </div>
  );
}
