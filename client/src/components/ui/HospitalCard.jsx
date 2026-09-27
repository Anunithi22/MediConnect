import React from 'react';
import { Building2, Star, MapPin, Stethoscope, ShieldCheck, HeartPulse, ArrowRight } from 'lucide-react';
import Badge from './Badge';
import Button from './Button';

export default function HospitalCard({
  name,
  rating = 4.8,
  address,
  distance,
  specialties = [],
  facilities = [],
  image,
  doctorCount = 12,
  emergencyService = true,
  isDemo = false,
  onViewHospital,
  onFindDoctors,
}) {
  return (
    <div className="p-2 sm:p-2.5 rounded-3xl bg-slate-200/50 backdrop-blur-md shadow-card border border-white/60 hover:border-brand-300 transition-all duration-300 flex flex-col h-full group">
      <div className="bg-white rounded-[1.35rem] p-5 sm:p-6 shadow-xs border border-slate-100 flex flex-col justify-between h-full space-y-5">
        
        {/* Hospital Image Banner */}
        <div className="relative h-44 rounded-2xl overflow-hidden border border-slate-200">
          <img
            src={
              image ||
              'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&q=80&w=600'
            }
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-transparent" />

          {/* Badges Overlay */}
          <div className="absolute top-3 left-3 flex items-center gap-2">
            {emergencyService && (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-rose-600 text-white shadow-xs flex items-center gap-1">
                <HeartPulse className="w-3 h-3 animate-pulse" />
                <span>24/7 Emergency</span>
              </span>
            )}
            {isDemo && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-900/80 text-white">
                Preview
              </span>
            )}
          </div>

          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
            <span className="flex items-center gap-1 text-xs font-bold bg-slate-900/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{rating.toFixed(1)}</span>
            </span>

            {distance && (
              <span className="flex items-center gap-1 text-xs font-bold bg-brand-600/90 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20">
                <MapPin className="w-3 h-3" />
                <span>{distance}</span>
              </span>
            )}
          </div>
        </div>

        {/* Content Details */}
        <div className="space-y-2 flex-1">
          <h3 className="font-display font-bold text-lg text-slate-900 leading-tight">
            {name}
          </h3>

          <p className="text-xs text-slate-500 line-clamp-1 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{address}</span>
          </p>

          {/* Specialties Pills */}
          {specialties.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {specialties.slice(0, 3).map((spec, idx) => (
                <Badge key={idx} variant="slate" size="sm">
                  {spec}
                </Badge>
              ))}
              {specialties.length > 3 && (
                <span className="text-[10px] font-semibold text-slate-400 self-center">
                  +{specialties.length - 3} more
                </span>
              )}
            </div>
          )}

          {/* Facility Highlights */}
          {facilities.length > 0 && (
            <div className="pt-2 text-[11px] text-slate-500 space-y-1">
              <span className="font-semibold text-slate-700 block">Facilities:</span>
              <p className="line-clamp-1">{facilities.slice(0, 4).join(' • ')}</p>
            </div>
          )}
        </div>

        {/* Action Row */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
            <Stethoscope className="w-4 h-4 text-brand-600" />
            <span>{doctorCount} Specialists</span>
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={onViewHospital}>
              View Hospital
            </Button>
            <Button size="sm" variant="dark" onClick={onFindDoctors} trailingIcon={ArrowRight}>
              Find Doctors
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}
