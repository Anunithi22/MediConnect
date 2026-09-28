import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Trash2, MapPin, Phone, Star, Search, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import patientService from '../../services/patientService';
import { PageLoader, EmptyState, Badge, Button } from '../../components/ui';

export default function PatientSavedHospitals() {
  const [savedHospitals, setSavedHospitals] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSaved = async () => {
    try {
      setLoading(true);
      const res = await patientService.getSavedHospitals();
      if (res.success) {
        setSavedHospitals(res.data);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to load saved hospitals.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSaved();
  }, []);

  const handleRemove = async (id, hospitalName) => {
    try {
      const res = await patientService.removeSavedHospital(id);
      if (res.success) {
        toast.success(`${hospitalName || 'Hospital'} removed from saved list.`);
        setSavedHospitals((prev) => prev.filter((item) => item._id !== id));
      }
    } catch (err) {
      toast.error(err.message || 'Failed to remove hospital.');
    }
  };

  if (loading) {
    return <PageLoader message="Loading your saved hospitals..." />;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-display font-extrabold text-slate-900">
            Saved Hospitals
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Bookmarked clinics and hospitals across Chennai for easy referral and directions.
          </p>
        </div>
        <Link to="/find-hospital">
          <Button variant="outline" size="sm">
            <Search className="w-3.5 h-3.5 mr-1.5" />
            <span>Discover Hospitals</span>
          </Button>
        </Link>
      </div>

      {savedHospitals.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-10">
          <EmptyState
            icon={Building2}
            title="No saved hospitals yet"
            description="Bookmark reputable hospitals and multi-speciality centers near your Chennai location."
            actionLabel="Browse Verified Hospitals"
            actionTo="/find-hospital"
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {savedHospitals.map((item) => {
            const hosp = item.hospital || {};

            return (
              <div
                key={item._id}
                className="bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:border-brand-200 p-5 flex flex-col justify-between transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center font-bold text-lg">
                        <Building2 className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">{hosp.name}</h3>
                        <p className="text-xs text-slate-500">{hosp.city || 'Chennai'}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemove(item._id, hosp.name)}
                      title="Remove from saved"
                      className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600">
                    <p className="flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span>
                        {hosp.address}, {hosp.city} - {hosp.pincode}
                      </span>
                    </p>
                    {hosp.phone && (
                      <p className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>Helpline: {hosp.phone}</span>
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <div className="flex items-center gap-1 text-amber-500 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{hosp.rating || 4.7}</span>
                      <span className="text-[10px] text-slate-400 font-normal">
                        ({hosp.reviewCount || 0} reviews)
                      </span>
                    </div>

                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                      Verified Center
                    </span>
                  </div>
                </div>

                <div className="pt-4 mt-2">
                  <Link
                    to="/find-hospital"
                    className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors"
                  >
                    <span>View Facility Details</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
