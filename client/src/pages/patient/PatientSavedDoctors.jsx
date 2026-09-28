import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Trash2, Calendar, Star, Building2, MapPin, UserCheck, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import patientService from '../../services/patientService';
import { PageLoader, EmptyState, Badge, Button } from '../../components/ui';

export default function PatientSavedDoctors() {
  const [savedDoctors, setSavedDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSaved = async () => {
    try {
      setLoading(true);
      const res = await patientService.getSavedDoctors();
      if (res.success) {
        setSavedDoctors(res.data);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to load saved doctors.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSaved();
  }, []);

  const handleRemove = async (id, doctorName) => {
    try {
      const res = await patientService.removeSavedDoctor(id);
      if (res.success) {
        toast.success(`${doctorName || 'Doctor'} removed from saved list.`);
        setSavedDoctors((prev) => prev.filter((item) => item._id !== id));
      }
    } catch (err) {
      toast.error(err.message || 'Failed to remove doctor.');
    }
  };

  if (loading) {
    return <PageLoader message="Loading your saved doctors..." />;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-display font-extrabold text-slate-900">
            Saved Doctors
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Specialists and healthcare professionals you have bookmarked for future consultations.
          </p>
        </div>
        <Link to="/find-doctor">
          <Button variant="outline" size="sm">
            <Search className="w-3.5 h-3.5 mr-1.5" />
            <span>Discover More Doctors</span>
          </Button>
        </Link>
      </div>

      {savedDoctors.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-10">
          <EmptyState
            icon={Heart}
            title="No saved doctors yet"
            description="When exploring doctors and specialists, click the bookmark icon to save them for easy access later."
            actionLabel="Browse Verified Doctors"
            actionTo="/find-doctor"
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {savedDoctors.map((item) => {
            const doc = item.doctor || {};
            const user = doc.user || {};
            const hospital = doc.hospital || {};
            const spec = doc.specialization || {};

            return (
              <div
                key={item._id}
                className="bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:border-brand-200 p-5 flex flex-col justify-between transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-brand-50 border border-brand-200 text-brand-700 flex items-center justify-center font-bold text-lg">
                        {user.fullName?.charAt(0) || 'D'}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">{user.fullName}</h3>
                        <p className="text-xs text-brand-700 font-medium">
                          {spec.name || doc.specialtyName || 'Specialist'}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemove(item._id, user.fullName)}
                      title="Remove from saved"
                      className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600">
                    {doc.qualification && (
                      <p className="text-[11px] text-slate-500">{doc.qualification}</p>
                    )}
                    <p className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{hospital.name || doc.hospitalName}</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{hospital.city || 'Chennai'}</span>
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <div className="flex items-center gap-1 text-amber-500 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{doc.rating || 4.8}</span>
                      <span className="text-[10px] text-slate-400 font-normal">
                        ({doc.reviewCount || 0})
                      </span>
                    </div>

                    <span className="font-extrabold text-slate-900">
                      ₹{doc.consultationFee || 700}
                    </span>
                  </div>
                </div>

                <div className="pt-4 mt-2">
                  <Link
                    to="/find-doctor"
                    className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-bold transition-colors"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Book Consultation</span>
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
