import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, Building2, User, Calendar, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import patientService from '../../services/patientService';
import { PageLoader, EmptyState } from '../../components/ui';

export default function PatientReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const res = await patientService.getMyReviews();
        if (res.success) {
          setReviews(res.data);
        }
      } catch (err) {
        toast.error(err.message || 'Failed to load reviews.');
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  if (loading) {
    return <PageLoader message="Loading your submitted reviews..." />;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6">
        <h1 className="text-xl font-display font-extrabold text-slate-900">
          My Doctor & Hospital Reviews
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Feedback and ratings you shared after completed medical consultations.
        </p>
      </div>

      {reviews.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-10">
          <EmptyState
            icon={Star}
            title="No reviews submitted yet"
            description="Once you complete a consultation, you can leave verified feedback about doctor expertise, waiting times, and hospital facilities."
            actionLabel="View Appointments"
            actionTo="/patient/appointments"
          />
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((rev) => {
            const doc = rev.doctor || {};
            const docUser = doc.user || {};
            const hosp = rev.hospital || {};
            const apt = rev.appointment || {};

            return (
              <div
                key={rev._id}
                className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-brand-50 border border-brand-200 text-brand-700 flex items-center justify-center font-bold text-sm">
                      {docUser.fullName?.charAt(0) || 'D'}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        {docUser.fullName || 'Consultant'}
                      </h3>
                      <p className="text-xs text-brand-700 font-medium">
                        {hosp.name || 'Hospital Center'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      {rev.createdAt
                        ? format(new Date(rev.createdAt), 'MMM d, yyyy')
                        : 'Reviewed'}
                    </span>
                  </div>
                </div>

                {/* Rating & Feedback text */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-500">Doctor Rating:</span>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < rev.doctorRating
                              ? 'text-amber-500 fill-amber-400'
                              : 'text-slate-200'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-bold text-slate-800">
                      {rev.doctorRating} / 5
                    </span>
                  </div>

                  {rev.doctorReview && (
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-700 leading-relaxed italic">
                      "{rev.doctorReview}"
                    </div>
                  )}

                  {rev.hospitalReview && (
                    <div className="pt-2">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-slate-500">
                          Hospital Rating:
                        </span>
                        <span className="text-xs font-bold text-slate-800">
                          {rev.hospitalRating} / 5
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
                        {rev.hospitalReview}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span className="font-semibold">Verified Patient Review</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
