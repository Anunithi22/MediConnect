import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  HeartHandshake, 
  Search, 
  Building2, 
  Sparkles, 
  HelpCircle, 
  Info, 
  Menu, 
  X, 
  UserPlus, 
  LogIn, 
  LogOut,
  User,
  ArrowRight,
  ShieldCheck,
  LayoutDashboard
} from 'lucide-react';
import LanguageSelector from './LanguageSelector';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { t } = useTranslation();
  const location = useLocation();
  const { currentUser, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Check active state
  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { name: t('nav.home'), path: '/', icon: HeartHandshake },
    { name: t('nav.findDoctor'), path: '/find-doctor', icon: Search },
    { name: t('nav.findHospital'), path: '/find-hospital', icon: Building2 },
    { name: t('nav.aiAssistant'), path: '/patient/ai-search', icon: Sparkles, badge: 'AI' },
    { name: t('nav.howItWorks'), path: '/how-it-works', icon: HelpCircle },
    { name: t('nav.about'), path: '/about', icon: Info },
  ];

  return (
    <header className="sticky top-0 z-40 w-full transition-all">
      {/* Top micro-banner for emergency awareness */}
      <div className="bg-slate-900 text-slate-300 text-[11px] py-1.5 px-4 text-center border-b border-slate-800 flex items-center justify-center gap-2">
        <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span>{t('disclaimer.safetyTitle')}: MediConnect helps discover healthcare options.</span>
        <span className="hidden md:inline text-slate-400">|</span>
        <span className="hidden md:inline text-rose-300 font-medium">In emergency call 112 / 108</span>
      </div>

      {/* Floating Island Navigation Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <nav className="glass-panel rounded-3xl px-4 lg:px-6 py-2.5 shadow-card flex items-center justify-between">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-700 via-brand-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform duration-200">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display font-extrabold text-lg tracking-tight text-slate-900">
                  Medi<span className="text-brand-600">Connect</span>
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-brand-50 text-brand-700 uppercase tracking-wider border border-brand-200/60">
                  Care
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium -mt-0.5 hidden sm:block">
                Find the Right Care, Closer to You
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all relative ${
                    active
                      ? 'bg-brand-50 text-brand-700 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${active ? 'text-brand-600' : 'text-slate-400'}`} />
                  <span>{link.name}</span>
                  {link.badge && (
                    <span className="px-1.5 py-0.2 rounded-full text-[9px] font-extrabold bg-gradient-to-r from-amber-500 to-brand-500 text-white shadow-xs">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right Action Island (Language + Auth) */}
          <div className="hidden sm:flex items-center gap-2.5">
            <LanguageSelector />

            <div className="h-4 w-px bg-slate-200" />

            {isAuthenticated && currentUser ? (
              <div className="flex items-center gap-2">
                <Link
                  to={`/${currentUser.role}/dashboard`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-xs font-bold text-brand-800 hover:bg-brand-100 transition-colors"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-brand-600" />
                  <span>Dashboard</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-brand-600 text-white uppercase font-extrabold">
                    {currentUser.role}
                  </span>
                </Link>

                <button
                  onClick={logout}
                  title="Sign Out"
                  className="p-1.5 rounded-full border border-slate-200 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 text-slate-500 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="flex items-center gap-1 px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <LogIn className="w-3.5 h-3.5 text-slate-500" />
                  <span>{t('nav.login')}</span>
                </Link>

                <Link
                  to="/register"
                  className="group flex items-center gap-1.5 pl-3.5 pr-1.5 py-1.5 rounded-full bg-slate-900 text-white text-xs font-semibold hover:bg-brand-600 transition-all shadow-sm active:scale-95"
                >
                  <span>{t('nav.register')}</span>
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center transition-transform group-hover:translate-x-0.5">
                    <ArrowRight className="w-3 h-3 text-white" />
                  </div>
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger button */}
          <div className="flex sm:hidden items-center gap-2">
            <LanguageSelector />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              type="button"
              aria-label="Toggle Menu"
              className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </nav>

        {/* Mobile Dropdown Panel */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-2 p-3 rounded-2xl glass-panel shadow-elevated border border-slate-200/80 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="space-y-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.path);
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                      active
                        ? 'bg-brand-50 text-brand-700'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 text-brand-600" />
                      <span>{link.name}</span>
                    </div>
                    {link.badge && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-600 text-white">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>

            <div className="pt-3 mt-3 border-t border-slate-100">
              {isAuthenticated && currentUser ? (
                <div className="space-y-2">
                  <Link
                    to={`/${currentUser.role}/dashboard`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-brand-600 text-xs font-bold text-white shadow-sm"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Go to {currentUser.role.toUpperCase()} Dashboard</span>
                  </Link>

                  <button
                    onClick={() => { setMobileMenuOpen(false); logout(); }}
                    className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <LogOut className="w-3.5 h-3.5 text-slate-500" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>{t('nav.login')}</span>
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-brand-600 text-xs font-semibold text-white shadow-sm"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>{t('nav.register')}</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
