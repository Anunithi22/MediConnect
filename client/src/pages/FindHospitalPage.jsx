import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  Filter,
  Building2,
  MapPin,
  Star,
  HeartPulse,
  RotateCcw,
  SlidersHorizontal,
  X,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  ShieldCheck,
  Bed,
} from 'lucide-react';
import toast from 'react-hot-toast';
import discoveryService from '../services/discoveryService';
import patientService from '../services/patientService';
import { useAuth } from '../context/AuthContext';
import { HospitalCard, Button, EmptyState } from '../components/ui';

const HOSPITAL_TYPES = [
  'Multi-Specialty',
  'Super-Specialty',
  'Private',
  'Government',
  'Clinic',
];

const COMMON_FACILITIES = [
  'ICU',
  'Trauma Center',
  'Diagnostic Lab',
  'Blood Bank',
  'Pharmacy',
  'Ambulance Service',
  'Operation Theatre',
];

export default function FindHospitalPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentUser, isAuthenticated } = useAuth();

  // Read state from URL
  const querySearch = searchParams.get('search') || '';
  const queryType = searchParams.get('hospitalType') || '';
  const queryEmergency = searchParams.get('emergencyService') || '';
  const querySpecialty = searchParams.get('specialties') || '';
  const queryFacility = searchParams.get('facilities') || '';
  const queryCity = searchParams.get('city') || '';
  const queryRating = searchParams.get('ratingMin') || '';
  const querySort = searchParams.get('sort') || 'recommended';
  const queryPage = parseInt(searchParams.get('page') || '1', 10);

  // Local state for debouncing search input
  const [searchInput, setSearchInput] = useState(querySearch);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Data states
  const [hospitals, setHospitals] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [specializations, setSpecializations] = useState([]);
  const [savedHospitalIds, setSavedHospitalIds] = useState(new Set());
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

  // Load specializations for specialty filter
  useEffect(() => {
    const fetchSpecialties = async () => {
      try {
        const res = await discoveryService.getSpecializations();
        if (res.success) setSpecializations(res.data);
      } catch (err) {
        // Soft fail
      }
    };
    fetchSpecialties();
  }, []);

  // Fetch saved hospital IDs if authenticated patient
  useEffect(() => {
    if (isAuthenticated && currentUser?.role === 'patient') {
      patientService
        .getSavedHospitals()
        .then((res) => {
          if (res.success) {
            const ids = new Set(
              res.data.map((item) => (item.hospital?._id || item.hospital).toString())
            );
            setSavedHospitalIds(ids);
          }
        })
        .catch(() => {});
    }
  }, [isAuthenticated, currentUser]);

  // Fetch hospitals whenever URL params change
  useEffect(() => {
    let isMounted = true;
    const fetchHospitals = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = {
          page: queryPage,
          limit: 12,
          sort: querySort,
        };

        if (querySearch.trim()) params.search = querySearch.trim();
        if (queryType) params.hospitalType = queryType;
        if (queryEmergency === 'true') params.emergencyService = 'true';
        if (querySpecialty) params.specialties = querySpecialty;
        if (queryFacility) params.facilities = queryFacility;
        if (queryCity) params.city = queryCity;
        if (queryRating) params.ratingMin = Number(queryRating);

        const res = await discoveryService.getHospitals(params);

        if (isMounted && res.success) {
          setHospitals(res.data || []);
          setPagination(
            res.pagination || {
              page: queryPage,
              totalPages: 1,
              total: res.data?.length || 0,
            }
          );
        }
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.message || 'Failed to load hospitals. Please try again.');
          setHospitals([]);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchHospitals();

    return () => {
      isMounted = false;
    };
  }, [
    querySearch,
    queryType,
    queryEmergency,
    querySpecialty,
    queryFacility,
    queryCity,
    queryRating,
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

  const handleToggleSave = async (hospitalId) => {
    if (!isAuthenticated) {
      toast.error('Please log in as a patient to bookmark hospitals.');
      return;
    }
    if (currentUser?.role !== 'patient') {
      toast.error('Only patient accounts can save hospital bookmarks.');
      return;
    }

    const isCurrentlySaved = savedHospitalIds.has(hospitalId);
    try {
      if (isCurrentlySaved) {
        await patientService.removeSavedHospital(hospitalId);
        setSavedHospitalIds((prev) => {
          const next = new Set(prev);
          next.delete(hospitalId);
          return next;
        });
        toast.success('Hospital removed from saved list.');
      } else {
        await patientService.saveHospital(hospitalId);
        setSavedHospitalIds((prev) => new Set(prev).add(hospitalId));
        toast.success('Hospital saved to your bookmarks.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update bookmark.');
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    updateFilter('page', newPage.toString());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const hasActiveFilters = Boolean(
    querySearch ||
    queryType ||
    queryEmergency ||
    querySpecialty ||
    queryFacility ||
    queryCity ||
    queryRating ||
    querySort !== 'recommended'
  );

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-100 text-brand-700 text-xs font-bold uppercase tracking-wider mb-2">
            <Building2 className="w-3.5 h-3.5 text-brand-600" />
            <span>Healthcare Institutions</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900">
            Find Certified Hospitals & Clinics
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
            Explore accredited hospitals, emergency trauma units, and specialty clinics. Filter by departments, facilities, and verified ratings.
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

      {/* Search & Sort Top Bar */}
      <div className="p-3 sm:p-4 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by hospital name, city, locality, or landmark..."
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
            <option value="name">Hospital Name (A-Z)</option>
            <option value="beds">Bed Capacity (High to Low)</option>
            <option value="newest">Recently Added</option>
          </select>

          {hasActiveFilters && (
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

      {/* Main Content: Filter Sidebar + Hospitals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden md:block bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 space-y-5 sticky top-20">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-brand-600" />
              <span>Filter Hospitals</span>
            </h3>
            <button
              onClick={handleClearFilters}
              className="text-[11px] font-semibold text-brand-600 hover:text-brand-800"
            >
              Reset
            </button>
          </div>

          {/* Emergency 24/7 Quick Filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Emergency Care</label>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => updateFilter('emergencyService', '')}
                className={`py-1.5 rounded-xl border text-[11px] font-semibold transition-all ${
                  queryEmergency !== 'true'
                    ? 'bg-brand-50 border-brand-500 text-brand-700 font-bold'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                All Facilities
              </button>
              <button
                type="button"
                onClick={() => updateFilter('emergencyService', 'true')}
                className={`py-1.5 rounded-xl border text-[11px] font-semibold transition-all flex items-center justify-center gap-1 ${
                  queryEmergency === 'true'
                    ? 'bg-rose-50 border-rose-500 text-rose-700 font-bold'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <HeartPulse className="w-3 h-3 text-rose-500" />
                <span>24/7 Only</span>
              </button>
            </div>
          </div>

          {/* Hospital Type */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Facility Type</label>
            <select
              value={queryType}
              onChange={(e) => updateFilter('hospitalType', e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="">All Hospital Types</option>
              {HOSPITAL_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Specialty */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Specialty Department</label>
            <select
              value={querySpecialty}
              onChange={(e) => updateFilter('specialties', e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="">All Specialties</option>
              {specializations.map((spec) => (
                <option key={spec.id} value={spec.name}>
                  {spec.name}
                </option>
              ))}
            </select>
          </div>

          {/* Facility Highlights */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Required Facility</label>
            <select
              value={queryFacility}
              onChange={(e) => updateFilter('facilities', e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="">Any Facility</option>
              {COMMON_FACILITIES.map((facility) => (
                <option key={facility} value={facility}>
                  {facility}
                </option>
              ))}
            </select>
          </div>

          {/* City */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">City</label>
            <select
              value={queryCity}
              onChange={(e) => updateFilter('city', e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="">All Cities</option>
              <option value="Chennai">Chennai</option>
              <option value="Bangalore">Bangalore</option>
              <option value="Coimbatore">Coimbatore</option>
              <option value="Madurai">Madurai</option>
            </select>
          </div>

          {/* Minimum Rating */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Minimum Rating</label>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { label: 'Any', value: '' },
                { label: '4.0★+', value: '4.0' },
                { label: '4.5★+', value: '4.5' },
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
        </aside>

        {/* Mobile Filter Modal */}
        {mobileFilterOpen && (
          <div className="fixed inset-0 z-50 md:hidden bg-slate-900/60 backdrop-blur-xs flex justify-end">
            <div className="w-full max-w-xs bg-white h-full p-5 space-y-4 overflow-y-auto shadow-2xl flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <h3 className="font-display font-bold text-slate-900 flex items-center gap-2">
                    <Filter className="w-4 h-4 text-brand-600" />
                    <span>Filter Hospitals</span>
                  </h3>
                  <button
                    onClick={() => setMobileFilterOpen(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Emergency Filter */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Emergency Care</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => updateFilter('emergencyService', '')}
                      className={`py-1.5 rounded-xl border text-[11px] font-semibold ${
                        queryEmergency !== 'true'
                          ? 'bg-brand-50 border-brand-500 text-brand-700'
                          : 'border-slate-200 text-slate-600'
                      }`}
                    >
                      All Facilities
                    </button>
                    <button
                      type="button"
                      onClick={() => updateFilter('emergencyService', 'true')}
                      className={`py-1.5 rounded-xl border text-[11px] font-semibold flex items-center justify-center gap-1 ${
                        queryEmergency === 'true'
                          ? 'bg-rose-50 border-rose-500 text-rose-700'
                          : 'border-slate-200 text-slate-600'
                      }`}
                    >
                      <HeartPulse className="w-3 h-3 text-rose-500" />
                      <span>24/7 Only</span>
                    </button>
                  </div>
                </div>

                {/* Facility Type */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Facility Type</label>
                  <select
                    value={queryType}
                    onChange={(e) => updateFilter('hospitalType', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-800"
                  >
                    <option value="">All Hospital Types</option>
                    {HOSPITAL_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Specialty */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Specialty</label>
                  <select
                    value={querySpecialty}
                    onChange={(e) => updateFilter('specialties', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-800"
                  >
                    <option value="">All Specialties</option>
                    {specializations.map((spec) => (
                      <option key={spec.id} value={spec.name}>
                        {spec.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Facility */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Facility Highlights</label>
                  <select
                    value={queryFacility}
                    onChange={(e) => updateFilter('facilities', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-800"
                  >
                    <option value="">Any Facility</option>
                    {COMMON_FACILITIES.map((facility) => (
                      <option key={facility} value={facility}>
                        {facility}
                      </option>
                    ))}
                  </select>
                </div>

                {/* City */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">City</label>
                  <select
                    value={queryCity}
                    onChange={(e) => updateFilter('city', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-800"
                  >
                    <option value="">All Cities</option>
                    <option value="Chennai">Chennai</option>
                    <option value="Bangalore">Bangalore</option>
                    <option value="Coimbatore">Coimbatore</option>
                    <option value="Madurai">Madurai</option>
                  </select>
                </div>

                {/* Rating */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Minimum Rating</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { label: 'Any', value: '' },
                      { label: '4.0★+', value: '4.0' },
                      { label: '4.5★+', value: '4.5' },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => updateFilter('ratingMin', opt.value)}
                        className={`py-1.5 rounded-xl border text-[11px] font-semibold ${
                          queryRating === opt.value
                            ? 'bg-amber-50 border-amber-500 text-amber-800'
                            : 'border-slate-200 text-slate-600'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 space-y-2">
                <Button
                  variant="dark"
                  className="w-full justify-center"
                  onClick={() => setMobileFilterOpen(false)}
                >
                  Show Results
                </Button>
                <button
                  type="button"
                  onClick={() => {
                    handleClearFilters();
                    setMobileFilterOpen(false);
                  }}
                  className="w-full text-center text-xs font-semibold text-slate-500 hover:text-slate-800 py-1"
                >
                  Reset All Filters
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Results Container */}
        <main className="md:col-span-3 space-y-6">
          {/* Active Filter Chips & Result Count */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
            <div>
              {!loading && (
                <span>
                  Found <strong className="text-slate-900">{pagination.total}</strong> accredited{' '}
                  {pagination.total === 1 ? 'hospital' : 'hospitals'}
                  {queryCity && ` in ${queryCity}`}
                </span>
              )}
            </div>

            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-1.5">
                {querySearch && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-medium">
                    Search: "{querySearch}"
                    <button onClick={() => updateFilter('search', '')}>
                      <X className="w-3 h-3 hover:text-rose-600" />
                    </button>
                  </span>
                )}
                {queryEmergency === 'true' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 text-[11px] font-medium">
                    24/7 Emergency
                    <button onClick={() => updateFilter('emergencyService', '')}>
                      <X className="w-3 h-3 hover:text-rose-900" />
                    </button>
                  </span>
                )}
                {queryType && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-medium">
                    Type: {queryType}
                    <button onClick={() => updateFilter('hospitalType', '')}>
                      <X className="w-3 h-3 hover:text-rose-600" />
                    </button>
                  </span>
                )}
                {querySpecialty && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-medium">
                    {querySpecialty}
                    <button onClick={() => updateFilter('specialties', '')}>
                      <X className="w-3 h-3 hover:text-rose-600" />
                    </button>
                  </span>
                )}
                {queryFacility && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-medium">
                    {queryFacility}
                    <button onClick={() => updateFilter('facilities', '')}>
                      <X className="w-3 h-3 hover:text-rose-600" />
                    </button>
                  </span>
                )}
                {queryRating && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 text-[11px] font-medium">
                    ★ {queryRating}+
                    <button onClick={() => updateFilter('ratingMin', '')}>
                      <X className="w-3 h-3 hover:text-rose-600" />
                    </button>
                  </span>
                )}
                <button
                  onClick={handleClearFilters}
                  className="text-xs text-brand-600 font-bold hover:underline ml-1"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Skeleton Loader */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="rounded-3xl bg-white border border-slate-200 p-5 space-y-4 animate-pulse shadow-xs"
                >
                  <div className="h-44 bg-slate-100 rounded-2xl" />
                  <div className="h-4 bg-slate-200 rounded-md w-3/4" />
                  <div className="h-3 bg-slate-100 rounded-md w-1/2" />
                  <div className="flex gap-2 pt-2">
                    <div className="h-6 bg-slate-100 rounded-full w-20" />
                    <div className="h-6 bg-slate-100 rounded-full w-24" />
                  </div>
                  <div className="h-9 bg-slate-200 rounded-2xl mt-4" />
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && hospitals.length === 0 && !error && (
            <EmptyState
              icon={Building2}
              title="No hospitals found"
              description="No healthcare institutions matched your search filters. Try broadening your criteria or reset your filters."
              actionLabel="Reset All Filters"
              onAction={handleClearFilters}
            />
          )}

          {/* Hospitals Grid */}
          {!loading && hospitals.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {hospitals.map((hospital) => (
                <HospitalCard
                  key={hospital.id || hospital._id}
                  id={hospital.id || hospital._id}
                  name={hospital.name}
                  hospitalType={hospital.hospitalType}
                  rating={hospital.rating}
                  reviewCount={hospital.reviewCount}
                  address={hospital.address ? `${hospital.address.city}, ${hospital.address.state || 'TN'}` : hospital.city}
                  city={hospital.address?.city || hospital.city}
                  specialties={hospital.specialties || []}
                  facilities={hospital.facilities || []}
                  image={hospital.images?.[0] || hospital.image}
                  doctorCount={hospital.doctorsCount || 0}
                  emergencyService={hospital.emergencyService}
                  isSaved={savedHospitalIds.has((hospital.id || hospital._id).toString())}
                  onToggleSave={() => handleToggleSave((hospital.id || hospital._id).toString())}
                />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {!loading && pagination.totalPages > 1 && (
            <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
              <button
                type="button"
                disabled={pagination.page <= 1}
                onClick={() => handlePageChange(pagination.page - 1)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <span className="text-xs font-medium text-slate-500">
                Page <strong className="text-slate-800">{pagination.page}</strong> of{' '}
                <strong className="text-slate-800">{pagination.totalPages}</strong>
              </span>

              <button
                type="button"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => handlePageChange(pagination.page + 1)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
