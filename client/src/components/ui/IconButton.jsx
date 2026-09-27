import React from 'react';

export default function IconButton({
  icon: Icon,
  label,
  variant = 'outline',
  size = 'md',
  className = '',
  ...props
}) {
  const sizeClasses = {
    sm: 'p-1.5 rounded-lg',
    md: 'p-2 rounded-xl',
    lg: 'p-2.5 rounded-2xl',
  };

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const variantClasses = {
    outline: 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900',
    ghost: 'bg-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-900',
    primary: 'bg-brand-600 text-white hover:bg-brand-700 shadow-xs',
    danger: 'border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100',
  };

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`inline-flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/20 ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      <Icon className={iconSizes[size]} />
    </button>
  );
}
