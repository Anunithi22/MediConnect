import React, { useState } from 'react';
import { Search, Filter, Stethoscope, MapPin, Star, Award, Calendar, ArrowRight } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';

export default function FindDoctorPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-extrabold text-slate-900">
          Find Licensed Healthcare Doctors
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Explore certified specialists based on your clinical requirements, ratings, distance, and availability.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-subtle mb-8 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by doctor name, specialty, or clinic..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
        </div>

        <select
          value={selectedSpecialty}
          onChange={(e) => setSelectedSpecialty(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        >
          <option value="All">All Specialties</option>
          <option value="General Medicine">General Medicine</option>
          <option value="Cardiology">Cardiology</option>
          <option value="Dermatology">Dermatology</option>
          <option value="Pediatrics">Pediatrics</option>
          <option value="Orthopedics">Orthopedics</option>
          <option value="Neurology">Neurology</option>
        </select>
      </div>

      {/* Notice */}
      <div className="p-6 rounded-2xl bg-slate-50 border border-dashed border-slate-300 text-center space-y-2">
        <Stethoscope className="w-8 h-8 text-brand-600 mx-auto" />
        <h3 className="font-display font-semibold text-slate-800">
          Database Doctor Discovery Module
        </h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          The full search and recommendation engine with live filters, Haversine distance sorting, and real-time slot booking is connected in Phase 6.
        </p>
      </div>
    </div>
  );
}
