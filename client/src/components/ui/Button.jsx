import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  icon: Icon,
  trailingIcon: TrailingIcon,
  nestedTrailing = false,
  className = '',
  type = 'button',
  ...props
}) {
  const baseClasses =
    'inline-flex items-center justify-center font-semibold rounded-full transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus:ring-2 focus:ring-offset-2';

  const sizeClasses = {
    sm: 'text-xs px-3 py-1',
    md: 'text-sm px-4 py-2',
    lg: 'text-base px-5 py-3',
  };

  const variantClasses = {
    primary: 'bg-primary text-white hover:bg-primary-600 focus:ring-primary/20',
    secondary: 'bg-accent text-white hover:bg-accent-600 focus:ring-accent/20',
    outline: 'bg-white border border-muted text-muted hover:bg-muted/10 focus:ring-primary/20',
    ghost: 'bg-transparent text-muted hover:bg-muted/5 focus:ring-primary/20',
    danger: 'bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-500',
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        Icon && <Icon className="w-4 h-4 shrink-0" />
      )}
      <span>{children}</span>

      {TrailingIcon && !nestedTrailing && !isLoading && (
        <TrailingIcon className="w-4 h-4 shrink-0" />
      )}

      {TrailingIcon && nestedTrailing && !isLoading && (
        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center ml-1 shrink-0">
          <TrailingIcon className="w-3.5 h-3.5" />
        </div>
      )}
    </button>
  );
}
