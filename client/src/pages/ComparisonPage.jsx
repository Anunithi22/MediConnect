import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  Scale,
  Stethoscope,
  Building2,
  Star,
  MapPin,
  Clock,
  Heart,
  ShieldCheck,
  CheckCircle2,
  X,
  Plus,
  ArrowRight,
  AlertCircle,
  Video,
  HeartPulse,
  Bed,
  Users,
  Search,
  ExternalLink,
} from 'lucide-react';
import toast from 'react-hot-toast';
import discoveryService from '../services/discoveryService';
import patientService from '../services/patientService';
import { useAuth } from '../context/AuthContext';
import { Button, Badge, Modal } from '../components/ui';

export default function ComparisonPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();

  const activeType = searchParams.get('type') === 'hospitals' ? 'hospitals' : 'doctors';
  const queryIds = (searchParams.get('ids') || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Selector modal state for adding 2nd or 3rd item
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [availableOptions, setAvailableOptions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingOptions, setLoadingOptions] = useState(false);

  // Patient saved state
  const [savedIds, setSavedIds] = useState(new Set());

  // Fetch comparison data when type or IDs change
  useEffect(() => {
    let isMounted = true;
    const fetchComparisonData = async () => {
      if (queryIds.length === 0) {
        setItems([]);
        setError(null);
        return;
      }

      if (queryIds.length < 2) {
        // We have 1 item selected, fetch it individually so user can see it while picking another
        try {
          setLoading(true);
          setError(null);
          if (activeType === 'doctors') {
            const res = await discoveryService.getDoctorById(queryIds[0]);
            if (isMounted && res.success) setItems([res.data]);
          } else {
            const res = await discoveryService.getHospitalById(queryIds[0]);
            if (isMounted && res.success) setItems([res.data]);
          }
        } catch (err) {
          if (isMounted) setError('Could not load item details.');
        } finally {
          if (isMounted) setLoading(false);
        }
        return;
      }

      try {
        setLoading(true);
        setError(null);
        if (activeType === 'doctors') {
          const res = await discoveryService.compareDoctors(queryIds);
          if (isMounted && res.success) setItems(res.data || []);
        } else {
          const res = await discoveryService.compareHospitals(queryIds);
          if (isMounted && res.success) setItems(res.data || []);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err.response?.data?.message ||
              `Failed to compare ${activeType}. Please ensure valid items are selected.`
          );
          setItems([]);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchComparisonData();

    return () => {
      isMounted = false;
    };
  }, [activeType, searchParams.get('ids')]);

  // Load saved bookmarks if patient
  useEffect(() => {
    if (isAuthenticated && currentUser?.role === 'patient') {
      if (activeType === 'doctors') {
        patientService
          .getSavedDoctors()
          .then((res) => {
            if (res.success) {
              setSavedIds(new Set(res.data.map((d) => (d.doctor?._id || d.doctor).toString())));
            }
          })
          .catch(() => {});
      } else {
        patientService
          .getSavedHospitals()
          .then((res) => {
            if (res.success) {
              setSavedIds(new Set(res.data.map((h) => (h.hospital?._id || h.hospital).toString())));
            }
          })
          .catch(() => {});
      }
    }
  }, [activeType, isAuthenticated, currentUser]);

  // Switch type (doctors <-> hospitals)
  const handleSwitchType = (newType) => {
    setSearchParams({ type: newType });
    setItems([]);
    setError(null);
  };

  // Remove an item from comparison
  const handleRemoveItem = (idToRemove) => {
    const updatedIds = queryIds.filter((id) => id !== idToRemove);
    if (updatedIds.length > 0) {
      setSearchParams({ type: activeType, ids: updatedIds.join(',') });
    } else {
      setSearchParams({ type: activeType });
      setItems([]);
    }
  };

  // Open modal to add an item
  const handleOpenAddModal = async () => {
    setAddModalOpen(true);
    setSearchQuery('');
    try {
      setLoadingOptions(true);
      if (activeType === 'doctors') {
        const res = await discoveryService.getDoctors({ limit: 20 });
        if (res.success) {
          // Filter out already selected
          setAvailableOptions((res.data || []).filter((d) => !queryIds.includes(d.id)));
        }
      } else {
        const res = await discoveryService.getHospitals({ limit: 20 });
        if (res.success) {
          setAvailableOptions((res.data || []).filter((h) => !queryIds.includes(h.id)));
        }
      }
    } catch (err) {
      toast.error('Failed to load directory items.');
    } finally {
      setLoadingOptions(false);
    }
  };

  // Add an item to comparison
  const handleSelectItem = (selectedId) => {
    const newIds = [...queryIds, selectedId].slice(0, 3);
    setSearchParams({ type: activeType, ids: newIds.join(',') });
    setAddModalOpen(false);
  };

  // Toggle bookmark
  const handleToggleBookmark = async (id) => {
    if (!isAuthenticated) {
      toast.error('Please log in as a patient to save bookmarks.');
      return;
    }
    if (currentUser?.role !== 'patient') {
      toast.error('Only patient accounts can save bookmarks.');
      return;
    }

    const isCurrentlySaved = savedIds.has(id);
    try {
      if (activeType === 'doctors') {
        if (isCurrentlySaved) {
          await patientService.removeSavedDoctor(id);
          setSavedIds((prev) => {
            const next = new Set(prev);
            next.delete(id);
            return next;
          });
          toast.success('Removed doctor from bookmarks.');
        } else {
          await patientService.saveDoctor(id);
          setSavedIds((prev) => new Set(prev).add(id));
          toast.success('Doctor saved to bookmarks.');
        }
      } else {
        if (isCurrentlySaved) {
          await patientService.removeSavedHospital(id);
          setSavedIds((prev) => {
            const next = new Set(prev);
            next.delete(id);
            return next;
          });
          toast.success('Removed hospital from bookmarks.');
        } else {
          await patientService.saveHospital(id);
          setSavedIds((prev) => new Set(prev).add(id));
          toast.success('Hospital saved to bookmarks.');
        }
      }
    } catch (err) {
      toast.error('Could not update bookmark.');
    }
  };

  // Highlight calculations (purely neutral factual comparisons)
  const lowestFee = activeType === 'doctors' && items.length > 1
    ? Math.min(...items.map((d) => d.consultationFee || 99999))
    : null;
  const maxExperience = activeType === 'doctors' && items.length > 1
    ? Math.max(...items.map((d) => d.experience || 0))
    : null;
  const maxRating = items.length > 1
    ? Math.max(...items.map((i) => i.rating || 0))
    : null;
  const maxBeds = activeType === 'hospitals' && items.length > 1
    ? Math.max(...items.map((h) => h.totalBeds || 0))
    : null;

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-100 text-brand-700 text-xs font-bold uppercase tracking-wider mb-2">
            <Scale className="w-3.5 h-3.5 text-brand-600" />
            <span>Factual Side-by-Side Comparison</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900">
            Compare Healthcare Providers
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
            Review objective credentials, consultation modes, hospital infrastructure, and patient satisfaction metrics across 2 to 3 options.
          </p>
        </div>

        {/* Type Switcher Tabs */}
        <div className="inline-flex p-1 rounded-2xl bg-slate-100 border border-slate-200">
          <button
            type="button"
            onClick={() => handleSwitchType('doctors')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeType === 'doctors'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5 text-brand-600" />
            <span>Doctors</span>
          </button>
          <button
            type="button"
            onClick={() => handleSwitchType('hospitals')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeType === 'hospitals'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-brand-600" />
            <span>Hospitals</span>
          </button>
        </div>
      </div>

      {/* Error Notice */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-96 rounded-3xl bg-slate-100 border border-slate-200 p-6 space-y-4" />
          ))}
        </div>
      )}

      {/* Empty State: Fewer than 2 items selected */}
      {!loading && items.length < 2 && (
        <div className="p-8 sm:p-12 rounded-3xl bg-slate-50 border border-dashed border-slate-300 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-brand-50 border border-brand-200 text-brand-600 flex items-center justify-center mx-auto">
            <Scale className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-slate-900">
              Select {activeType === 'doctors' ? 'Doctors' : 'Hospitals'} to Compare
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-1">
              {items.length === 1
                ? `You have selected 1 ${activeType === 'doctors' ? 'doctor' : 'hospital'}. Select at least 1 more (up to 3 total) to generate a side-by-side comparison.`
                : `Select 2 to 3 ${activeType === 'doctors' ? 'doctors' : 'hospitals'} from the directory to review credentials, fee structures, and services.`}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button variant="primary" leadingIcon={Plus} onClick={handleOpenAddModal}>
              Add {activeType === 'doctors' ? 'Doctor' : 'Hospital'}
            </Button>
            <Link to={activeType === 'doctors' ? '/find-doctor' : '/find-hospital'}>
              <Button variant="outline">
                Browse Directory
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Active Comparison Matrix */}
      {!loading && items.length >= 2 && (
        <div className="space-y-6">
          {/* Top Actions Bar */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              Comparing <strong>{items.length}</strong> of 3 {activeType}
            </span>

            {items.length < 3 && (
              <Button
                variant="outline"
                size="sm"
                leadingIcon={Plus}
                onClick={handleOpenAddModal}
              >
                Add 3rd {activeType === 'doctors' ? 'Doctor' : 'Hospital'}
              </Button>
            )}
          </div>

          {/* DOCTORS COMPARISON MATRIX */}
          {activeType === 'doctors' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
              {items.map((doc) => {
                const isSaved = savedIds.has(doc.id);
                const hasLowestFee = lowestFee !== null && doc.consultationFee === lowestFee;
                const hasTopExp = maxExperience !== null && doc.experience === maxExperience;
                const hasTopRating = maxRating !== null && doc.rating === maxRating;

                return (
                  <div
                    key={doc.id}
                    className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-card flex flex-col justify-between space-y-6 relative group"
                  >
                    {/* Top Row: Remove Button & Bookmark */}
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <button
                        type="button"
                        onClick={() => handleToggleBookmark(doc.id)}
                        className={`p-2 rounded-xl border text-xs transition-colors shadow-2xs ${
                          isSaved
                            ? 'bg-rose-50 border-rose-200 text-rose-700'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                        title={isSaved ? 'Remove bookmark' : 'Bookmark doctor'}
                      >
                        <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-rose-500 text-rose-500' : ''}`} />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRemoveItem(doc.id)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Remove from comparison"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Doctor Header */}
                    <div className="text-center space-y-3">
                      <div className="w-24 h-24 rounded-3xl overflow-hidden mx-auto border-2 border-slate-100 shadow-sm">
                        <img
                          src={doc.profileImage}
                          alt={doc.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div>
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-[11px] font-extrabold mb-1">
                          <Stethoscope className="w-3 h-3 text-brand-600" />
                          <span>{doc.specialization}</span>
                        </span>
                        <h3 className="font-display font-extrabold text-lg text-slate-900 leading-tight">
                          {doc.name.startsWith('Dr.') ? doc.name : `Dr. ${doc.name}`}
                        </h3>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                          {doc.qualification}
                        </p>
                      </div>
                    </div>

                    {/* Factual Comparison Rows */}
                    <div className="space-y-3 text-xs divide-y divide-slate-100 flex-1">
                      {/* Consultation Fee */}
                      <div className="pt-3 flex items-center justify-between">
                        <span className="text-slate-500 font-medium">Consultation Fee</span>
                        <div className="text-right">
                          <span className="font-display font-extrabold text-base text-slate-900 block">
                            ₹{doc.consultationFee}
                          </span>
                          {hasLowestFee && items.length > 1 && (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 inline-block">
                              Lower Fee
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Experience */}
                      <div className="pt-3 flex items-center justify-between">
                        <span className="text-slate-500 font-medium">Clinical Experience</span>
                        <div className="text-right">
                          <span className="font-bold text-slate-900 block">
                            {doc.experience}+ Years
                          </span>
                          {hasTopExp && items.length > 1 && (
                            <span className="text-[10px] font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full border border-brand-200 inline-block">
                              More Experience
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Consultation Modes */}
                      <div className="pt-3 flex items-center justify-between">
                        <span className="text-slate-500 font-medium">Consultation Modes</span>
                        <div className="flex flex-wrap gap-1 justify-end">
                          {doc.consultationModes?.map((mode, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold"
                            >
                              {mode}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Rating & Reviews */}
                      <div className="pt-3 flex items-center justify-between">
                        <span className="text-slate-500 font-medium">Verified Rating</span>
                        <div className="text-right">
                          <span className="font-bold text-slate-900 flex items-center justify-end gap-1">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <span>{Number(doc.rating).toFixed(1)}</span>
                            <span className="text-[10px] text-slate-400">({doc.reviewCount})</span>
                          </span>
                          {hasTopRating && items.length > 1 && (
                            <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 inline-block">
                              Top Rated
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Hospital Affiliation */}
                      <div className="pt-3 flex items-start justify-between gap-3">
                        <span className="text-slate-500 font-medium shrink-0">Hospital</span>
                        <span className="font-bold text-slate-800 text-right leading-tight">
                          {doc.hospital?.name || 'Medical Center'}
                          {doc.hospital?.city && (
                            <span className="block text-[10px] font-normal text-slate-500">
                              {doc.hospital.city}
                            </span>
                          )}
                        </span>
                      </div>

                      {/* Languages */}
                      <div className="pt-3 flex items-center justify-between">
                        <span className="text-slate-500 font-medium">Languages</span>
                        <span className="font-semibold text-slate-800 text-right">
                          {doc.languages?.join(', ') || 'English'}
                        </span>
                      </div>

                      {/* OPD Schedule Summary */}
                      <div className="pt-3 flex items-start justify-between gap-2">
                        <span className="text-slate-500 font-medium shrink-0">OPD Hours</span>
                        <span className="text-[11px] font-semibold text-slate-700 text-right">
                          {doc.schedule?.summary || 'Mon–Sat (09:00 - 17:00)'}
                        </span>
                      </div>

                      {/* Clinical Services */}
                      <div className="pt-3 space-y-1.5">
                        <span className="text-slate-500 font-medium block">Key Clinical Services</span>
                        <div className="flex flex-wrap gap-1">
                          {doc.services?.slice(0, 3).map((srv, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-100 text-[10px] font-medium text-slate-600"
                            >
                              {srv}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Bottom CTA Row */}
                    <div className="pt-4 border-t border-slate-100 flex items-center gap-2">
                      <Link to={`/doctor/${doc.id}`} className="flex-1">
                        <Button variant="dark" size="sm" className="w-full justify-center" trailingIcon={ArrowRight}>
                          View Full Profile
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* HOSPITALS COMPARISON MATRIX */}
          {activeType === 'hospitals' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
              {items.map((hosp) => {
                const isSaved = savedIds.has(hosp.id);
                const hasTopRating = maxRating !== null && hosp.rating === maxRating;
                const hasMostBeds = maxBeds !== null && hosp.totalBeds === maxBeds;

                return (
                  <div
                    key={hosp.id}
                    className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-card flex flex-col justify-between space-y-6 relative group"
                  >
                    {/* Top Row: Remove Button & Bookmark */}
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <button
                        type="button"
                        onClick={() => handleToggleBookmark(hosp.id)}
                        className={`p-2 rounded-xl border text-xs transition-colors shadow-2xs ${
                          isSaved
                            ? 'bg-rose-50 border-rose-200 text-rose-700'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                        title={isSaved ? 'Remove bookmark' : 'Bookmark hospital'}
                      >
                        <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-rose-500 text-rose-500' : ''}`} />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRemoveItem(hosp.id)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Remove from comparison"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Hospital Header */}
                    <div className="text-center space-y-3">
                      <div className="h-28 w-full rounded-2xl overflow-hidden border border-slate-100 shadow-sm relative">
                        <img
                          src={hosp.image}
                          alt={hosp.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                        <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/90 text-slate-800">
                          {hosp.hospitalType || 'Multi-Specialty'}
                        </span>
                      </div>

                      <div>
                        <h3 className="font-display font-extrabold text-lg text-slate-900 leading-tight">
                          {hosp.name}
                        </h3>
                        <p className="text-xs text-slate-500 font-medium mt-0.5 flex items-center justify-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{hosp.city}, {hosp.state || 'TN'}</span>
                        </p>
                      </div>
                    </div>

                    {/* Factual Comparison Rows */}
                    <div className="space-y-3 text-xs divide-y divide-slate-100 flex-1">
                      {/* Emergency Casualty */}
                      <div className="pt-3 flex items-center justify-between">
                        <span className="text-slate-500 font-medium">Emergency Care</span>
                        <div className="text-right">
                          {hosp.emergencyService ? (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-rose-50 text-rose-700 border border-rose-200 inline-flex items-center gap-1">
                              <HeartPulse className="w-3 h-3 text-rose-600 animate-pulse" />
                              <span>24/7 Casualty</span>
                            </span>
                          ) : (
                            <span className="text-slate-600 font-semibold">Standard OPD</span>
                          )}
                        </div>
                      </div>

                      {/* Bed Capacity */}
                      <div className="pt-3 flex items-center justify-between">
                        <span className="text-slate-500 font-medium">Inpatient Beds</span>
                        <div className="text-right">
                          <span className="font-bold text-slate-900 block">
                            {hosp.totalBeds} Beds
                          </span>
                          {hasMostBeds && items.length > 1 && (
                            <span className="text-[10px] font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full border border-brand-200 inline-block">
                              Larger Capacity
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Rating & Reviews */}
                      <div className="pt-3 flex items-center justify-between">
                        <span className="text-slate-500 font-medium">Verified Rating</span>
                        <div className="text-right">
                          <span className="font-bold text-slate-900 flex items-center justify-end gap-1">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <span>{Number(hosp.rating).toFixed(1)}</span>
                            <span className="text-[10px] text-slate-400">({hosp.reviewCount})</span>
                          </span>
                          {hasTopRating && items.length > 1 && (
                            <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 inline-block">
                              Top Rated
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Practicing Doctors */}
                      <div className="pt-3 flex items-center justify-between">
                        <span className="text-slate-500 font-medium">Practicing Doctors</span>
                        <span className="font-bold text-slate-900">
                          {hosp.doctorsCount !== undefined ? `${hosp.doctorsCount} Consultants` : 'Verified Roster'}
                        </span>
                      </div>

                      {/* Specialties */}
                      <div className="pt-3 space-y-1.5">
                        <span className="text-slate-500 font-medium block">
                          Specialties ({hosp.specialties?.length || 0})
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {hosp.specialties?.slice(0, 4).map((spec, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-md bg-brand-50 border border-brand-100 text-[10px] font-bold text-brand-800"
                            >
                              {typeof spec === 'object' ? spec.name : spec}
                            </span>
                          ))}
                          {hosp.specialties?.length > 4 && (
                            <span className="text-[10px] text-slate-400 self-center">
                              +{hosp.specialties.length - 4} more
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Facilities */}
                      <div className="pt-3 space-y-1.5">
                        <span className="text-slate-500 font-medium block">Key Facilities</span>
                        <div className="flex flex-wrap gap-1">
                          {hosp.facilities?.slice(0, 4).map((fac, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-100 text-[10px] font-medium text-slate-700"
                            >
                              {fac}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Contact Info */}
                      <div className="pt-3 flex items-center justify-between">
                        <span className="text-slate-500 font-medium">Helpline</span>
                        <span className="font-semibold text-brand-700">
                          {hosp.phone || 'Front-Desk'}
                        </span>
                      </div>
                    </div>

                    {/* Bottom CTA Row */}
                    <div className="pt-4 border-t border-slate-100 flex items-center gap-2">
                      <Link to={`/hospital/${hosp.id}`} className="flex-1">
                        <Button variant="dark" size="sm" className="w-full justify-center" trailingIcon={ArrowRight}>
                          View Facility Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Selector Modal for Adding 2nd / 3rd Item */}
      {addModalOpen && (
        <Modal
          isOpen={addModalOpen}
          onClose={() => setAddModalOpen(false)}
          title={`Add ${activeType === 'doctors' ? 'Doctor' : 'Hospital'} to Comparison`}
        >
          <div className="space-y-4">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search by ${activeType === 'doctors' ? 'doctor name or specialty' : 'hospital name or city'}...`}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            {loadingOptions && (
              <div className="py-8 text-center text-xs text-slate-500">
                Loading available options...
              </div>
            )}

            {!loadingOptions && (
              <div className="max-h-72 overflow-y-auto space-y-2 pr-1 divide-y divide-slate-100">
                {availableOptions
                  .filter((opt) =>
                    searchQuery.trim() === ''
                      ? true
                      : (opt.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (opt.specialization || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (opt.city || '').toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((opt) => (
                    <div
                      key={opt.id}
                      className="pt-2 flex items-center justify-between gap-3 hover:bg-slate-50 p-2 rounded-xl transition-colors"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <div className="w-9 h-9 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                          <img
                            src={opt.profileImage || opt.image}
                            alt={opt.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="truncate">
                          <h4 className="text-xs font-bold text-slate-900 truncate">
                            {opt.name}
                          </h4>
                          <p className="text-[11px] text-slate-500 truncate">
                            {opt.specialization || opt.hospitalType || opt.city}
                          </p>
                        </div>
                      </div>

                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() => handleSelectItem(opt.id)}
                      >
                        Select
                      </Button>
                    </div>
                  ))}

                {availableOptions.length === 0 && (
                  <p className="text-center text-xs text-slate-500 py-6">
                    All available {activeType} are already selected in comparison.
                  </p>
                )}
              </div>
            )}

            <div className="flex items-center justify-end pt-3 border-t border-slate-100">
              <Button variant="ghost" size="sm" onClick={() => setAddModalOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
