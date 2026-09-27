import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Sparkles, 
  Search, 
  Building2, 
  MapPin, 
  Navigation, 
  Calendar, 
  Star, 
  ShieldCheck, 
  ArrowRight, 
  Clock, 
  Users, 
  Activity, 
  HeartHandshake,
  CheckCircle2,
  Stethoscope
} from 'lucide-react';

export default function LandingPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Search Bar State
  const [concern, setConcern] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [location, setLocation] = useState('');
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  // Pre-defined specialties for quick filter
  const quickSpecialties = [
    'General Medicine',
    'Cardiology',
    'Dermatology',
    'Pediatrics',
    'Orthopedics',
    'Gynecology',
    'Neurology',
    'Ophthalmology'
  ];

  // Geolocation detector
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser. Please enter your location manually.');
      return;
    }

    setIsDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsDetectingLocation(false);
        const { latitude, longitude } = pos.coords;
        // Set coordinates or friendly label
        setLocation(`Lat: ${latitude.toFixed(3)}, Lng: ${longitude.toFixed(3)}`);
      },
      (err) => {
        setIsDetectingLocation(false);
        console.warn('Geolocation access denied or timed out:', err.message);
        alert('Location permission not granted. You can enter your city or area manually.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (concern.trim() && !specialty) {
      // If patient typed natural language concern, navigate to AI search
      navigate(`/patient/ai-search?q=${encodeURIComponent(concern.trim())}`);
    } else {
      const params = new URLSearchParams();
      if (concern) params.append('q', concern);
      if (specialty) params.append('specialty', specialty);
      if (location) params.append('location', location);
      navigate(`/find-doctor?${params.toString()}`);
    }
  };

  return (
    <div className="relative overflow-hidden">
      
      {/* Background Soft Mesh Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[650px] pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-32 left-1/4 w-96 h-96 rounded-full bg-brand-200/40 blur-3xl" />
        <div className="absolute top-20 right-1/4 w-[28rem] h-[28rem] rounded-full bg-teal-100/50 blur-3xl" />
      </div>

      {/* HERO SECTION */}
      <section className="pt-12 pb-20 md:pt-20 md:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="max-w-3xl mx-auto text-center space-y-6">
            {/* Eyebrow Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200/80 text-brand-800 text-xs font-semibold tracking-wide shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-brand-600 animate-pulse" />
              <span>{t('hero.badge')}</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
              {t('hero.title')}
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal max-w-2xl mx-auto">
              {t('hero.subtitle')}
            </p>

            {/* Quick Hero CTAs */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={() => navigate('/find-doctor')}
                className="group inline-flex items-center gap-2.5 pl-6 pr-2 py-3 rounded-full bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm shadow-md shadow-brand-600/20 transition-all active:scale-[0.98]"
              >
                <span>{t('hero.btnFindDoctor')}</span>
                <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center transition-transform group-hover:translate-x-1">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </button>

              <button
                onClick={() => navigate('/find-hospital')}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 font-semibold text-sm shadow-sm transition-all active:scale-[0.98]"
              >
                <Building2 className="w-4 h-4 text-brand-600" />
                <span>{t('hero.btnFindHospital')}</span>
              </button>

              <button
                onClick={() => navigate('/patient/ai-search')}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-gradient-to-r from-teal-50 to-emerald-50 hover:from-teal-100/60 hover:to-emerald-100/60 text-brand-800 border border-brand-200/80 font-semibold text-sm shadow-sm transition-all active:scale-[0.98]"
              >
                <Sparkles className="w-4 h-4 text-brand-600" />
                <span>{t('hero.btnAiSearch')}</span>
              </button>
            </div>

            {/* Trust Metrics */}
            <div className="pt-6 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-slate-500 font-medium">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>{t('hero.statsDoctors')}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>{t('hero.statsHospitals')}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>{t('hero.statsSatisfaction')}</span>
              </div>
            </div>

          </div>

          {/* SEARCH COMPONENT (Double Bezel Architecture) */}
          <div className="mt-12 max-w-4xl mx-auto">
            {/* Outer Machine Bezel */}
            <div className="p-2 sm:p-3 rounded-3xl bg-slate-200/60 backdrop-blur-md shadow-card border border-white/60">
              {/* Inner White Core */}
              <form 
                onSubmit={handleSearchSubmit}
                className="bg-white rounded-[1.35rem] p-4 sm:p-5 shadow-xs border border-slate-100"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  
                  {/* Healthcare Concern input */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      {t('search.concernLabel')}
                    </label>
                    <div className="relative">
                      <Stethoscope className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={concern}
                        onChange={(e) => setConcern(e.target.value)}
                        placeholder={t('search.concernPlaceholder')}
                        className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                      />
                    </div>
                  </div>

                  {/* Specialty Dropdown */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      {t('search.specialtyLabel')}
                    </label>
                    <div className="relative">
                      <Activity className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <select
                        value={specialty}
                        onChange={(e) => setSpecialty(e.target.value)}
                        className="w-full pl-10 pr-8 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white transition-all appearance-none cursor-pointer"
                      >
                        <option value="">{t('search.specialtyAll')}</option>
                        {quickSpecialties.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                        ▼
                      </div>
                    </div>
                  </div>

                  {/* Location & GPS */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                        {t('search.locationLabel')}
                      </label>
                      <button
                        type="button"
                        onClick={handleDetectLocation}
                        className="text-[11px] font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1 transition-colors"
                      >
                        <Navigation className={`w-3 h-3 ${isDetectingLocation ? 'animate-spin' : ''}`} />
                        <span>{isDetectingLocation ? 'Detecting...' : 'Use GPS'}</span>
                      </button>
                    </div>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder={t('search.locationPlaceholder')}
                        className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                      />
                    </div>
                  </div>

                </div>

                {/* Submit Row */}
                <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                    <span>AI matches your concern to qualified specialists automatically.</span>
                  </div>

                  <button
                    type="submit"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-slate-900 hover:bg-brand-600 text-white font-semibold text-xs sm:text-sm shadow-md transition-all active:scale-[0.98]"
                  >
                    <Search className="w-4 h-4" />
                    <span>{t('search.searchBtn')}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>

        </div>
      </section>

      {/* CORE FEATURES GRID */}
      <section className="py-20 bg-slate-100/60 border-y border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="max-w-2xl mx-auto text-center space-y-3 mb-16">
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {t('features.title')}
            </h2>
            <p className="text-sm text-slate-600">
              {t('features.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Feature 1 */}
            <div className="p-2 rounded-3xl bg-white border border-slate-200/80 shadow-subtle hover:shadow-card transition-all duration-300">
              <div className="p-6 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="font-display text-lg font-bold text-slate-900">
                  {t('features.aiTitle')}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {t('features.aiDesc')}
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="p-2 rounded-3xl bg-white border border-slate-200/80 shadow-subtle hover:shadow-card transition-all duration-300">
              <div className="p-6 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                  <Building2 className="w-6 h-6" />
                </div>
                <h3 className="font-display text-lg font-bold text-slate-900">
                  {t('features.nearbyTitle')}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {t('features.nearbyDesc')}
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="p-2 rounded-3xl bg-white border border-slate-200/80 shadow-subtle hover:shadow-card transition-all duration-300">
              <div className="p-6 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                  <Clock className="w-6 h-6" />
                </div>
                <h3 className="font-display text-lg font-bold text-slate-900">
                  {t('features.availabilityTitle')}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {t('features.availabilityDesc')}
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="p-2 rounded-3xl bg-white border border-slate-200/80 shadow-subtle hover:shadow-card transition-all duration-300">
              <div className="p-6 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                  <Star className="w-6 h-6" />
                </div>
                <h3 className="font-display text-lg font-bold text-slate-900">
                  {t('features.reviewsTitle')}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {t('features.reviewsDesc')}
                </p>
              </div>
            </div>

            {/* Feature 5 */}
            <div className="p-2 rounded-3xl bg-white border border-slate-200/80 shadow-subtle hover:shadow-card transition-all duration-300">
              <div className="p-6 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="font-display text-lg font-bold text-slate-900">
                  {t('features.multilingualTitle')}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {t('features.multilingualDesc')}
                </p>
              </div>
            </div>

            {/* Feature 6 */}
            <div className="p-2 rounded-3xl bg-white border border-slate-200/80 shadow-subtle hover:shadow-card transition-all duration-300">
              <div className="p-6 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
                  <Calendar className="w-6 h-6" />
                </div>
                <h3 className="font-display text-lg font-bold text-slate-900">
                  {t('features.bookingTitle')}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {t('features.bookingDesc')}
                </p>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="max-w-2xl mx-auto text-center space-y-3 mb-16">
            <div className="inline-block px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-[10px] font-bold uppercase tracking-widest">
              Simple Step-by-Step Flow
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {t('howItWorks.title')}
            </h2>
            <p className="text-sm text-slate-600">
              {t('howItWorks.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            
            {/* Step 1 */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-subtle space-y-3">
              <div className="w-9 h-9 rounded-xl bg-slate-900 text-white font-extrabold text-sm flex items-center justify-center">
                1
              </div>
              <h4 className="font-display font-bold text-base text-slate-900">
                {t('howItWorks.step1Title')}
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t('howItWorks.step1Desc')}
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-subtle space-y-3">
              <div className="w-9 h-9 rounded-xl bg-brand-600 text-white font-extrabold text-sm flex items-center justify-center">
                2
              </div>
              <h4 className="font-display font-bold text-base text-slate-900">
                {t('howItWorks.step2Title')}
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t('howItWorks.step2Desc')}
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-subtle space-y-3">
              <div className="w-9 h-9 rounded-xl bg-slate-900 text-white font-extrabold text-sm flex items-center justify-center">
                3
              </div>
              <h4 className="font-display font-bold text-base text-slate-900">
                {t('howItWorks.step3Title')}
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t('howItWorks.step3Desc')}
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-subtle space-y-3">
              <div className="w-9 h-9 rounded-xl bg-brand-600 text-white font-extrabold text-sm flex items-center justify-center">
                4
              </div>
              <h4 className="font-display font-bold text-base text-slate-900">
                {t('howItWorks.step4Title')}
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t('howItWorks.step4Desc')}
              </p>
            </div>

          </div>

          {/* CTA Banner */}
          <div className="mt-16 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-brand-950 p-8 sm:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-elevated">
            <div className="space-y-2 max-w-xl text-center md:text-left">
              <h3 className="font-display text-2xl font-bold tracking-tight">
                Ready to find the right healthcare specialist?
              </h3>
              <p className="text-xs sm:text-sm text-slate-300">
                Start with our AI search or browse verified doctors and certified hospitals nearby.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => navigate('/patient/ai-search')}
                className="px-6 py-3 rounded-full bg-brand-500 hover:bg-brand-400 text-white font-semibold text-xs sm:text-sm transition-all shadow-md active:scale-95"
              >
                Try AI Health Search
              </button>
              <button
                onClick={() => navigate('/find-doctor')}
                className="px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm transition-all border border-white/20 active:scale-95"
              >
                Browse All Doctors
              </button>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
