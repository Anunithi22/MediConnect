import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, LogOut, Users, UserCheck, Building2, Activity, Settings } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
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
      <div className="p-2 rounded-3xl bg-slate-900 shadow-elevated border border-slate-800 mb-8">
        <div className="bg-slate-950 rounded-[1.35rem] p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 text-white">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 font-display font-extrabold text-2xl">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="font-display text-2xl font-bold tracking-tight">
                  MediConnect Central Administration
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 uppercase">
                  Super Admin
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Administrator: {currentUser?.fullName} ({currentUser?.email})
              </p>
            </div>
          </div>

          <button
            onClick={logout}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors border border-slate-700 shadow-2xs"
          >
            <LogOut className="w-3.5 h-3.5 text-slate-400" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Role Verification Testing Module */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-subtle mb-8 space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-rose-600" />
          <h3 className="font-display font-bold text-slate-900 text-sm">
            Live Role-Based Access Control (RBAC) Verification
          </h3>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">
          Test real-time backend endpoint authorization using your admin credentials:
        </p>

        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => testAuthEndpoint('admin')}
            className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-xs font-semibold transition-colors"
          >
            Test Admin Route (Allowed)
          </button>
          <button
            onClick={() => testAuthEndpoint('patient')}
            className="px-3.5 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-semibold transition-colors"
          >
            Test Patient Route (Blocked - Role Strict)
          </button>
          <button
            onClick={() => testAuthEndpoint('doctor')}
            className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-xs font-semibold transition-colors"
          >
            Test Doctor Route (Blocked - Role Strict)
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

      {/* Admin Modules Preview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
          <UserCheck className="w-6 h-6 text-rose-600 mx-auto" />
          <h4 className="font-bold text-sm text-slate-800">Doctor Verification</h4>
          <p className="text-[11px] text-slate-400">Doctor approval pipeline connected in Phase 14</p>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
          <Building2 className="w-6 h-6 text-indigo-600 mx-auto" />
          <h4 className="font-bold text-sm text-slate-800">Hospital Registry</h4>
          <p className="text-[11px] text-slate-400">Facility management connected in Phase 14</p>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
          <Activity className="w-6 h-6 text-brand-600 mx-auto" />
          <h4 className="font-bold text-sm text-slate-800">Platform Analytics</h4>
          <p className="text-[11px] text-slate-400">Recharts reporting connected in Phase 14</p>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
          <Settings className="w-6 h-6 text-slate-600 mx-auto" />
          <h4 className="font-bold text-sm text-slate-800">AI Scoring Weights</h4>
          <p className="text-[11px] text-slate-400">Recommendation settings connected in Phase 14</p>
        </div>
      </div>

    </div>
  );
}
