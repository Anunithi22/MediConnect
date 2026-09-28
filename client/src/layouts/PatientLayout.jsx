import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  Heart,
  Building2,
  History,
  Star,
  Bell,
  User,
  Settings,
  Sparkles,
  LogOut,
  Menu,
  X,
  ChevronRight,
  ShieldCheck,
  Search,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import patientService from '../services/patientService';

export default function PatientLayout() {
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Poll or fetch unread notifications count
  useEffect(() => {
    let isMounted = true;
    const fetchUnread = async () => {
      try {
        const res = await patientService.getNotifications();
        if (isMounted && res.success) {
          setUnreadCount(res.unreadCount || 0);
        }
      } catch (err) {
        // Silent fail for polling
      }
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 30000); // 30s refresh
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [location.pathname]);

  const navItems = [
    { label: 'Dashboard', path: '/patient/dashboard', icon: LayoutDashboard },
    { label: 'My Appointments', path: '/patient/appointments', icon: Calendar },
    { label: 'Saved Doctors', path: '/patient/saved-doctors', icon: Heart },
    { label: 'Saved Hospitals', path: '/patient/saved-hospitals', icon: Building2 },
    { label: 'Search History', path: '/patient/search-history', icon: History },
    { label: 'My Reviews', path: '/patient/reviews', icon: Star },
    {
      label: 'Notifications',
      path: '/patient/notifications',
      icon: Bell,
      badge: unreadCount > 0 ? unreadCount : null,
    },
    { label: 'My Profile', path: '/patient/profile', icon: User },
    { label: 'Settings', path: '/patient/settings', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    if (path === '/patient/dashboard') {
      return location.pathname === '/patient/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Patient Bar */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200/80 px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            type="button"
            className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Logo Brand */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-700 to-brand-500 flex items-center justify-center text-white shadow-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-display font-bold text-base tracking-tight text-slate-900 hidden sm:inline">
              Medi<span className="text-brand-600">Connect</span>
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200/70">
              Patient Portal
            </span>
          </Link>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            to="/find-doctor"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Find Care</span>
          </Link>

          <Link
            to="/patient/notifications"
            className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>

          <div className="h-5 w-px bg-slate-200" />

          {/* User Teaser */}
          <Link
            to="/patient/profile"
            className="flex items-center gap-2 p-1 pl-2 pr-2.5 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <div className="w-7 h-7 rounded-lg bg-brand-100 border border-brand-300 text-brand-700 flex items-center justify-center font-bold text-xs">
              {currentUser?.fullName?.charAt(0) || 'P'}
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-xs font-semibold text-slate-800 leading-none">
                {currentUser?.fullName || 'Patient'}
              </p>
              <p className="text-[10px] text-slate-500 leading-tight">Patient Account</p>
            </div>
          </Link>

          <button
            onClick={handleLogout}
            title="Sign Out"
            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Body with Sidebar + Content */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col w-64 shrink-0">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 flex flex-col h-[calc(100vh-7.5rem)] sticky top-20">
            {/* User Profile Summary Card */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 mb-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                {currentUser?.fullName?.charAt(0) || 'P'}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-bold text-slate-900 truncate">
                  {currentUser?.fullName || 'Patient'}
                </h4>
                <p className="text-[11px] text-slate-500 truncate">{currentUser?.email}</p>
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="space-y-1 flex-1 overflow-y-auto pr-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                      active
                        ? 'bg-brand-50 text-brand-700 font-bold border border-brand-200/60 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          active ? 'text-brand-600' : 'text-slate-400'
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Safety & System Indicator */}
            <div className="pt-4 border-t border-slate-100 mt-2">
              <div className="p-2.5 rounded-xl bg-brand-50/60 border border-brand-100/80 text-[11px] text-brand-800">
                <div className="flex items-center gap-1.5 font-bold mb-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
                  <span>Verified Platform</span>
                </div>
                <p className="text-[10px] text-slate-600 leading-snug">
                  MediConnect assists discovery and appointments. Non-diagnostic.
                </p>
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Slide-out Drawer */}
            <div className="relative flex flex-col w-72 max-w-[80vw] bg-white h-full shadow-2xl p-4 z-10 animate-in slide-in-from-left duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <span className="font-display font-bold text-sm text-slate-900">Patient Menu</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-lg text-slate-500 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 mb-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-brand-600 text-white flex items-center justify-center font-bold text-sm">
                  {currentUser?.fullName?.charAt(0) || 'P'}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-slate-900 truncate">
                    {currentUser?.fullName}
                  </h4>
                  <p className="text-[10px] text-slate-500 truncate">{currentUser?.email}</p>
                </div>
              </div>

              <nav className="space-y-1 flex-1 overflow-y-auto">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium ${
                        active
                          ? 'bg-brand-50 text-brand-700 font-bold border border-brand-200/60'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${active ? 'text-brand-600' : 'text-slate-400'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>

              <div className="pt-3 border-t border-slate-100 mt-2">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content Outlet */}
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
