import React, { useState } from 'react';
import { Settings, Globe, Bell, Shield, KeyRound, CheckCircle, Save } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { Button, Select } from '../../components/ui';

export default function PatientSettings() {
  const { currentUser } = useAuth();
  const { i18n } = useTranslation();

  const [language, setLanguage] = useState(i18n.language || 'en');
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [healthTips, setHealthTips] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    i18n.changeLanguage(lang);
    localStorage.setItem('mediconnect_lng', lang);
    toast.success('Interface language updated.');
  };

  const handleSavePreferences = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success('Notification preferences saved.');
    }, 500);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6">
        <h1 className="text-xl font-display font-extrabold text-slate-900">
          Account Settings & Preferences
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure language preferences, notification frequencies, and view account security status.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Language & Regional */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Globe className="w-4 h-4 text-brand-600" />
            <span>Language & Region</span>
          </h2>

          <div className="space-y-3">
            <label className="text-xs font-semibold text-slate-700 block">
              Display Language
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { code: 'en', label: 'English', native: 'English' },
                { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
                { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
              ].map((item) => (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => handleLanguageChange(item.code)}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    language === item.code
                      ? 'border-brand-600 bg-brand-50/70 text-brand-700 font-bold shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                  }`}
                >
                  <span className="block text-xs font-bold">{item.label}</span>
                  <span className="block text-[11px] text-slate-500">{item.native}</span>
                </button>
              ))}
            </div>

            <div className="pt-2">
              <span className="text-slate-500 text-xs font-medium">Regional Proximity: </span>
              <span className="text-xs font-bold text-slate-800">
                Chennai Metropolitan Area (Tamil Nadu)
              </span>
            </div>
          </div>
        </div>

        {/* Notifications Configuration */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Bell className="w-4 h-4 text-brand-600" />
            <span>Notification Preferences</span>
          </h2>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 cursor-pointer">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-800 block">
                  Email Reminders
                </span>
                <span className="text-[11px] text-slate-500 block">
                  Receive email confirmations 24 hours prior to consultations.
                </span>
              </div>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-slate-300"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 cursor-pointer">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-800 block">
                  SMS / Mobile Alerts
                </span>
                <span className="text-[11px] text-slate-500 block">
                  Get instant text notifications for booking status changes.
                </span>
              </div>
              <input
                type="checkbox"
                checked={smsAlerts}
                onChange={(e) => setSmsAlerts(e.target.checked)}
                className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-slate-300"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 cursor-pointer">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-800 block">
                  Health Awareness Tips
                </span>
                <span className="text-[11px] text-slate-500 block">
                  Occasional non-promotional preventive care guidelines.
                </span>
              </div>
              <input
                type="checkbox"
                checked={healthTips}
                onChange={(e) => setHealthTips(e.target.checked)}
                className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-slate-300"
              />
            </label>

            <Button
              variant="primary"
              size="sm"
              loading={saving}
              onClick={handleSavePreferences}
              className="mt-2"
            >
              <Save className="w-3.5 h-3.5 mr-1.5" />
              <span>Save Preferences</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Account Security Information */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-3">
        <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-600" />
          <span>Security & Authentication</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-slate-500 font-medium block">Account Type</span>
            <span className="font-bold text-slate-900 uppercase">Patient</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-slate-500 font-medium block">Session Security</span>
            <span className="font-bold text-emerald-700">JWT Token Authenticated</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-slate-500 font-medium block">Data Encryption</span>
            <span className="font-bold text-slate-900">BCrypt Salted Hash</span>
          </div>
        </div>
      </div>
    </div>
  );
}
