import React from 'react';

export default function Container({ children, className = '', size = 'default', ...props }) {
  const sizeClasses = {
    small: 'max-w-4xl',
    default: 'max-w-7xl',
    wide: 'max-w-[90rem]',
    narrow: 'max-w-3xl',
  };

  return (
    <div
      className={`mx-auto px-4 sm:px-6 lg:px-8 w-full ${sizeClasses[size] || sizeClasses.default} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
