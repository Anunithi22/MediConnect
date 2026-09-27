import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, ShieldCheck, LogOut, CheckCircle, Search, Calendar, Heart } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function PatientDashboard() {
  const { currentUser, logout } = useAuth();
  const [testResult, setTestResult] = useState(null);

  const testAuthEndpoint = async (roleName) => {
    try {
      const res = await api.get(`/auth/test/${roleName}-only`);
      setTestResult({
        success: true,
        endpoint: `/api/auth/test/${roleName}-only`,
        message: res.data.message,
      });
      toast.success(res.data.message);
    } catch (err) {
      setTestResult({
        success: false,
        endpoint: `/api/auth/test/${roleName}-only`,
        message: err.message || 'Access Denied',
      });
      toast.error(err.message || 'Access Denied (403 Forbidden)');
    }
  };

  return (
    <div className="py-12 max-w-5xl mx-auto px-4 sm:px-6">
      
      {/* Welcome Card */}
      <div className="p-2 rounded-3xl bg-slate-200/60 backdrop-blur-md shadow-card border border-white/60 mb-8">
        <div className="bg-white rounded-[1.35rem] p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-600 font-display font-extrabold text-2xl">
              {currentUser?.fullName?.charAt(0) || 'P'}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="font-display text-2xl font-bold text-slate-900">
                  Welcome, {currentUser?.fullName}!
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200 uppercase">
                  Patient Portal
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Email: {currentUser?.email} | Patient ID: {currentUser?.patientId || currentUser?.id}
              </p>
            </div>
          </div>

          <button
            onClick={logout}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors shadow-2xs"
          >
            <LogOut className="w-3.5 h-3.5 text-slate-500" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Role Verification Testing Module */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-subtle mb-8 space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-brand-600" />
          <h3 className="font-display font-bold text-slate-900 text-sm">
            Live Role-Based Access Control (RBAC) Verification
          </h3>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">
          Test real-time backend endpoint authorization using your current JWT token:
        </p>

        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => testAuthEndpoint('patient')}
            className="px-3.5 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-semibold transition-colors"
          >
            Test Patient Route (Allowed)
          </button>
          <button
            onClick={() => testAuthEndpoint('doctor')}
            className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-semibold transition-colors"
          >
            Test Doctor Route (Should Block 403)
          </button>
          <button
            onClick={() => testAuthEndpoint('admin')}
            className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-xs font-semibold transition-colors"
          >
            Test Admin Route (Should Block 403)
          </button>
        </div>

        {testResult && (
          <div
            className={`p-3.5 rounded-2xl text-xs font-mono border ${
              testResult.success
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            <strong>[{testResult.endpoint}]</strong>: {testResult.message}
          </div>
        )}
      </div>

      {/* Placeholder Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
          <Calendar className="w-6 h-6 text-brand-600 mx-auto" />
          <h4 className="font-bold text-sm text-slate-800">Upcoming Consultations</h4>
          <p className="text-xs text-slate-400">Appointment management module connected in Phase 10</p>
        </div>
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
          <Heart className="w-6 h-6 text-rose-500 mx-auto" />
          <h4 className="font-bold text-sm text-slate-800">Saved Healthcare Providers</h4>
          <p className="text-xs text-slate-400">Saved doctors and hospitals view connected in Phase 5</p>
        </div>
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
          <Search className="w-6 h-6 text-indigo-500 mx-auto" />
          <h4 className="font-bold text-sm text-slate-800">AI Health Search</h4>
          <p className="text-xs text-slate-400">Symptom semantic matching connected in Phase 12</p>
        </div>
      </div>

    </div>
  );
}
