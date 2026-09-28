import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Globe,
  FileText,
  Edit3,
  CheckCircle2,
  Shield,
  AlertCircle,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import patientService from '../../services/patientService';
import { PageLoader, Modal, Button, Input, Select, Textarea, Badge } from '../../components/ui';

export default function PatientProfile() {
  const { currentUser, updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await patientService.getProfile();
      if (res.success) {
        setProfile(res.data);
        reset({
          fullName: res.data.user?.fullName || '',
          phone: res.data.user?.phone || '',
          age: res.data.age || '',
          gender: res.data.gender || 'female',
          preferredLanguage: res.data.preferredLanguage || 'en',
          address: res.data.location?.address || '',
          city: res.data.location?.city || '',
          state: res.data.location?.state || '',
          pincode: res.data.location?.pincode || '',
          medicalHistorySummary: res.data.medicalHistorySummary || '',
        });
      }
    } catch (err) {
      toast.error(err.message || 'Failed to load profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const onSubmit = async (formData) => {
    try {
      setSaving(true);
      const res = await patientService.updateProfile(formData);
      if (res.success) {
        setProfile(res.data);
        if (updateUser) {
          updateUser(res.data.user);
        }
        toast.success('Profile updated successfully!');
        setIsEditModalOpen(false);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <PageLoader message="Loading profile details..." />;
  }

  const user = profile?.user || currentUser;
  const location = profile?.location || {};

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-teal-400 text-white flex items-center justify-center font-display font-extrabold text-2xl shadow-sm">
            {user?.fullName?.charAt(0) || 'P'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold text-slate-900">{user?.fullName}</h1>
              <Badge variant="primary" size="sm">
                Patient
              </Badge>
            </div>
            <p className="text-xs text-slate-500">{user?.email}</p>
          </div>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsEditModalOpen(true)}
          className="self-start sm:self-auto"
        >
          <Edit3 className="w-4 h-4 mr-1.5" />
          <span>Edit Profile</span>
        </Button>
      </div>

      {/* Grid of Profile Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Basic Information */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <User className="w-4 h-4 text-brand-600" />
            <span>Personal Details</span>
          </h2>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-500 font-medium">Full Name</span>
              <span className="font-semibold text-slate-900">{user?.fullName || '—'}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-500 font-medium">Email Address</span>
              <span className="font-semibold text-slate-900">{user?.email || '—'}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-500 font-medium">Phone Number</span>
              <span className="font-semibold text-slate-900">{user?.phone || '—'}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-500 font-medium">Age</span>
              <span className="font-semibold text-slate-900">
                {profile?.age ? `${profile.age} years` : '—'}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-500 font-medium">Gender</span>
              <span className="font-semibold text-slate-900 capitalize">
                {profile?.gender || '—'}
              </span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-500 font-medium">Preferred Language</span>
              <span className="font-semibold text-slate-900 uppercase">
                {profile?.preferredLanguage === 'ta'
                  ? 'Tamil (தமிழ்)'
                  : profile?.preferredLanguage === 'hi'
                  ? 'Hindi (हिन्दी)'
                  : 'English (EN)'}
              </span>
            </div>
          </div>
        </div>

        {/* 2. Address & Location */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-brand-600" />
            <span>Location & Address</span>
          </h2>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-500 font-medium">Address</span>
              <span className="font-semibold text-slate-900 text-right max-w-[200px] truncate">
                {location.address || '—'}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-500 font-medium">City</span>
              <span className="font-semibold text-slate-900">{location.city || '—'}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-500 font-medium">State</span>
              <span className="font-semibold text-slate-900">{location.state || '—'}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-500 font-medium">Postal Pincode</span>
              <span className="font-semibold text-slate-900">{location.pincode || '—'}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-500 font-medium">Proximity Region</span>
              <span className="font-semibold text-emerald-700">Chennai Metro Zone</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Medical History Summary */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-3">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <FileText className="w-4 h-4 text-brand-600" />
          <span>Medical History & Health Notes</span>
        </h2>
        <p className="text-[11px] text-slate-500">
          This confidential summary assists consulting doctors in understanding relevant allergies,
          conditions, or general medical background.
        </p>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-700 leading-relaxed min-h-[5rem]">
          {profile?.medicalHistorySummary ? (
            profile.medicalHistorySummary
          ) : (
            <span className="text-slate-400 italic">
              No medical background noted yet. Click "Edit Profile" to add relevant notes.
            </span>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Patient Profile"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              {...register('fullName', { required: 'Full name is required' })}
              error={errors.fullName?.message}
            />

            <Input
              label="Phone Number"
              {...register('phone', {
                required: 'Phone number is required',
                pattern: {
                  value: /^[+]?[0-9\s\-()]{7,18}$/,
                  message: 'Enter a valid phone number',
                },
              })}
              error={errors.phone?.message}
            />

            <Input
              label="Age"
              type="number"
              {...register('age', {
                required: 'Age is required',
                min: { value: 0, message: 'Age cannot be negative' },
                max: { value: 120, message: 'Enter a valid age' },
              })}
              error={errors.age?.message}
            />

            <Select
              label="Gender"
              {...register('gender')}
              options={[
                { value: 'female', label: 'Female' },
                { value: 'male', label: 'Male' },
                { value: 'other', label: 'Other' },
              ]}
            />

            <Select
              label="Preferred Language"
              {...register('preferredLanguage')}
              options={[
                { value: 'en', label: 'English (EN)' },
                { value: 'ta', label: 'Tamil (தமிழ்)' },
                { value: 'hi', label: 'Hindi (हिन्दी)' },
              ]}
            />

            <Input label="City" {...register('city')} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="State" {...register('state')} />
            <Input label="Pincode" {...register('pincode')} />
          </div>

          <Input label="Street Address" {...register('address')} />

          <Textarea
            label="Medical Background & Allergy Notes"
            rows={3}
            placeholder="e.g. Mild penicillin allergy, history of asthma, no chronic illness..."
            {...register('medicalHistorySummary')}
          />

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsEditModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={saving}>
              Save Profile
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
