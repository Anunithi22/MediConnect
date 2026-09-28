import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { History, Search, Trash2, ArrowRight, Clock, MapPin, Tag } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import patientService from '../../services/patientService';
import { PageLoader, EmptyState, Button, Modal } from '../../components/ui';

export default function PatientSearchHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clearModalOpen, setClearModalOpen] = useState(false);
  const [clearing, setClearing] = useState(false);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await patientService.getSearchHistory();
      if (res.success) {
        setHistory(res.data);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to load search history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDeleteItem = async (id) => {
    try {
      const res = await patientService.deleteSearchHistoryItem(id);
      if (res.success) {
        toast.success('Search query deleted.');
        setHistory((prev) => prev.filter((item) => item._id !== id));
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete query.');
    }
  };

  const handleClearAll = async () => {
    try {
      setClearing(true);
      const res = await patientService.clearSearchHistory();
      if (res.success) {
        toast.success('All search history cleared.');
        setHistory([]);
        setClearModalOpen(false);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to clear search history.');
    } finally {
      setClearing(false);
    }
  };

  if (loading) {
    return <PageLoader message="Loading your search history..." />;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-display font-extrabold text-slate-900">
            Search History
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Your recent medical searches and inquiries across doctors, hospitals, and specialties.
          </p>
        </div>

        {history.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setClearModalOpen(true)}
            className="text-rose-600 border-rose-200 hover:bg-rose-50"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1.5" />
            <span>Clear History</span>
          </Button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-10">
          <EmptyState
            icon={History}
            title="No search history recorded"
            description="Searches for doctors, medical conditions, and clinics will appear here for fast repeat queries."
            actionLabel="Start Searching Doctors"
            actionTo="/find-doctor"
          />
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs divide-y divide-slate-100 overflow-hidden">
          {history.map((item) => {
            const timeAgo = item.createdAt
              ? formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })
              : 'Recently';

            return (
              <div
                key={item._id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Search className="w-4 h-4 text-brand-600 shrink-0" />
                    <h3 className="text-sm font-bold text-slate-900 truncate">{item.query}</h3>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    {item.specialty && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-brand-50 text-brand-700 text-[11px] font-semibold border border-brand-100">
                        <Tag className="w-3 h-3" />
                        {item.specialty}
                      </span>
                    )}
                    {item.location && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {item.location}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                      <Clock className="w-3 h-3 text-slate-300" />
                      {timeAgo}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    to={`/find-doctor?q=${encodeURIComponent(item.query)}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-brand-50 text-slate-700 hover:text-brand-700 text-xs font-semibold transition-colors"
                  >
                    <span>Search Again</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>

                  <button
                    onClick={() => handleDeleteItem(item._id)}
                    title="Delete query"
                    className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Clear All Confirmation Modal */}
      <Modal
        isOpen={clearModalOpen}
        onClose={() => setClearModalOpen(false)}
        title="Clear Search History"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            Are you sure you want to permanently clear all your past search queries? This action
            cannot be undone.
          </p>
          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setClearModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              loading={clearing}
              onClick={handleClearAll}
            >
              Clear All
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
