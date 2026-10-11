import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import {
  Building2,
  MapPin,
  Star,
  HeartPulse,
  Phone,
  Mail,
  Globe,
  Bed,
  CheckCircle2,
  Heart,
  Share2,
  ChevronLeft,
  Users,
  AlertCircle,
  Clock,
  ShieldCheck,
  Stethoscope,
  ArrowRight,
  Scale,
  Navigation,
} from 'lucide-react';
import toast from 'react-hot-toast';
import discoveryService from '../services/discoveryService';
import patientService from '../services/patientService';
import { useAuth } from '../context/AuthContext';
import { DoctorCard, Button, Badge } from '../components/ui';

export default function HospitalProfilePage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { currentUser, isAuthenticated } = useAuth();

  const [hospital, setHospital] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [error, setError] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [savingAction, setSavingAction] = useState(false);
  const [savedDoctorIds, setSavedDoctorIds] = useState(new Set());

  // Load hospital profile
  useEffect(() => {
    let isMounted = true;
    const fetchHospital = async () => {
      try {
        setLoading(true);
        setError(null);
        const params = {};
        const userLat = searchParams.get('latitude');
        const userLng = searchParams.get('longitude');
        const userUnit = searchParams.get('unit');
        if (userLat && userLng) {
          params.latitude = Number(userLat);
          params.longitude = Number(userLng);
          if (userUnit) params.unit = userUnit;
        }

        const res = await discoveryService.getHospitalById(id, params);
        if (isMounted && res.success) {
          setHospital(res.data);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err.response?.status === 404
              ? 'Hospital not found or currently unavailable.'
              : err.response?.data?.message || 'Failed to load hospital details.'
          );
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchHospital();

    return () => {
      isMounted = false;
    };
  }, [id, searchParams]);

  // Load practicing doctors for this hospital
  useEffect(() => {
    let isMounted = true;
    const fetchDoctors = async () => {
      try {
        setLoadingDoctors(true);
        const res = await discoveryService.getHospitalDoctors(id);
        if (isMounted && res.success) {
          setDoctors(res.data || []);
        }
      } catch (err) {
        if (isMounted) setDoctors([]);
      } finally {
        if (isMounted) setLoadingDoctors(false);
      }
    };

    if (id) {
      fetchDoctors();
    }

    return () => {
      isMounted = false;
    };
  }, [id]);

  // Check saved state for hospital & doctors if patient is logged in
  useEffect(() => {
    if (isAuthenticated && currentUser?.role === 'patient') {
      patientService
        .getSavedHospitals()
        .then((res) => {
          if (res.success && hospital) {
            const hasHosp = res.data.some(
              (item) => (item.hospital?._id || item.hospital).toString() === hospital.id
            );
            setIsSaved(hasHosp);
          }
        })
        .catch(() => {});

      patientService
        .getSavedDoctors()
        .then((res) => {
          if (res.success) {
            const ids = new Set(
              res.data.map((item) => (item.doctor?._id || item.doctor).toString())
            );
            setSavedDoctorIds(ids);
          }
        })
        .catch(() => {});
    }
  }, [isAuthenticated, currentUser, hospital]);

  const handleToggleSave = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in as a patient to bookmark hospitals.');
      return;
    }
    if (currentUser?.role !== 'patient') {
      toast.error('Only patient accounts can bookmark hospitals.');
      return;
    }

    try {
      setSavingAction(true);
      if (isSaved) {
        await patientService.removeSavedHospital(hospital.id);
        setIsSaved(false);
        toast.success('Removed hospital from bookmarks.');
      } else {
        await patientService.saveHospital(hospital.id);
        setIsSaved(true);
        toast.success('Saved hospital to your bookmarks.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update bookmark.');
    } finally {
      setSavingAction(false);
    }
  };

  const handleToggleSaveDoctor = async (doctorId) => {
    if (!isAuthenticated) {
      toast.error('Please log in as a patient to bookmark doctors.');
      return;
    }
    if (currentUser?.role !== 'patient') {
      toast.error('Only patient accounts can save doctor bookmarks.');
      return;
    }

    const isCurrentlySaved = savedDoctorIds.has(doctorId);
    try {
      if (isCurrentlySaved) {
        await patientService.removeSavedDoctor(doctorId);
        setSavedDoctorIds((prev) => {
          const next = new Set(prev);
          next.delete(doctorId);
          return next;
        });
        toast.success('Doctor removed from saved list.');
      } else {
        await patientService.saveDoctor(doctorId);
        setSavedDoctorIds((prev) => new Set(prev).add(doctorId));
        toast.success('Doctor saved to your bookmarks.');
      }
    } catch (err) {
      toast.error('Failed to update doctor bookmark.');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: `${hospital?.name} | MediConnect`,
          text: `Check out ${hospital?.name} in ${hospital?.address?.city || 'Chennai'} on MediConnect.`,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Hospital link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-pulse">
        <div className="h-6 bg-slate-200 rounded-md w-48" />
        <div className="h-72 rounded-3xl bg-slate-200" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 h-64 bg-slate-200 rounded-3xl" />
          <div className="h-64 bg-slate-200 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (error || !hospital) {
    return (
      <div className="py-16 max-w-xl mx-auto px-4 text-center space-y-5">
        <div className="w-16 h-16 rounded-3xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="font-display text-2xl font-bold text-slate-900">
          Hospital Details Unavailable
        </h2>
        <p className="text-sm text-slate-600">
          {error || 'The requested hospital facility could not be found.'}
        </p>
        <div className="pt-2">
          <Link to="/find-hospital">
            <Button variant="dark" leadingIcon={ChevronLeft}>
              Back to Hospital Directory
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const primaryImage =
    hospital.images?.[0] ||
    hospital.image ||
    'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&q=80&w=1200';

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Top Breadcrumb & Actions */}
      <div className="flex items-center justify-between">
        <Link
          to="/find-hospital"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-brand-600 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to All Hospitals</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            to={`/compare?type=hospitals&ids=${hospital.id}`}
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
            <span>{isSaved ? 'Saved' : 'Save Hospital'}</span>
          </button>
        </div>
      </div>

      {/* Hospital Banner Hero */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-200 shadow-card bg-slate-900 text-white min-h-[300px] flex flex-col justify-end p-6 sm:p-10">
        <img
          src={primaryImage}
          alt={hospital.name}
          className="absolute inset-0 w-full h-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent" />

        <div className="relative z-10 space-y-4 max-w-4xl">
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2">
            {hospital.emergencyService && (
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-rose-600 text-white shadow-xs flex items-center gap-1.5">
                <HeartPulse className="w-3.5 h-3.5 animate-pulse" />
                <span>24/7 Emergency Care Available</span>
              </span>
            )}
            {hospital.hospitalType && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-md text-white border border-white/20">
                {hospital.hospitalType}
              </span>
            )}
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/80 backdrop-blur-md text-white border border-white/20 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Accredited Center</span>
            </span>
          </div>

          <div>
            <h1 className="font-display text-2xl sm:text-4xl font-extrabold leading-tight">
              {hospital.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-brand-400 shrink-0" />
              <span>
                {hospital.address
                  ? `${hospital.address.street || ''} ${hospital.address.city}, ${hospital.address.state || 'Tamil Nadu'} - ${hospital.address.pincode || ''}`
                  : hospital.city}
              </span>
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-2 text-xs sm:text-sm border-t border-white/10">
            <span className="flex items-center gap-1.5 font-bold">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>{Number(hospital.rating || 4.8).toFixed(1)}</span>
              <span className="text-slate-400 font-normal">
                ({hospital.reviewCount || 0} reviews)
              </span>
            </span>

            {hospital.totalBeds > 0 && (
              <span className="flex items-center gap-1.5 font-semibold text-slate-200">
                <Bed className="w-4 h-4 text-brand-300" />
                <span>{hospital.totalBeds} Inpatient Beds</span>
              </span>
            )}

            <span className="flex items-center gap-1.5 font-semibold text-slate-200">
              <Users className="w-4 h-4 text-brand-300" />
              <span>{hospital.doctorsCount || doctors.length} Practicing Doctors</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Details & Side Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left 2 Cols: Description, Specialties, Facilities, Doctors List */}
        <div className="lg:col-span-2 space-y-8">
          {/* About Hospital */}
          <section className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
            <h3 className="font-display font-bold text-lg text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-brand-600" />
              <span>About Hospital Facility</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {hospital.description ||
                `${hospital.name} is a premier healthcare institution providing advanced diagnostics, acute patient care, surgical intervention, and outpatient specialist services in ${hospital.address?.city || hospital.city || 'Chennai'}.`}
            </p>
          </section>

          {/* Specialties Departments */}
          {hospital.specialties && hospital.specialties.length > 0 && (
            <section className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="font-display font-bold text-lg text-slate-900 flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-brand-600" />
                <span>Specialized Departments ({hospital.specialties.length})</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {hospital.specialties.map((spec, idx) => {
                  const specName = typeof spec === 'object' ? spec.name : spec;
                  return (
                    <span
                      key={idx}
                      className="px-3 py-1.5 rounded-2xl bg-brand-50/80 border border-brand-100 text-brand-800 text-xs font-bold inline-flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-brand-600" />
                      <span>{specName}</span>
                    </span>
                  );
                })}
              </div>
            </section>
          )}

          {/* Hospital Facilities & Infrastructure */}
          {hospital.facilities && hospital.facilities.length > 0 && (
            <section className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="font-display font-bold text-lg text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-brand-600" />
                <span>Clinical Infrastructure & Facilities</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {hospital.facilities.map((facility, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs font-semibold text-slate-700 flex items-center gap-2"
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    <span>{facility}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Practicing Doctors Section */}
          <section className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-display font-bold text-lg text-slate-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-brand-600" />
                  <span>Doctors Practicing at this Facility</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Verified consultants and resident medical specialists
                </p>
              </div>
              <span className="text-xs font-bold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-full border border-brand-200">
                {doctors.length} Doctors
              </span>
            </div>

            {loadingDoctors && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-pulse">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="h-48 bg-slate-100 rounded-3xl" />
                ))}
              </div>
            )}

            {!loadingDoctors && doctors.length === 0 && (
              <div className="p-8 rounded-2xl bg-slate-50 text-center space-y-2">
                <Users className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-sm font-semibold text-slate-700">
                  No registered doctors listed currently
                </p>
                <p className="text-xs text-slate-500">
                  Additional consultant rosters are being updated. You can contact the hospital front-desk directly.
                </p>
              </div>
            )}

            {!loadingDoctors && doctors.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {doctors.map((doc) => (
                  <DoctorCard
                    key={doc.id}
                    id={doc.id}
                    name={doc.name}
                    specialization={doc.specialization}
                    qualification={doc.qualification}
                    experience={doc.experience}
                    rating={doc.rating}
                    reviewCount={doc.reviewCount}
                    consultationFee={doc.consultationFee}
                    hospitalName={hospital.name}
                    hospitalCity={hospital.address?.city || hospital.city}
                    image={doc.profileImage}
                    isAvailable={doc.isAvailable}
                    languages={doc.languages}
                    isSaved={savedDoctorIds.has(doc.id)}
                    onToggleSave={() => handleToggleSaveDoctor(doc.id)}
                  />
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Right Col: Contact & Operational Info */}
        <aside className="space-y-6 sticky top-20">
          <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/80 shadow-card space-y-5">
            <h3 className="font-display font-bold text-base text-slate-900 pb-2 border-b border-slate-100">
              Contact & Location Details
            </h3>

            {/* Address & Location */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Hospital Address
              </span>
              <p className="text-xs font-semibold text-slate-700 leading-relaxed">
                {hospital.address || `${hospital.city}, ${hospital.state || 'Tamil Nadu'}`}
              </p>

              {/* Distance badge if user location provided */}
              {hospital.distance !== undefined && (
                <div className="p-2.5 rounded-xl bg-brand-50 border border-brand-200/80 text-xs font-bold text-brand-800 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-brand-600 shrink-0" />
                  <span>
                    {hospital.distanceFormatted || `${hospital.distance} ${hospital.distanceUnit || 'km'} from your location`}
                  </span>
                </div>
              )}

              {/* Google Maps link if coordinates available */}
              {(hospital.latitude !== undefined && hospital.longitude !== undefined) && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${hospital.latitude},${hospital.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-800 hover:underline pt-0.5"
                >
                  <Navigation className="w-3.5 h-3.5 text-brand-600" />
                  <span>View on Google Maps</span>
                </a>
              )}
            </div>

            {/* Emergency Service status */}
            <div
              className={`p-3.5 rounded-2xl border text-xs font-bold flex items-center gap-2.5 ${
                hospital.emergencyService
                  ? 'bg-rose-50 border-rose-200 text-rose-800'
                  : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <HeartPulse
                className={`w-4 h-4 shrink-0 ${hospital.emergencyService ? 'text-rose-600 animate-pulse' : 'text-slate-400'}`}
              />
              <div>
                <p className="leading-tight">
                  {hospital.emergencyService ? '24/7 Emergency Casualty Active' : 'Regular OPD Hours Only'}
                </p>
                <p className="text-[10px] font-normal text-slate-600 mt-0.5">
                  {hospital.emergencyService
                    ? 'Round-the-clock trauma & acute care'
                    : 'Emergency admission by appointment'}
                </p>
              </div>
            </div>

            {/* Phone */}
            {hospital.phone && (
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Helpline / Reception
                </span>
                <a
                  href={`tel:${hospital.phone}`}
                  className="text-xs font-bold text-brand-700 hover:underline flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{hospital.phone}</span>
                </a>
              </div>
            )}

            {/* Email */}
            {hospital.email && (
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Official Email
                </span>
                <a
                  href={`mailto:${hospital.email}`}
                  className="text-xs font-medium text-slate-600 hover:text-brand-600 flex items-center gap-1.5 truncate"
                >
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{hospital.email}</span>
                </a>
              </div>
            )}

            {/* Website */}
            {hospital.website && (
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Web Portal
                </span>
                <a
                  href={hospital.website.startsWith('http') ? hospital.website : `https://${hospital.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-brand-600 hover:underline flex items-center gap-1.5 truncate"
                >
                  <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{hospital.website}</span>
                </a>
              </div>
            )}

            {/* Save Button */}
            <div className="pt-2 border-t border-slate-100">
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
                <span>{isSaved ? 'Remove from Saved Hospitals' : 'Save Hospital to Bookmarks'}</span>
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
