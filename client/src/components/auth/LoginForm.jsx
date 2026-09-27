import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LogIn, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Loader2, 
  ShieldCheck, 
  CheckCircle,
  Sparkles
} from 'lucide-react';

export default function LoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Target route to return to or role default
  const from = location.state?.from?.pathname;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!email.trim() || !password) {
      setFormError('Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);
    const result = await login(email, password);
    setIsSubmitting(false);

    if (result.success && result.user) {
      // Role-based redirection
      if (from) {
        navigate(from, { replace: true });
      } else if (result.user.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else if (result.user.role === 'doctor') {
        navigate('/doctor/dashboard', { replace: true });
      } else {
        navigate('/patient/dashboard', { replace: true });
      }
    } else {
      setFormError(result.error || 'Authentication failed. Please verify your credentials.');
    }
  };

  // Quick Demo fill buttons for reviewers
  const handleQuickDemo = (demoRole) => {
    if (demoRole === 'admin') {
      setEmail('admin@mediconnect.com');
      setPassword('Admin@123456');
    } else if (demoRole === 'doctor') {
      setEmail('doctor@mediconnect.com');
      setPassword('Doctor@123456');
    } else {
      setEmail('patient@mediconnect.com');
      setPassword('Patient@123456');
    }
    setFormError('');
  };

  return (
    <div className="w-full">
      {/* Outer Shell Machine Bezel */}
      <div className="p-2 sm:p-2.5 rounded-3xl bg-slate-200/60 backdrop-blur-md shadow-card border border-white/60">
        
        {/* Inner Core */}
        <div className="bg-white rounded-[1.35rem] p-6 sm:p-8 space-y-6">
          
          <div className="text-center space-y-1.5">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600 mx-auto shadow-xs">
              <LogIn className="w-6 h-6" />
            </div>
            <h2 className="font-display text-2xl font-bold text-slate-900 tracking-tight">
              Sign In to MediConnect
            </h2>
            <p className="text-xs text-slate-500">
              Access your medical dashboard, appointments, and live recommendations
            </p>
          </div>

          {/* Quick Demo Selector */}
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <span className="flex items-center gap-1 text-brand-700">
                <Sparkles className="w-3 h-3 text-brand-600" />
                Quick Demo Accounts:
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => handleQuickDemo('patient')}
                className="py-1.5 px-2 rounded-xl bg-white border border-slate-200 hover:border-brand-500 hover:text-brand-700 font-semibold text-slate-700 transition-all shadow-2xs text-center"
              >
                Patient
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('doctor')}
                className="py-1.5 px-2 rounded-xl bg-white border border-slate-200 hover:border-brand-500 hover:text-brand-700 font-semibold text-slate-700 transition-all shadow-2xs text-center"
              >
                Doctor
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('admin')}
                className="py-1.5 px-2 rounded-xl bg-white border border-slate-200 hover:border-brand-500 hover:text-brand-700 font-semibold text-slate-700 transition-all shadow-2xs text-center"
              >
                Admin
              </button>
            </div>
          </div>

          {formError && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-700 animate-in fade-in duration-200">
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-slate-900 hover:bg-brand-600 text-white font-semibold text-sm shadow-md transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>

          </form>

          {/* Footer Navigation */}
          <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-brand-600 hover:text-brand-700 transition-colors">
              Create a free account
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
