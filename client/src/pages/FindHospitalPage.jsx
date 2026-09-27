import React, { useState } from 'react';
import { Building2, Search, MapPin, Navigation, Star, Phone, ArrowRight } from 'lucide-react';

export default function FindHospitalPage() {
  const [locationQuery, setLocationQuery] = useState('');

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-extrabold text-slate-900">
          Find Certified Hospitals & Clinics
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Discover certified healthcare institutions with emergency facilities, intensive care, and specialty departments.
        </p>
      </div>

      {/* Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-subtle mb-8 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={locationQuery}
            onChange={(e) => setLocationQuery(e.target.value)}
            placeholder="Search by hospital name, city, or district..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
        </div>
      </div>

      {/* Notice */}
      <div className="p-6 rounded-2xl bg-slate-50 border border-dashed border-slate-300 text-center space-y-2">
        <Building2 className="w-8 h-8 text-brand-600 mx-auto" />
        <h3 className="font-display font-semibold text-slate-800">
          Hospital Directory & Comparison Module
        </h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Multi-hospital comparisons, facility badges, bed capacities, emergency status, and geo-distance calculations are powered in Phase 7.
        </p>
      </div>
    </div>
  );
}
