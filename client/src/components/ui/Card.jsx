import React from 'react';

export default function Card({
  children,
  className = '',
  doubleBezel = false,
  hoverEffect = true,
  onClick,
  ...props
}) {
  if (doubleBezel) {
    return (
      <div
        className={`bg-card rounded-2xl shadow-card border border-border p-6 ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`rounded-3xl bg-white border border-slate-200/80 shadow-subtle ${
        hoverEffect ? 'hover:shadow-card hover:border-slate-300 transition-all duration-300' : ''
      } ${onClick ? 'cursor-pointer' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
