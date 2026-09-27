import React, { forwardRef } from 'react';

const Textarea = forwardRef(
  (
    {
      label,
      error,
      helperText,
      className = '',
      id,
      rows = 4,
      required = false,
      ...props
    },
    ref
  ) => {
    const textareaId = id || props.name || Math.random().toString(36).substr(2, 9);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-xs font-bold text-slate-700 uppercase tracking-wider"
          >
            {label} {required && <span className="text-rose-500">*</span>}
          </label>
        )}

        <textarea
          id={textareaId}
          ref={ref}
          rows={rows}
          required={required}
          className={`w-full p-3.5 rounded-xl border text-sm text-slate-800 placeholder-slate-400 bg-white transition-all resize-none focus:outline-none focus:ring-2 focus:ring-brand-500/20 ${
            error
              ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20'
              : 'border-slate-200 focus:border-brand-500'
          } ${className}`}
          {...props}
        />

        {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}
        {helperText && !error && (
          <p className="text-[11px] text-slate-400">{helperText}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
export default Textarea;
