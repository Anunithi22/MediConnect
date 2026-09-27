import React from 'react';
import { Star, MapPin, Award, Calendar, Clock, ShieldCheck, ArrowRight } from 'lucide-react';
import Badge from './Badge';
import Button from './Button';

export default function DoctorCard({
  name,
  specialization,
  qualification,
  experience,
  rating = 4.8,
  reviewCount = 0,
  hospital,
  distance,
  nextAvailable = 'Available Tomorrow',
  consultationFee,
  image,
  verificationStatus = 'approved',
  isDemo = false,
  onViewProfile,
  onBookAppointment,
}) {
  return (
    <div className="p-2 sm:p-2.5 rounded-3xl bg-slate-200/50 backdrop-blur-md shadow-card border border-white/60 hover:border-brand-300 transition-all duration-300 flex flex-col h-full group">
      <div className="bg-white rounded-[1.35rem] p-5 sm:p-6 shadow-xs border border-slate-100 flex flex-col justify-between h-full space-y-5">
        
        {/* Top Info Header */}
        <div className="flex items-start gap-4">
          <div className="relative shrink-0">
            <img
              src={
                image ||
                'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=240'
              }
              alt={name}
              className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl object-cover border border-slate-200 shadow-2xs group-hover:scale-105 transition-transform duration-300"
            />
            {verificationStatus === 'approved' && (
              <div
                title="Verified Specialist"
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-brand-600 text-white flex items-center justify-center shadow-xs border-2 border-white"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
            )}
          </div>

          <div className="space-y-1 flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <Badge variant="teal" size="sm">
                {specialization}
              </Badge>
              {isDemo && (
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Preview
                </span>
              )}
            </div>

            <h3 className="font-display font-bold text-base sm:text-lg text-slate-900 truncate">
              {name}
            </h3>

            {qualification && (
              <p className="text-xs text-slate-500 truncate">{qualification}</p>
            )}

            <div className="flex items-center gap-2 pt-0.5 text-xs text-slate-600">
              <span className="flex items-center gap-1 font-bold text-amber-600">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                {rating.toFixed(1)}
              </span>
              {reviewCount > 0 && (
                <span className="text-[11px] text-slate-400">({reviewCount} reviews)</span>
              )}
              <span className="text-slate-300">•</span>
              <span className="font-medium">{experience} yrs exp</span>
            </div>
          </div>
        </div>

        {/* Hospital & Proximity Meta */}
        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs text-slate-600">
          {hospital && (
            <div className="flex items-center gap-2 font-medium truncate">
              <Award className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{hospital}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-1">
            {distance && (
              <div className="flex items-center gap-1 font-semibold text-brand-700">
                <MapPin className="w-3.5 h-3.5 text-brand-600" />
                <span>{distance}</span>
              </div>
            )}

            {nextAvailable && (
              <div className="flex items-center gap-1 text-emerald-700 font-medium ml-auto">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                <span>{nextAvailable}</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Row */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
          <div>
            <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Consultation Fee
            </span>
            <span className="font-display font-extrabold text-base text-slate-900">
              ₹{consultationFee || 500}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="dark"
              onClick={onViewProfile}
              trailingIcon={ArrowRight}
            >
              View Profile
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}
