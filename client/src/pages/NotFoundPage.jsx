import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="py-24 max-w-md mx-auto text-center px-4 space-y-4">
      <div className="text-6xl font-extrabold text-brand-600 font-display">
        404
      </div>
      <h2 className="text-xl font-bold text-slate-800">
        Page Not Found
      </h2>
      <p className="text-xs text-slate-500 leading-relaxed">
        The healthcare service or page you are trying to view cannot be found or may have been moved.
      </p>
      <div className="pt-2">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-900 text-white text-xs font-semibold hover:bg-brand-600 transition-colors"
        >
          <Home className="w-4 h-4" />
          <span>Return to MediConnect Home</span>
        </Link>
      </div>
    </div>
  );
}
