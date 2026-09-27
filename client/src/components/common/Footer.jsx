import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  HeartHandshake, 
  ShieldAlert, 
  PhoneCall, 
  Mail, 
  MapPin, 
  Globe, 
  Heart,
  ExternalLink
} from 'lucide-react';

export default function Footer() {
  const { t, i18n } = useTranslation();

  const changeLanguage = (code) => {
    i18n.changeLanguage(code);
    localStorage.setItem('i18nextLng', code);
  };

  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Safety Disclaimer Banner */}
        <div className="rounded-3xl bg-slate-800/80 border border-slate-700/80 p-6 mb-12 shadow-card">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h4 className="font-display font-semibold text-white text-sm mb-1">
                {t('disclaimer.safetyTitle')}
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                {t('disclaimer.safetyText')}
              </p>
            </div>
            <div className="shrink-0 bg-rose-500/10 border border-rose-500/30 rounded-2xl px-4 py-2.5 text-center">
              <span className="block text-[10px] font-bold text-rose-300 uppercase tracking-wider">
                Emergency Helpline
              </span>
              <span className="text-base font-extrabold text-white">112 / 108</span>
            </div>
          </div>
        </div>

        {/* Footer Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-teal-400 flex items-center justify-center text-white shadow-md">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <span className="font-display font-bold text-xl tracking-tight text-white">
                Medi<span className="text-brand-400">Connect</span>
              </span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              MediConnect is an AI-assisted healthcare discovery platform dedicated to bridging patients with licensed doctors and certified hospitals through transparent proximity matching, live availability, and verified patient reviews.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Available in English, தமிழ் & हिन्दी</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h5 className="font-display text-xs font-bold text-white uppercase tracking-wider">
              Discovery
            </h5>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link to="/find-doctor" className="hover:text-brand-400 transition-colors">
                  Find a Doctor
                </Link>
              </li>
              <li>
                <Link to="/find-hospital" className="hover:text-brand-400 transition-colors">
                  Find Hospitals
                </Link>
              </li>
              <li>
                <Link to="/patient/ai-search" className="hover:text-brand-400 transition-colors flex items-center gap-1.5">
                  <span>AI Health Search</span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] bg-brand-500/20 text-brand-300 font-bold">
                    AI
                  </span>
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="hover:text-brand-400 transition-colors">
                  How It Works
                </Link>
              </li>
            </ul>
          </div>

          {/* User Portals */}
          <div className="space-y-3">
            <h5 className="font-display text-xs font-bold text-white uppercase tracking-wider">
              Portals
            </h5>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link to="/login" className="hover:text-brand-400 transition-colors">
                  Patient Login
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-brand-400 transition-colors">
                  Doctor Registration
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-brand-400 transition-colors">
                  About Our Mission
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-brand-400 transition-colors">
                  Admin Access
                </Link>
              </li>
            </ul>
          </div>

          {/* Languages & Regional */}
          <div className="space-y-3">
            <h5 className="font-display text-xs font-bold text-white uppercase tracking-wider">
              Languages
            </h5>
            <div className="flex flex-col gap-1.5">
              <button
                onClick={() => changeLanguage('en')}
                className={`text-left text-xs px-2.5 py-1.5 rounded-lg transition-colors flex items-center justify-between ${
                  i18n.language === 'en'
                    ? 'bg-slate-800 text-brand-400 font-semibold'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                }`}
              >
                <span>English</span>
                <span className="text-[10px] text-slate-500">EN</span>
              </button>
              <button
                onClick={() => changeLanguage('ta')}
                className={`text-left text-xs px-2.5 py-1.5 rounded-lg transition-colors flex items-center justify-between ${
                  i18n.language === 'ta'
                    ? 'bg-slate-800 text-brand-400 font-semibold'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                }`}
              >
                <span>தமிழ் (Tamil)</span>
                <span className="text-[10px] text-slate-500">TA</span>
              </button>
              <button
                onClick={() => changeLanguage('hi')}
                className={`text-left text-xs px-2.5 py-1.5 rounded-lg transition-colors flex items-center justify-between ${
                  i18n.language === 'hi'
                    ? 'bg-slate-800 text-brand-400 font-semibold'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                }`}
              >
                <span>हिन्दी (Hindi)</span>
                <span className="text-[10px] text-slate-500">HI</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Credits & Legal */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>{t('footer.copyright')}</p>
          <div className="flex items-center gap-6">
            <a href="#privacy" className="hover:text-slate-400 transition-colors">
              {t('footer.privacy')}
            </a>
            <a href="#terms" className="hover:text-slate-400 transition-colors">
              {t('footer.terms')}
            </a>
            <a href="#contact" className="hover:text-slate-400 transition-colors">
              {t('footer.contact')}
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}
