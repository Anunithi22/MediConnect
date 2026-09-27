import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  HelpCircle, 
  MessageSquareHeart, 
  Building2, 
  CalendarCheck, 
  Award, 
  ShieldCheck, 
  ArrowRight 
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function HowItWorksPage() {
  const { t } = useTranslation();

  const steps = [
    {
      num: '01',
      title: 'State Your Healthcare Requirement',
      desc: 'Type your symptoms or requirement in your own natural language (English, தமிழ், or हिन्दी). MediConnect helps you understand which medical specialty is relevant without medical jargon.',
      icon: MessageSquareHeart,
      color: 'teal'
    },
    {
      num: '02',
      title: 'AI Matches Relevant Specialties',
      desc: 'Our AI service extracts search keywords and identifies potential specialties. It explicitly does not diagnose diseases or prescribe medications.',
      icon: ShieldCheck,
      color: 'blue'
    },
    {
      num: '03',
      title: 'Location & Distance Calculation',
      desc: 'Using high-precision Haversine geo-distance, discover nearby licensed hospitals and verified clinics providing that exact medical specialty.',
      icon: Building2,
      color: 'indigo'
    },
    {
      num: '04',
      title: 'Compare Doctors & Live Availability',
      desc: 'Review doctor qualifications, verified patient ratings, clinical experience, and live available appointment slots.',
      icon: Award,
      color: 'amber'
    },
    {
      num: '05',
      title: 'Instant Online Booking',
      desc: 'Choose your desired date and time slot. Our backend prevents double-booking and issues an immediate digital booking confirmation.',
      icon: CalendarCheck,
      color: 'emerald'
    }
  ];

  return (
    <div className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Header */}
      <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Transparent Healthcare Process</span>
        </div>
        <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
          How MediConnect Works
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          From symptom uncertainty to a confirmed doctor consultation in a few simple steps.
        </p>
      </div>

      {/* Steps List */}
      <div className="max-w-4xl mx-auto space-y-8">
        {steps.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div 
              key={s.num} 
              className="p-2 rounded-3xl bg-white border border-slate-200 shadow-subtle hover:shadow-card transition-all"
            >
              <div className="p-6 flex flex-col sm:flex-row items-start gap-6">
                <div className="w-14 h-14 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-700 shrink-0 font-display font-extrabold text-xl">
                  {s.num}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-brand-600" />
                    <h3 className="font-display font-bold text-lg text-slate-900">
                      {s.title}
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Medical Safety Notice */}
      <div className="mt-16 max-w-4xl mx-auto rounded-3xl bg-amber-50 border border-amber-200/80 p-6 text-amber-900">
        <h4 className="font-display font-bold text-sm mb-1 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-amber-700" />
          <span>Non-Diagnostic Guarantee</span>
        </h4>
        <p className="text-xs text-amber-800 leading-relaxed">
          MediConnect never provides medical diagnosis, treatment regimens, or prescription writing. All clinical diagnoses and treatments must be conducted by qualified, licensed healthcare professionals.
        </p>
      </div>

      <div className="mt-12 text-center">
        <Link
          to="/patient/ai-search"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs sm:text-sm shadow-md transition-all"
        >
          <span>Try AI Health Search</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

    </div>
  );
}
