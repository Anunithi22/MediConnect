import React from 'react';
import { Building2, Star, MapPin, HeartPulse, ArrowRight, Heart, Users, Scale } from 'lucide-react';
import { Link } from 'react-router-dom';
import Badge from './Badge';
import Button from './Button';

export default function HospitalCard({
  id,
  name,
  hospitalType,
  rating = 4.8,
  reviewCount = 0,
  address,
  city,
  distance,
  specialties = [],
  facilities = [],
  image,
  doctorCount = 0,
  emergencyService = true,
  isDemo = false,
  isSaved = false,
  isComparing = false,
  onToggleCompare,
  onToggleSave,
  onViewHospital,
  onFindDoctors,
}) {
  const profileUrl = id ? `/hospital/${id}` : '#';

  return (
    <div className="p-2 sm:p-2.5 rounded-3xl bg-slate-200/50 backdrop-blur-md shadow-card border border-white/60 hover:border-brand-300 transition-all duration-300 flex flex-col h-full group">
      <div className="bg-white rounded-[1.35rem] p-5 sm:p-6 shadow-xs border border-slate-100 flex flex-col justify-between h-full space-y-4">
        
        {/* Hospital Image Banner */}
        <Link to={profileUrl} className="relative h-44 rounded-2xl overflow-hidden border border-slate-200 block">
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
            {hospitalType && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-900/80 text-white">
                {hospitalType}
              </span>
            )}
          </div>

          <div className="absolute top-3 right-3 flex items-center gap-1.5">
            {onToggleCompare && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onToggleCompare(id);
                }}
                title={isComparing ? 'Remove from compare' : 'Add to compare'}
                className={`p-2 rounded-xl backdrop-blur-md shadow-xs transition-colors flex items-center gap-1 text-[10px] font-bold ${
                  isComparing
                    ? 'bg-brand-600 text-white'
                    : 'bg-white/90 text-slate-700 hover:text-brand-600'
                }`}
              >
                <Scale className="w-3.5 h-3.5" />
              </button>
            )}

            {onToggleSave && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onToggleSave(id);
                }}
                title={isSaved ? 'Remove from saved' : 'Save hospital'}
                className="p-2 rounded-xl bg-white/90 backdrop-blur-md text-slate-700 hover:text-rose-600 shadow-xs transition-colors"
              >
                <Heart className={`w-4 h-4 ${isSaved ? 'fill-rose-500 text-rose-500' : ''}`} />
              </button>
            )}
          </div>

          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
            <span className="flex items-center gap-1 text-xs font-bold bg-slate-900/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{Number(rating).toFixed(1)}</span>
              {reviewCount > 0 && <span className="text-[10px] text-slate-300">({reviewCount})</span>}
            </span>

            {(distance !== undefined && distance !== null) && (
              <span className="flex items-center gap-1 text-xs font-bold bg-brand-600/90 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20">
                <MapPin className="w-3 h-3" />
                <span>{typeof distance === 'number' ? `${distance} km` : distance}</span>
              </span>
            )}
          </div>
        </Link>

        {/* Content Details */}
        <div className="space-y-2 flex-1">
          <Link to={profileUrl} className="block group-hover:text-brand-600 transition-colors">
            <h3 className="font-display font-bold text-lg text-slate-900 leading-tight truncate">
              {name}
            </h3>
          </Link>

          <p className="text-xs text-slate-500 line-clamp-1 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{address || city || 'Chennai'}</span>
          </p>

          {/* Specialties Pills */}
          {specialties.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {specialties.slice(0, 3).map((spec, idx) => (
                <Badge key={idx} variant="slate" size="sm">
                  {typeof spec === 'object' ? spec.name : spec}
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
            <div className="pt-1.5 text-[11px] text-slate-500">
              <span className="font-semibold text-slate-700">Facilities: </span>
              <span>{facilities.slice(0, 3).join(' • ')}</span>
            </div>
          )}
        </div>

        {/* Action Row */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold text-slate-800">{doctorCount > 0 ? `${doctorCount} doctors` : 'Verified facility'}</span>
          </div>

          <div className="flex items-center gap-2">
            {onViewHospital ? (
              <Button size="sm" variant="dark" onClick={onViewHospital} trailingIcon={ArrowRight}>
                View Facility
              </Button>
            ) : (
              <Link to={profileUrl}>
                <Button size="sm" variant="dark" trailingIcon={ArrowRight}>
                  View Facility
                </Button>
              </Link>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
