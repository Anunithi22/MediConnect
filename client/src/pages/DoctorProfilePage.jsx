import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Stethoscope,
  Building2,
  MapPin,
  Star,
  Award,
  Calendar,
  Clock,
  Globe,
  Heart,
  ShieldCheck,
  ChevronLeft,
  Share2,
  Phone,
  Mail,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Info,
  ArrowRight,
  Scale,
  Video,
  GraduationCap,
  Briefcase,
} from 'lucide-react';
import toast from 'react-hot-toast';
import discoveryService from '../services/discoveryService';
import patientService from '../services/patientService';
import { useAuth } from '../context/AuthContext';
import { Button, Badge, Modal } from '../components/ui';

export default function DoctorProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();

  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [savingAction, setSavingAction] = useState(false);
  const [showBookingNotice, setShowBookingNotice] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchDoctor = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await discoveryService.getDoctorById(id);
        if (isMounted && res.success) {
          setDoctor(res.data);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err.response?.status === 404
              ? 'Doctor profile not found or is currently not publicly active.'
              : err.response?.data?.message || 'Failed to load doctor profile.'
          );
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDoctor();

    return () => {
      isMounted = false;
    };
  }, [id]);

  // Check saved state for patient
  useEffect(() => {
    if (isAuthenticated && currentUser?.role === 'patient' && doctor) {
      patientService
        .getSavedDoctors()
        .then((res) => {
          if (res.success) {
            const hasDoctor = res.data.some(
              (item) => (item.doctor?._id || item.doctor).toString() === doctor.id
            );
            setIsSaved(hasDoctor);
          }
        })
        .catch(() => {});
    }
  }, [isAuthenticated, currentUser, doctor]);

  const handleToggleSave = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in as a patient to bookmark doctors.');
      return;
    }
    if (currentUser?.role !== 'patient') {
      toast.error('Only patient accounts can bookmark doctors.');
      return;
    }

    try {
      setSavingAction(true);
      if (isSaved) {
        await patientService.removeSavedDoctor(doctor.id);
        setIsSaved(false);
        toast.success('Removed doctor from bookmarks.');
      } else {
        await patientService.saveDoctor(doctor.id);
        setIsSaved(true);
        toast.success('Saved doctor to your bookmarks.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update bookmark.');
    } finally {
      setSavingAction(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: `Dr. ${doctor?.name} | MediConnect`,
          text: `Check out Dr. ${doctor?.name}, ${doctor?.specialization} at ${doctor?.hospital?.name || 'MediConnect'}.`,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Profile URL copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-pulse">
        <div className="h-6 bg-slate-200 rounded-md w-48" />
        <div className="p-8 rounded-3xl bg-white border border-slate-200 space-y-6">
          <div className="flex flex-col sm:flex-row gap-6 items-center">
            <div className="w-32 h-32 rounded-3xl bg-slate-200" />
            <div className="flex-1 space-y-3 w-full">
              <div className="h-7 bg-slate-200 rounded-md w-1/3" />
              <div className="h-4 bg-slate-200 rounded-md w-1/4" />
              <div className="h-4 bg-slate-100 rounded-md w-1/2" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <div className="py-16 max-w-xl mx-auto px-4 text-center space-y-5">
        <div className="w-16 h-16 rounded-3xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="font-display text-2xl font-bold text-slate-900">
          Doctor Profile Unavailable
        </h2>
        <p className="text-sm text-slate-600">
          {error || 'The requested doctor is not currently available for public viewing.'}
        </p>
        <div className="pt-2">
          <Link to="/find-doctor">
            <Button variant="dark" leadingIcon={ChevronLeft}>
              Back to Doctor Directory
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/find-doctor"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-brand-600 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to All Doctors</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            to={`/compare?type=doctors&ids=${doctor.id}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors"
          >
            <Scale className="w-3.5 h-3.5 text-brand-600" />
            <span>Compare</span>
          </Link>

          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors"
          >
            <Share2 className="w-3.5 h-3.5 text-slate-500" />
            <span>Share</span>
          </button>

          <button
            onClick={handleToggleSave}
            disabled={savingAction}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors shadow-2xs ${
              isSaved
                ? 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-rose-500 text-rose-500' : 'text-slate-500'}`} />
            <span>{isSaved ? 'Saved' : 'Save'}</span>
          </button>
        </div>
      </div>

      {/* Main Profile Header Card */}
      <div className="rounded-3xl bg-white border border-slate-200/80 shadow-card p-6 sm:p-8">
        <div className="flex flex-col md:flex-row gap-6 sm:gap-8 items-start">
          {/* Avatar / Portrait */}
          <div className="relative shrink-0 mx-auto md:mx-0">
            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-3xl overflow-hidden border-2 border-slate-100 shadow-md">
              <img
                src={doctor.profileImage}
                alt={doctor.name}
                className="w-full h-full object-cover object-center"
              />
            </div>
            {doctor.isAvailable && (
              <span className="absolute bottom-2 right-2 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500 text-white shadow-xs border-2 border-white flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                <span>Available</span>
              </span>
            )}
          </div>

          {/* Core Info */}
          <div className="flex-1 space-y-3 text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-extrabold">
                <Stethoscope className="w-3.5 h-3.5 text-brand-600" />
                <span>{doctor.specialization}</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verified Specialist</span>
              </span>
            </div>

            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900">
                {doctor.name.startsWith('Dr.') ? doctor.name : `Dr. ${doctor.name}`}
              </h1>
              {doctor.qualification && (
                <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-0.5">
                  {doctor.qualification}
                </p>
              )}

              {/* Consultation Modes */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-1.5 pt-1.5">
                {doctor.consultationModes?.map((mode, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold"
                  >
                    {mode.toLowerCase().includes('online') ? (
                      <Video className="w-3 h-3 text-brand-600" />
                    ) : (
                      <Building2 className="w-3 h-3 text-emerald-600" />
                    )}
                    <span>{mode} Consultation</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Hospital Affiliation */}
            {doctor.hospital && doctor.hospital.name && (
              <div className="flex items-center justify-center md:justify-start gap-2 text-xs sm:text-sm text-slate-700">
                <Building2 className="w-4 h-4 text-brand-600 shrink-0" />
                {doctor.hospital.id ? (
                  <Link
                    to={`/hospital/${doctor.hospital.id}`}
                    className="font-bold text-brand-700 hover:underline hover:text-brand-900"
                  >
                    {doctor.hospital.name}
                  </Link>
                ) : (
                  <span className="font-bold">{doctor.hospital.name}</span>
                )}
                {doctor.hospital.city && (
                  <span className="text-slate-400 font-normal">• {doctor.hospital.city}</span>
                )}
              </div>
            )}

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-center md:text-left">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                  Experience
                </span>
                <span className="font-display font-extrabold text-sm sm:text-base text-slate-900">
                  {doctor.experience}+ Years
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-center md:text-left">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                  Rating
                </span>
                <span className="font-display font-extrabold text-sm sm:text-base text-slate-900 flex items-center justify-center md:justify-start gap-1">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>{Number(doctor.rating).toFixed(1)}</span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    ({doctor.reviewCount})
                  </span>
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-center md:text-left">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                  Consultation
                </span>
                <span className="font-display font-extrabold text-sm sm:text-base text-brand-700">
                  ₹{doctor.consultationFee}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-center md:text-left">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                  Languages
                </span>
                <span className="font-display font-bold text-xs sm:text-sm text-slate-800 truncate block">
                  {doctor.languages?.join(', ') || 'English'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Details + Booking Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left 2 Cols: Clinical Details, Services, Hospital Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* About Doctor */}
          <section className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
            <h3 className="font-display font-bold text-lg text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-brand-600" />
              <span>Professional Biography & Background</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {doctor.bio ||
                `Dr. ${doctor.name} is a certified specialist in ${doctor.specialization} with over ${doctor.experience} years of clinical practice. Dedicated to delivering patient-centric care, evidence-based diagnoses, and individualized treatment planning at ${doctor.hospital?.name || 'accredited clinical centers'}.`}
            </p>
          </section>

          {/* Education & Qualifications */}
          {doctor.education && doctor.education.length > 0 && (
            <section className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
              <h3 className="font-display font-bold text-lg text-slate-900 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-brand-600" />
                <span>Education & Medical Qualifications</span>
              </h3>
              <div className="space-y-2">
                {doctor.education.map((edu, idx) => (
                  <div key={idx} className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="text-xs sm:text-sm font-semibold text-slate-800">{edu}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Experience History */}
          {doctor.experienceHistory && doctor.experienceHistory.length > 0 && (
            <section className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
              <h3 className="font-display font-bold text-lg text-slate-900 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-brand-600" />
                <span>Clinical Appointments & Career Milestones</span>
              </h3>
              <div className="space-y-2">
                {doctor.experienceHistory.map((exp, idx) => (
                  <div key={idx} className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0" />
                    <span className="text-xs sm:text-sm font-semibold text-slate-800">{exp}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* OPD Schedule & Availability */}
          <section className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-lg text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-brand-600" />
                <span>Hospital OPD Consultation Schedule</span>
              </h3>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                Active Schedule
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                  OPD Shift Hours
                </span>
                <span className="font-display font-bold text-xs sm:text-sm text-slate-900 block">
                  {doctor.schedule?.workingHours?.start || '09:00 AM'} – {doctor.schedule?.workingHours?.end || '05:00 PM'}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                  Break Interval
                </span>
                <span className="font-display font-bold text-xs sm:text-sm text-slate-900 block">
                  {doctor.schedule?.breakTime?.start || '01:00 PM'} – {doctor.schedule?.breakTime?.end || '02:00 PM'}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                  Slot Duration
                </span>
                <span className="font-display font-bold text-xs sm:text-sm text-slate-900 block">
                  {doctor.schedule?.slotDurationMinutes || 30} Mins / Patient
                </span>
              </div>
            </div>

            <div className="pt-2">
              <span className="text-xs font-bold text-slate-700 block mb-2">Weekly Consultation Days</span>
              <div className="flex flex-wrap gap-1.5">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => {
                  const isActive = doctor.schedule?.workingDays?.includes(day);
                  return (
                    <span
                      key={day}
                      className={`px-3 py-1 rounded-xl text-xs font-bold border transition-colors ${
                        isActive
                          ? 'bg-brand-50 border-brand-200 text-brand-800'
                          : 'bg-slate-100 border-slate-200 text-slate-400 opacity-60'
                      }`}
                    >
                      {day.slice(0, 3)}
                    </span>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Clinical Services */}
          <section className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="font-display font-bold text-lg text-slate-900 flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-brand-600" />
              <span>Specialized Clinical Services</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {doctor.services && doctor.services.length > 0 ? (
                doctor.services.map((service, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-800 leading-tight">
                        {service}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        In-person consultation & diagnostic review
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-xs font-semibold text-slate-700">
                    Comprehensive {doctor.specialization} Consultation
                  </span>
                </div>
              )}
            </div>
          </section>

          {/* Hospital & Clinic Location */}
          {doctor.hospital && (
            <section className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-lg text-slate-900 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-brand-600" />
                  <span>Hospital Affiliation & Practice Location</span>
                </h3>
                {doctor.hospital.id && (
                  <Link
                    to={`/hospital/${doctor.hospital.id}`}
                    className="text-xs font-bold text-brand-600 hover:text-brand-800 flex items-center gap-1"
                  >
                    <span>View Hospital</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900">
                      {doctor.hospital.name}
                    </h4>
                    <p className="text-xs text-slate-600 mt-1 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{doctor.hospital.address || doctor.hospital.city || 'Chennai'}</span>
                    </p>
                  </div>
                  {doctor.hospital.rating && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold shrink-0">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{Number(doctor.hospital.rating).toFixed(1)}</span>
                    </span>
                  )}
                </div>

                {doctor.hospital.phone && (
                  <div className="text-xs text-slate-600 flex items-center gap-2 pt-2 border-t border-slate-200/60">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>Clinic Helpline: {doctor.hospital.phone}</span>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Verified Patient Reviews Summary Preview */}
          <section className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-lg text-slate-900 flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                <span>Patient Ratings & Feedback</span>
              </h3>
              <span className="text-xs text-slate-500 font-semibold">
                {doctor.reviewCount} Verified Reviews
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row items-center gap-6">
              <div className="text-center sm:text-left space-y-1">
                <div className="font-display text-4xl font-extrabold text-slate-900">
                  {Number(doctor.rating).toFixed(1)}
                </div>
                <div className="flex items-center justify-center sm:justify-start gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(doctor.rating)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-300'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-[11px] text-slate-500">Based on verified patient visits</p>
              </div>

              <div className="flex-1 w-full space-y-1.5 text-xs text-slate-600 border-t sm:border-t-0 sm:border-l border-slate-200 pt-3 sm:pt-0 sm:pl-6">
                <div className="flex items-center justify-between">
                  <span>Doctor Explanation</span>
                  <span className="font-bold text-emerald-700">98% Satisfied</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Staff Courtesy & Hygiene</span>
                  <span className="font-bold text-emerald-700">96% Positive</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Wait Time Management</span>
                  <span className="font-bold text-brand-700">92% On-time</span>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right Col: Consultation & Action Box */}
        <aside className="space-y-6 sticky top-20">
          <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/80 shadow-card space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-xs font-semibold text-slate-500 block">Consultation Fee</span>
                <span className="font-display text-2xl font-extrabold text-slate-900">
                  ₹{doctor.consultationFee}
                </span>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-brand-50 text-brand-700 border border-brand-200">
                In-Clinic & OPD
              </span>
            </div>

            {/* Availability Notice */}
            <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100 text-emerald-900 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-extrabold">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                <span>Next Slot Availability</span>
              </div>
              <p className="text-[11px] text-emerald-800">
                Standard OPD hours: Monday – Saturday, 09:30 AM – 04:30 PM.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5">
              <Button
                variant="primary"
                className="w-full justify-center shadow-md py-3 text-sm"
                trailingIcon={ArrowRight}
                onClick={() => setShowBookingNotice(true)}
              >
                Book Consultation
              </Button>

              <button
                type="button"
                onClick={handleToggleSave}
                disabled={savingAction}
                className={`w-full py-2.5 rounded-2xl border text-xs font-bold transition-colors flex items-center justify-center gap-2 ${
                  isSaved
                    ? 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Heart className={`w-4 h-4 ${isSaved ? 'fill-rose-500 text-rose-500' : 'text-slate-500'}`} />
                <span>{isSaved ? 'Remove from Saved Doctors' : 'Save to My Saved Doctors'}</span>
              </button>
            </div>

            {/* Trust and Safety Badges */}
            <div className="space-y-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Verified medical council credentials</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Direct hospital front-desk confirmation</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Zero convenience fees on discovery</span>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Booking Notice Modal (Phase 9 Bridge) */}
      {showBookingNotice && (
        <Modal
          isOpen={showBookingNotice}
          onClose={() => setShowBookingNotice(false)}
          title="Online Appointment Booking"
        >
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-brand-50 border border-brand-100 flex items-start gap-3">
              <Calendar className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />
              <div className="text-xs text-brand-900 space-y-1">
                <p className="font-bold">
                  Direct Live Slot Booking Engine arrives in Phase 9!
                </p>
                <p className="text-brand-800 leading-relaxed">
                  Real-time calendar slot reservation and multi-doctor schedule coordination will unlock in the next milestone.
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              In the meantime, you can bookmark <strong>Dr. {doctor.name}</strong> to your patient dashboard for instant one-click booking when slots go live!
            </p>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <Button variant="ghost" size="sm" onClick={() => setShowBookingNotice(false)}>
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  handleToggleSave();
                  setShowBookingNotice(false);
                }}
              >
                {isSaved ? 'Already Saved' : 'Save Doctor to Dashboard'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
