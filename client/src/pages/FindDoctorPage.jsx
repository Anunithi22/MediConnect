import React, { useState, useEffect, useTransition } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  Filter,
  Stethoscope,
  MapPin,
  Star,
  Award,
  Calendar,
  ArrowRight,
  RotateCcw,
  SlidersHorizontal,
  X,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import discoveryService from '../services/discoveryService';
import patientService from '../services/patientService';
import { useAuth } from '../context/AuthContext';
import { DoctorCard, Button, EmptyState, LoadingSpinner } from '../components/ui';

export default function FindDoctorPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentUser, isAuthenticated } = useAuth();

  // Read state from URL
  const querySearch = searchParams.get('search') || '';
  const querySpecialty = searchParams.get('specialization') || '';
  const queryHospital = searchParams.get('hospital') || '';
  const queryExperience = searchParams.get('experienceMin') || '';
  const queryRating = searchParams.get('ratingMin') || '';
  const queryFeeMax = searchParams.get('feeMax') || '';
  const queryLanguage = searchParams.get('language') || '';
  const querySort = searchParams.get('sort') || 'recommended';
  const queryPage = parseInt(searchParams.get('page') || '1', 10);

  // Local state for debouncing search input
  const [searchInput, setSearchInput] = useState(querySearch);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Data states
  const [doctors, setDoctors] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [specializations, setSpecializations] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [savedDoctorIds, setSavedDoctorIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sync debounced search input to URL query
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchInput !== querySearch) {
        updateFilter('search', searchInput);
      }
    }, 400);
    return () => clearTimeout(handler);
  }, [searchInput]);

  // Load specializations and hospitals for filter dropdowns
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [specsRes, hospsRes] = await Promise.all([
          discoveryService.getSpecializations(),
          discoveryService.getHospitals({ limit: 50 }),
        ]);
        if (specsRes.success) setSpecializations(specsRes.data);
        if (hospsRes.success) setHospitals(hospsRes.data);
      } catch (err) {
        // Soft fail
      }
    };
    fetchMetadata();
  }, []);

  // Fetch saved doctor IDs if authenticated patient
  useEffect(() => {
    if (isAuthenticated && currentUser?.role === 'patient') {
      patientService
        .getSavedDoctors()
        .then((res) => {
          if (res.success) {
            const ids = new Set(res.data.map((item) => (item.doctor?._id || item.doctor).toString()));
            setSavedDoctorIds(ids);
          }
        })
        .catch(() => {});
    }
  }, [isAuthenticated, currentUser]);

  // Fetch doctors whenever URL params change
  useEffect(() => {
    let isMounted = true;
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = {
          page: queryPage,
          limit: 12,
          search: querySearch || undefined,
          specialization: querySpecialty || undefined,
          hospital: queryHospital || undefined,
          experienceMin: queryExperience || undefined,
          ratingMin: queryRating || undefined,
          feeMax: queryFeeMax || undefined,
          language: queryLanguage || undefined,
          sort: querySort !== 'recommended' ? querySort : undefined,
        };

        const res = await discoveryService.getDoctors(params);
        if (isMounted && res.success) {
          setDoctors(res.data);
          setPagination(res.pagination || { page: 1, totalPages: 1, total: res.data.length });
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to load doctors.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDoctors();
    return () => {
      isMounted = false;
    };
  }, [
    querySearch,
    querySpecialty,
    queryHospital,
    queryExperience,
    queryRating,
    queryFeeMax,
    queryLanguage,
    querySort,
    queryPage,
  ]);

  const updateFilter = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value && value !== 'all') {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    // Reset to page 1 on filter modification
    if (key !== 'page') {
      newParams.delete('page');
    }
    setSearchParams(newParams);
  };

  const handleClearFilters = () => {
    setSearchInput('');
    setSearchParams({});
  };

  const handleToggleSave = async (doctorId) => {
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
      toast.error(err.message || 'Unable to update bookmark.');
    }
  };

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900">
            Find Certified Doctors in Chennai
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Browse licensed healthcare professionals, compare verified patient reviews, experience, and consultation fees.
          </p>
        </div>

        {/* Mobile Filter Button */}
        <button
          onClick={() => setMobileFilterOpen(true)}
          className="md:hidden inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs font-bold text-slate-800 shadow-xs"
        >
          <SlidersHorizontal className="w-4 h-4 text-brand-600" />
          <span>Filters & Sort</span>
        </button>
      </div>

      {/* Search & Sort Bar */}
      <div className="p-3 sm:p-4 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by doctor name, specialty, or clinic..."
            className="w-full pl-10 pr-4 py-2 rounded-2xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
          {searchInput && (
            <button
              onClick={() => {
                setSearchInput('');
                updateFilter('search', '');
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
          <span className="text-xs font-semibold text-slate-500 hidden sm:inline">Sort:</span>
          <select
            value={querySort}
            onChange={(e) => updateFilter('sort', e.target.value)}
            className="w-full md:w-auto px-3 py-2 rounded-2xl border border-slate-200 text-xs font-semibold bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          >
            <option value="recommended">Recommended (Deterministic)</option>
            <option value="rating">Highest Rated</option>
            <option value="experience">Most Experienced</option>
            <option value="feeLow">Fee: Low to High</option>
            <option value="feeHigh">Fee: High to Low</option>
            <option value="name">Doctor Name (A-Z)</option>
            <option value="newest">Recently Added</option>
          </select>

          {(querySearch ||
            querySpecialty ||
            queryHospital ||
            queryExperience ||
            queryRating ||
            queryFeeMax ||
            queryLanguage ||
            querySort !== 'recommended') && (
            <button
              onClick={handleClearFilters}
              title="Reset all filters"
              className="p-2 rounded-2xl border border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-rose-600 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Content: Filter Sidebar + Doctors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden md:block bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 space-y-5 sticky top-20">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-brand-600" />
              <span>Filter Doctors</span>
            </h3>
            <button
              onClick={handleClearFilters}
              className="text-[11px] font-semibold text-brand-600 hover:text-brand-800"
            >
              Reset
            </button>
          </div>

          {/* Specialty */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Specialization</label>
            <select
              value={querySpecialty}
              onChange={(e) => updateFilter('specialization', e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="">All Specializations</option>
              {specializations.map((spec) => (
                <option key={spec.id} value={spec.name}>
                  {spec.name}
                </option>
              ))}
            </select>
          </div>

          {/* Hospital */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Hospital / Facility</label>
            <select
              value={queryHospital}
              onChange={(e) => updateFilter('hospital', e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="">All Hospitals</option>
              {hospitals.map((hosp) => (
                <option key={hosp.id} value={hosp.id}>
                  {hosp.name}
                </option>
              ))}
            </select>
          </div>

          {/* Minimum Experience */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Experience</label>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { label: 'Any', value: '' },
                { label: '5+ yrs', value: '5' },
                { label: '10+ yrs', value: '10' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => updateFilter('experienceMin', opt.value)}
                  className={`py-1.5 rounded-xl border text-[11px] font-semibold transition-all ${
                    queryExperience === opt.value
                      ? 'bg-brand-50 border-brand-500 text-brand-700 font-bold'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Rating */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Minimum Rating</label>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { label: 'Any', value: '' },
                { label: '4.5 ★', value: '4.5' },
                { label: '4.8 ★', value: '4.8' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => updateFilter('ratingMin', opt.value)}
                  className={`py-1.5 rounded-xl border text-[11px] font-semibold transition-all ${
                    queryRating === opt.value
                      ? 'bg-amber-50 border-amber-500 text-amber-800 font-bold'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Consultation Fee Max */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Max Fee</label>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { label: 'Any', value: '' },
                { label: '₹700', value: '700' },
                { label: '₹1000', value: '1000' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => updateFilter('feeMax', opt.value)}
                  className={`py-1.5 rounded-xl border text-[11px] font-semibold transition-all ${
                    queryFeeMax === opt.value
                      ? 'bg-brand-50 border-brand-500 text-brand-700 font-bold'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Language */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Language</label>
            <select
              value={queryLanguage}
              onChange={(e) => updateFilter('language', e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="">Any Language</option>
              <option value="Tamil">Tamil</option>
              <option value="English">English</option>
              <option value="Hindi">Hindi</option>
            </select>
          </div>
        </aside>

        {/* Doctor Results Section */}
        <div className="md:col-span-3 space-y-6">
          {/* Results count indicator */}
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>
              Showing <strong className="text-slate-800">{doctors.length}</strong> of{' '}
              <strong className="text-slate-800">{pagination.total || 0}</strong> verified doctors
            </span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs animate-pulse space-y-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-2xl bg-slate-200 shrink-0" />
                    <div className="space-y-2 flex-1">
                      <div className="w-16 h-4 bg-slate-200 rounded-md" />
                      <div className="w-32 h-5 bg-slate-200 rounded-md" />
                      <div className="w-24 h-3 bg-slate-200 rounded-md" />
                    </div>
                  </div>
                  <div className="w-full h-12 bg-slate-100 rounded-xl" />
                  <div className="flex justify-between items-center pt-2">
                    <div className="w-20 h-5 bg-slate-200 rounded-md" />
                    <div className="w-24 h-8 bg-slate-200 rounded-xl" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="p-6 rounded-3xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p className="text-xs font-semibold">{error}</p>
              </div>
              <Button size="sm" variant="outline" onClick={() => window.location.reload()}>
                Retry
              </Button>
            </div>
          ) : doctors.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-10">
              <EmptyState
                icon={Stethoscope}
                title="No doctors found"
                description="We couldn't find any certified doctors matching your filter criteria. Try resetting filters or expanding your search terms."
                actionLabel="Clear All Filters"
                actionTo="#"
                onAction={handleClearFilters}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {doctors.map((doc) => (
                <DoctorCard
                  key={doc.id}
                  id={doc.id}
                  name={doc.name}
                  specialization={doc.specialization}
                  qualification={doc.qualification}
                  experience={doc.experience}
                  hospital={doc.hospital?.name}
                  rating={doc.rating}
                  reviewCount={doc.reviewCount}
                  consultationFee={doc.consultationFee}
                  languages={doc.languages}
                  image={doc.profileImage}
                  isSaved={savedDoctorIds.has(doc.id)}
                  onToggleSave={handleToggleSave}
                />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
              <button
                disabled={!pagination.hasPreviousPage}
                onClick={() => updateFilter('page', String(pagination.page - 1))}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <span className="text-xs font-bold text-slate-700">
                Page {pagination.page} of {pagination.totalPages}
              </span>

              <button
                disabled={!pagination.hasNextPage}
                onClick={() => updateFilter('page', String(pagination.page + 1))}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex justify-end">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            onClick={() => setMobileFilterOpen(false)}
          />
          <div className="relative w-80 max-w-[85vw] bg-white h-full shadow-2xl p-5 overflow-y-auto space-y-5 animate-in slide-in-from-right">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="font-bold text-sm text-slate-900">Filters & Sort</span>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="p-1 rounded-lg text-slate-500 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Specialization</label>
                <select
                  value={querySpecialty}
                  onChange={(e) => updateFilter('specialization', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="">All Specializations</option>
                  {specializations.map((spec) => (
                    <option key={spec.id} value={spec.name}>
                      {spec.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Hospital</label>
                <select
                  value={queryHospital}
                  onChange={(e) => updateFilter('hospital', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="">All Hospitals</option>
                  {hospitals.map((hosp) => (
                    <option key={hosp.id} value={hosp.id}>
                      {hosp.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Language</label>
                <select
                  value={queryLanguage}
                  onChange={(e) => updateFilter('language', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="">Any Language</option>
                  <option value="Tamil">Tamil</option>
                  <option value="English">English</option>
                  <option value="Hindi">Hindi</option>
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => {
                  handleClearFilters();
                  setMobileFilterOpen(false);
                }}
              >
                Reset
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="w-full"
                onClick={() => setMobileFilterOpen(false)}
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
