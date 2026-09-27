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
        className={`p-2 sm:p-2.5 rounded-3xl bg-slate-200/60 backdrop-blur-md shadow-card border border-white/60 ${className}`}
        {...props}
      >
        <div className="bg-white rounded-[1.35rem] p-5 sm:p-6 shadow-xs border border-slate-100 h-full">
          {children}
        </div>
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
