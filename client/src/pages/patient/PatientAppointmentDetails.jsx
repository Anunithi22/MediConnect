import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Phone,
  User,
  Building2,
  FileText,
  DollarSign,
  Star,
  CheckCircle,
  AlertCircle,
  XCircle,
  ShieldCheck,
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import patientService from '../../services/patientService';
import { PageLoader, Badge, Button, Modal, Textarea } from '../../components/ui';

export default function PatientAppointmentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancellingOpen, setCancellingOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const fetchAppointment = async () => {
    try {
      setLoading(true);
      const res = await patientService.getAppointmentById(id);
      if (res.success) {
        setAppointment(res.data);
      }
    } catch (err) {
      toast.error(err.message || 'Appointment not found or unauthorized.');
      navigate('/patient/appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointment();
  }, [id]);

  const handleCancelSubmit = async (e) => {
    e.preventDefault();
    try {
      setCancelling(true);
      const res = await patientService.cancelAppointment(
        appointment._id,
        cancelReason || 'Cancelled by patient'
      );
      if (res.success) {
        toast.success('Appointment cancelled.');
        setCancellingOpen(false);
        fetchAppointment();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to cancel.');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return <PageLoader message="Loading appointment details..." />;
  }

  if (!appointment) return null;

  const isUpcoming =
    appointment.status === 'confirmed' || appointment.status === 'pending';
  const aptDate = appointment.date ? new Date(appointment.date) : null;
  const doctor = appointment.doctor || {};
  const hospital = appointment.hospital || {};
  const review = appointment.review || null;

  return (
    <div className="space-y-6">
      {/* Top Back Navigation Bar */}
      <div className="flex items-center justify-between">
        <Link
          to="/patient/appointments"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Appointments</span>
        </Link>

        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-semibold text-slate-500">
            Booking ID: {appointment.bookingId}
          </span>
          <Badge
            variant={
              appointment.status === 'confirmed'
                ? 'success'
                : appointment.status === 'completed'
                ? 'primary'
                : appointment.status === 'cancelled'
                ? 'danger'
                : 'neutral'
            }
          >
            {appointment.status?.toUpperCase()}
          </Badge>
        </div>
      </div>

      {/* Main Grid: Details + Sidebar Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Doctor, Hospital, Notes */}
        <div className="lg:col-span-2 space-y-6">
          {/* Doctor Overview Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-brand-600" />
              <span>Consulting Specialist</span>
            </h2>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-brand-50 border border-brand-200 text-brand-700 flex items-center justify-center font-bold text-lg shrink-0">
                  {doctor.user?.fullName?.charAt(0) || 'D'}
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-900">
                    {doctor.user?.fullName || 'Doctor'}
                  </h3>
                  <p className="text-xs font-semibold text-brand-700">
                    {doctor.specialization?.name || 'Specialist'}
                  </p>
                  {doctor.qualification && (
                    <p className="text-xs text-slate-500">{doctor.qualification}</p>
                  )}
                </div>
              </div>

              <div className="text-left sm:text-right pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                <span className="text-[11px] text-slate-500 block">Consultation Fee</span>
                <span className="text-base font-extrabold text-slate-900">
                  ₹{appointment.consultationFee || doctor.consultationFee || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Hospital Location Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-3">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-brand-600" />
              <span>Hospital & Facility Information</span>
            </h2>

            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-sm text-slate-900">{hospital.name}</h4>
              <p className="text-slate-600 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>
                  {hospital.address}, {hospital.city}, {hospital.state} - {hospital.pincode}
                </span>
              </p>
              {hospital.phone && (
                <p className="text-slate-600 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Reception: {hospital.phone}</span>
                </p>
              )}
            </div>
          </div>

          {/* Consultation Notes / Reason */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-3">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand-600" />
              <span>Consultation Reason</span>
            </h2>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-700 leading-relaxed">
              {appointment.reason || 'General health consultation.'}
            </div>

            {appointment.cancellationReason && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 text-xs text-rose-700 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <XCircle className="w-4 h-4 text-rose-600" />
                  <span>Cancelled Consultation</span>
                </p>
                <p>{appointment.cancellationReason}</p>
              </div>
            )}
          </div>

          {/* Review if Completed */}
          {review && (
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-3">
              <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500" />
                <span>Your Verified Feedback</span>
              </h2>

              <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100 space-y-2">
                <div className="flex items-center gap-1.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < review.doctorRating
                          ? 'text-amber-500 fill-amber-500'
                          : 'text-slate-300'
                      }`}
                    />
                  ))}
                  <span className="text-xs font-bold text-slate-800 ml-1">
                    {review.doctorRating} / 5
                  </span>
                </div>
                {review.doctorReview && (
                  <p className="text-xs text-slate-700 italic">"{review.doctorReview}"</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Appointment Schedule & Actions */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-5">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
              Appointment Summary
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500 font-medium">Date</span>
                <span className="font-bold text-slate-900">
                  {aptDate ? format(aptDate, 'MMM d, yyyy') : 'Scheduled'}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500 font-medium">Time Slot</span>
                <span className="font-bold text-brand-700">{appointment.timeSlot}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500 font-medium">Status</span>
                <span className="font-bold capitalize text-slate-900">
                  {appointment.status}
                </span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500 font-medium">Consultation Fee</span>
                <span className="font-bold text-slate-900">
                  ₹{appointment.consultationFee || 0}
                </span>
              </div>
            </div>

            {isUpcoming && (
              <div className="pt-2 space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-rose-600 border-rose-200 hover:bg-rose-50"
                  onClick={() => setCancellingOpen(true)}
                >
                  <XCircle className="w-4 h-4 mr-1.5" />
                  <span>Cancel Appointment</span>
                </Button>
              </div>
            )}
          </div>

          {/* Safety & Protocol Banner */}
          <div className="p-4 rounded-3xl bg-slate-100/70 border border-slate-200/70 text-[11px] text-slate-600 space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Patient Guidelines</span>
            </div>
            <p>
              Please arrive 15 minutes ahead of your slot time with any prior medical records or
              prescription history.
            </p>
          </div>
        </div>
      </div>

      {/* Cancel Modal */}
      <Modal
        isOpen={cancellingOpen}
        onClose={() => setCancellingOpen(false)}
        title="Confirm Cancellation"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCancelSubmit} className="space-y-4">
          <p className="text-xs text-slate-600">
            Please let us know why you are cancelling this appointment:
          </p>
          <Textarea
            rows={3}
            placeholder="Cancellation reason..."
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
          />
          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setCancellingOpen(false)}
            >
              Back
            </Button>
            <Button type="submit" variant="danger" size="sm" loading={cancelling}>
              Cancel Appointment
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
