import React from 'react';
import { HeartHandshake } from 'lucide-react';

export default function PageLoader({ message = 'Loading MediConnect...' }) {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 space-y-4">
      <div className="w-14 h-14 rounded-2xl bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-600 shadow-md">
        <HeartHandshake className="w-7 h-7 animate-pulse" />
      </div>
      <div className="text-center space-y-1">
        <p className="font-display font-semibold text-sm text-slate-800 tracking-tight">
          {message}
        </p>
        <p className="text-xs text-slate-400">
          Find the Right Care, Closer to You
        </p>
      </div>
    </div>
  );
}
