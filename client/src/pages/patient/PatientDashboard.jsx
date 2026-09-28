import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  Search,
  Building2,
  Sparkles,
  Heart,
  ChevronRight,
  User,
  ShieldAlert,
  CheckCircle2,
  CalendarCheck,
  AlertCircle,
  ExternalLink,
  ArrowRight,
  Bell,
} from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../../context/AuthContext';
import patientService from '../../services/patientService';
import { PageLoader, EmptyState, Badge, Button } from '../../components/ui';

export default function PatientDashboard() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await patientService.getDashboardSummary();
        if (isMounted && res.success) {
          setData(res.data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Unable to load dashboard data.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDashboard();
    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return <PageLoader message="Loading your health portal..." />;
  }

  if (error) {
    return (
      <div className="bg-rose-50 border border-rose-200 text-rose-700 p-6 rounded-2xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  const { stats, upcomingAppointment, recentAppointments, recentSearchHistory, patient } = data || {};

  return (
    <div className="space-y-6">
      {/* 1. Welcome Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-900 via-brand-800 to-slate-900 p-6 sm:p-8 text-white shadow-card">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[11px] font-semibold text-teal-200 border border-white/10">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Personalized Care Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight">
              Welcome back, {currentUser?.fullName || 'Patient'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Explore trusted medical specialists, manage upcoming consultations, and keep track
              of your healthcare appointments in Chennai.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap gap-3 shrink-0">
            <Link
              to="/find-doctor"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-teal-400 hover:bg-teal-300 text-slate-900 text-xs font-bold transition-all shadow-md active:scale-95"
            >
              <Search className="w-4 h-4" />
              <span>Find Specialists</span>
            </Link>
            <Link
              to="/patient/ai-search"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/15 backdrop-blur-xs"
            >
              <Sparkles className="w-4 h-4 text-teal-300" />
              <span>AI Assistant</span>
            </Link>
          </div>
        </div>

        {/* Soft Background Accents */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-brand-500/20 blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-1/3 w-48 h-48 rounded-full bg-teal-400/10 blur-2xl pointer-events-none" />
      </div>

      {/* 2. Key Metrics Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Link
          to="/patient/appointments"
          className="group p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-brand-300 hover:shadow-card transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-500">Consultations</span>
            <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-display font-extrabold text-slate-900">
            {stats?.totalAppointments || 0}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Total booked care</p>
        </Link>

        <Link
          to="/patient/saved-doctors"
          className="group p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-brand-300 hover:shadow-card transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-500">Saved Doctors</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Heart className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-display font-extrabold text-slate-900">
            {stats?.savedDoctorsCount || 0}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Bookmarked specialists</p>
        </Link>

        <Link
          to="/patient/saved-hospitals"
          className="group p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-brand-300 hover:shadow-card transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-500">Saved Hospitals</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-display font-extrabold text-slate-900">
            {stats?.savedHospitalsCount || 0}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Care facilities</p>
        </Link>

        <Link
          to="/patient/notifications"
          className="group p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-brand-300 hover:shadow-card transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-500">Alerts & Updates</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Bell className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-display font-extrabold text-slate-900 flex items-center gap-2">
            <span>{stats?.unreadNotificationsCount || 0}</span>
            {stats?.unreadNotificationsCount > 0 && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-rose-500 text-white">
                New
              </span>
            )}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Unread messages</p>
        </Link>
      </div>

      {/* 3. Upcoming Appointment Hero Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 sm:p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-50 border border-brand-200 text-brand-700 flex items-center justify-center">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                Next Upcoming Consultation
              </h2>
              <p className="text-[11px] text-slate-500">Confirmed clinic appointment</p>
            </div>
          </div>

          <Link
            to="/patient/appointments"
            className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {upcomingAppointment ? (
          <div className="bg-gradient-to-br from-brand-50/70 via-white to-slate-50/80 rounded-2xl border border-brand-100/90 p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-3 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {upcomingAppointment.status?.toUpperCase()}
                </span>
                <span className="text-xs font-semibold text-slate-500 font-mono">
                  ID: {upcomingAppointment.bookingId}
                </span>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  {upcomingAppointment.doctor?.user?.fullName || 'Specialist Doctor'}
                </h3>
                <p className="text-xs font-medium text-brand-700">
                  {upcomingAppointment.doctor?.specialization?.name || 'Medical Specialist'} •{' '}
                  {upcomingAppointment.hospital?.name}
                </p>
              </div>

              <div className="flex flex-wrap gap-4 text-xs text-slate-600 pt-1">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    {upcomingAppointment.date
                      ? format(new Date(upcomingAppointment.date), 'EEEE, MMMM d, yyyy')
                      : 'Date scheduled'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-semibold text-slate-800">
                    {upcomingAppointment.timeSlot}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{upcomingAppointment.hospital?.address || 'Chennai'}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 w-full lg:w-auto shrink-0">
              <Link
                to={`/patient/appointments/${upcomingAppointment._id}`}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-all shadow-xs"
              >
                <span>View Consultation Details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                to={`/find-hospital`}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors"
              >
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>Hospital Directions</span>
              </Link>
            </div>
          </div>
        ) : (
          <EmptyState
            icon={Calendar}
            title="No upcoming consultations scheduled"
            description="When you book a consultation with a verified doctor, it will appear right here with timing and directions."
            actionLabel="Browse Available Doctors"
            actionTo="/find-doctor"
          />
        )}
      </div>

      {/* 4. Two-Column Grid: Recent Appointments & Discovery Shortcuts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent Consultations Table */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 sm:p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                Recent Appointments
              </h2>
              <p className="text-[11px] text-slate-500">History of your scheduled care</p>
            </div>
            <Link
              to="/patient/appointments"
              className="text-xs font-semibold text-brand-600 hover:text-brand-700"
            >
              Full History
            </Link>
          </div>

          {recentAppointments && recentAppointments.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {recentAppointments.map((apt) => (
                <div
                  key={apt._id}
                  className="py-3.5 flex items-center justify-between gap-4 hover:bg-slate-50/70 rounded-xl px-2 -mx-2 transition-colors"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900 truncate">
                        {apt.doctor?.user?.fullName || 'Doctor'}
                      </span>
                      <Badge
                        variant={
                          apt.status === 'completed'
                            ? 'success'
                            : apt.status === 'confirmed'
                            ? 'primary'
                            : 'neutral'
                        }
                        size="sm"
                      >
                        {apt.status}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">
                      {apt.hospital?.name} •{' '}
                      {apt.date ? format(new Date(apt.date), 'MMM d, yyyy') : 'Recent'} at{' '}
                      {apt.timeSlot}
                    </p>
                  </div>

                  <Link
                    to={`/patient/appointments/${apt._id}`}
                    className="shrink-0 p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-colors"
                    title="View details"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-slate-400 text-xs">
              No prior consultations found.
            </div>
          )}
        </div>

        {/* Right Column: Search History & AI Preview Card */}
        <div className="space-y-6">
          {/* Recent Searches */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 sm:p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
                <Search className="w-4 h-4 text-brand-600" />
                <span>Recent Searches</span>
              </h3>
              <Link
                to="/patient/search-history"
                className="text-[11px] font-semibold text-brand-600 hover:text-brand-700"
              >
                Manage
              </Link>
            </div>

            {recentSearchHistory && recentSearchHistory.length > 0 ? (
              <div className="space-y-2">
                {recentSearchHistory.map((item) => (
                  <Link
                    key={item._id}
                    to={`/find-doctor?q=${encodeURIComponent(item.query)}`}
                    className="block p-2.5 rounded-xl bg-slate-50 hover:bg-brand-50/70 border border-slate-100 transition-colors group"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-800 group-hover:text-brand-700 truncate">
                        {item.query}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-600 shrink-0" />
                    </div>
                    {item.specialty && (
                      <span className="text-[10px] text-slate-500 mt-0.5 block truncate">
                        Specialty: {item.specialty}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-3 text-center">No recent searches yet.</p>
            )}
          </div>

          {/* AI Recommendation Feature Preview (Phase 7 Roadmap) */}
          <div className="bg-gradient-to-br from-indigo-50/90 via-white to-teal-50/60 rounded-3xl border border-indigo-100 p-5 shadow-xs">
            <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs mb-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Smart Recommendation Engine</span>
            </div>
            <p className="text-xs text-slate-700 font-medium mb-1.5">
              Coming in Phase 7: AI-Assisted Matching
            </p>
            <p className="text-[11px] text-slate-500 leading-relaxed mb-4">
              Matches doctors and hospitals based on symptoms, wait times, proximity to Chennai
              neighborhoods, and verified patient feedback.
            </p>
            <Link
              to="/patient/ai-search"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 hover:text-indigo-900"
            >
              <span>Explore AI Search Preview</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
