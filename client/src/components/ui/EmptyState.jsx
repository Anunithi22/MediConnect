import React from 'react';
import Button from './Button';

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) {
  return (
    <div
      className={`p-8 sm:p-12 text-center rounded-3xl bg-slate-50/80 border border-dashed border-slate-200 space-y-4 max-w-md mx-auto ${className}`}
    >
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-center text-slate-400 mx-auto shadow-2xs">
          <Icon className="w-7 h-7" />
        </div>
      )}

      <div className="space-y-1.5">
        <h3 className="font-display font-bold text-base text-slate-900">
          {title}
        </h3>
        {description && (
          <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
            {description}
          </p>
        )}
      </div>

      {actionLabel && onAction && (
        <div className="pt-2">
          <Button size="sm" variant="outline" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
