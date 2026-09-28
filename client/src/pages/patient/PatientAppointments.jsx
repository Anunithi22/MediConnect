import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  FileText,
  AlertCircle,
  XCircle,
  CheckCircle,
  ChevronRight,
  Filter,
  DollarSign,
  Search,
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import patientService from '../../services/patientService';
import { PageLoader, EmptyState, Badge, Button, Modal, Textarea } from '../../components/ui';

export default function PatientAppointments() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'all';

  const [activeTab, setActiveTab] = useState(initialTab);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingApt, setCancellingApt] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const fetchAppointments = async (statusTab) => {
    try {
      setLoading(true);
      const res = await patientService.getMyAppointments(statusTab);
      if (res.success) {
        setAppointments(res.data);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to fetch appointments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments(activeTab);
  }, [activeTab]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams(tab === 'all' ? {} : { tab });
  };

  const handleCancelSubmit = async (e) => {
    e.preventDefault();
    if (!cancellingApt) return;
    try {
      setCancelling(true);
      const res = await patientService.cancelAppointment(
        cancellingApt._id,
        cancelReason || 'Cancelled by patient request'
      );
      if (res.success) {
        toast.success('Appointment cancelled successfully.');
        setCancellingApt(null);
        setCancelReason('');
        // Refresh list
        fetchAppointments(activeTab);
      }
    } catch (err) {
      toast.error(err.message || 'Unable to cancel appointment.');
    } finally {
      setCancelling(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return <Badge variant="success">Confirmed</Badge>;
      case 'completed':
        return <Badge variant="primary">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="danger">Cancelled</Badge>;
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Tabs */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-display font-extrabold text-slate-900">
            My Appointments
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your scheduled, past, and cancelled medical consultations.
          </p>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 border border-slate-200/60 self-start md:self-auto overflow-x-auto">
          {[
            { id: 'all', label: 'All' },
            { id: 'upcoming', label: 'Upcoming' },
            { id: 'completed', label: 'Completed' },
            { id: 'cancelled', label: 'Cancelled' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Appointments List */}
      {loading ? (
        <PageLoader message="Loading appointments..." />
      ) : appointments.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-10">
          <EmptyState
            icon={Calendar}
            title={
              activeTab === 'all'
                ? 'No appointments found'
                : `No ${activeTab} appointments found`
            }
            description="Consult with trusted doctors across Chennai. Book a visit for routine checkups or specialist care."
            actionLabel="Find a Doctor Now"
            actionTo="/find-doctor"
          />
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((apt) => {
            const isUpcoming =
              apt.status === 'confirmed' || apt.status === 'pending';
            const aptDate = apt.date ? new Date(apt.date) : null;

            return (
              <div
                key={apt._id}
                className="bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:border-brand-200 p-5 sm:p-6 transition-all"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                  {/* Left Column: Doctor & Hospital info */}
                  <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      {getStatusBadge(apt.status)}
                      <span className="font-mono text-xs font-semibold text-slate-500">
                        {apt.bookingId}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-xs font-medium text-slate-500">
                        Fee: ₹{apt.consultationFee || 0}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900">
                        {apt.doctor?.user?.fullName || 'Specialist Doctor'}
                      </h3>
                      <p className="text-xs font-medium text-brand-700">
                        {apt.doctor?.specialization?.name || 'General Practitioner'} •{' '}
                        {apt.hospital?.name}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {aptDate
                            ? format(aptDate, 'EEEE, MMM d, yyyy')
                            : 'Scheduled'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-semibold text-slate-800">
                          {apt.timeSlot}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{apt.hospital?.address || 'Chennai'}</span>
                      </div>
                    </div>

                    {apt.reason && (
                      <p className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100/80">
                        <span className="font-semibold text-slate-700">Reason: </span>
                        {apt.reason}
                      </p>
                    )}

                    {apt.cancellationReason && (
                      <p className="text-xs text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-100">
                        <span className="font-semibold">Cancellation Note: </span>
                        {apt.cancellationReason}
                      </p>
                    )}
                  </div>

                  {/* Right Column: Actions */}
                  <div className="flex sm:flex-row lg:flex-col items-center gap-2.5 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                    <Link
                      to={`/patient/appointments/${apt._id}`}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-bold transition-colors"
                    >
                      <span>View Details</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>

                    {isUpcoming && (
                      <button
                        onClick={() => setCancellingApt(apt)}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-colors"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Cancel</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancel Appointment Modal */}
      <Modal
        isOpen={Boolean(cancellingApt)}
        onClose={() => setCancellingApt(null)}
        title="Cancel Appointment"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCancelSubmit} className="space-y-4">
          <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200/80 text-xs text-amber-800 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p>
              Are you sure you want to cancel booking{' '}
              <strong className="font-mono">{cancellingApt?.bookingId}</strong> with{' '}
              <strong>{cancellingApt?.doctor?.user?.fullName}</strong>?
            </p>
          </div>

          <Textarea
            label="Reason for Cancellation"
            rows={3}
            placeholder="Please specify a reason (e.g. Schedule conflict, feeling better, relocated)..."
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
          />

          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setCancellingApt(null)}
            >
              Keep Appointment
            </Button>
            <Button
              type="submit"
              variant="danger"
              size="sm"
              loading={cancelling}
            >
              Confirm Cancellation
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
