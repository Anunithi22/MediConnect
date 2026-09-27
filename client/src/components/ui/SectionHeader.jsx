import React from 'react';

export default function SectionHeader({
  badge,
  badgeIcon: BadgeIcon,
  title,
  subtitle,
  centered = true,
  className = '',
}) {
  return (
    <div className={`space-y-3 ${centered ? 'text-center mx-auto max-w-2xl' : 'max-w-2xl'} ${className}`}>
      {badge && (
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-200/80 text-brand-800 text-xs font-semibold tracking-wide shadow-xs">
          {BadgeIcon && <BadgeIcon className="w-3.5 h-3.5 text-brand-600" />}
          <span>{badge}</span>
        </div>
      )}
      {title && (
        <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
          {title}
        </h2>
      )}
      {subtitle && (
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
          {subtitle}
        </p>
      )}
    </div>
  );
}
