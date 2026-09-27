import React from 'react';
import { HeartHandshake, Shield, Target, Users, MapPin, Sparkles } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Header */}
      <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold">
          <HeartHandshake className="w-3.5 h-3.5" />
          <span>Our Vision & Mission</span>
        </div>
        <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
          About MediConnect
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          MediConnect was conceived to solve the fundamental friction patients face when navigating healthcare: understanding which specialist to consult, which nearby hospital offers the service, and booking with zero friction.
        </p>
      </div>

      {/* Values Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        
        <div className="p-2 rounded-3xl bg-white border border-slate-200 shadow-subtle">
          <div className="p-6 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-brand-600 flex items-center justify-center">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-lg text-slate-900">
              Ethical Non-Diagnostic AI
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              We strictly forbid AI medical diagnosis and prescription. AI acts purely as a semantic directory assistant that maps user symptoms to medical specialties.
            </p>
          </div>
        </div>

        <div className="p-2 rounded-3xl bg-white border border-slate-200 shadow-subtle">
          <div className="p-6 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-lg text-slate-900">
              Rural & Regional Accessibility
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Full multilingual localization in English, Tamil, and Hindi, engineered with high-contrast, large touch-targets for elderly and rural users.
            </p>
          </div>
        </div>

        <div className="p-2 rounded-3xl bg-white border border-slate-200 shadow-subtle">
          <div className="p-6 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-lg text-slate-900">
              Transparent Proximity Matching
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Haversine formula calculations compute exact geographic distances, factoring verified patient reviews, clinical experience, and live doctor slot schedules.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
