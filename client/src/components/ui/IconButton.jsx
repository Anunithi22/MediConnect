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
    sm: 'p-1 rounded-sm',
    md: 'p-2 rounded-md',
    lg: 'p-3 rounded-lg',
  };

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const variantClasses = {
    outline: 'bg-white border border-muted text-muted hover:bg-muted/10 focus:ring-primary/20',
    ghost: 'bg-transparent text-muted hover:bg-muted/5 focus:ring-primary/20',
  };;

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
