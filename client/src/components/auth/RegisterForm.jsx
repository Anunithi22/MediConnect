import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  UserPlus, 
  User, 
  Stethoscope, 
  Mail, 
  Phone, 
  Lock, 
  Eye, 
  EyeOff, 
  Loader2, 
  CheckCircle,
  ShieldCheck,
  Building,
  DollarSign,
  Award
} from 'lucide-react';

export default function RegisterForm() {
  const { registerPatient, registerDoctor } = useAuth();
  const navigate = useNavigate();

  // Role selector: patient or doctor only (NEVER admin)
  const [role, setRole] = useState('patient');

  // Common Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Patient Fields
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('male');
  const [preferredLanguage, setPreferredLanguage] = useState('en');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Tamil Nadu');

  // Doctor Fields
  const [qualification, setQualification] = useState('');
  const [specialization, setSpecialization] = useState('General Medicine');
  const [experience, setExperience] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [consultationFee, setConsultationFee] = useState('');
  const [languages, setLanguages] = useState(['English', 'Tamil']);
  const [bio, setBio] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const specialtiesList = [
    'General Medicine',
    'Cardiology',
    'Dermatology',
    'Pediatrics',
    'Orthopedics',
    'Neurology',
    'Gynecology',
    'Ophthalmology',
    'Gastroenterology',
    'Oncology',
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    // Common validations
    if (password.length < 6) {
      setFormError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setFormError('Confirm password does not match password.');
      return;
    }

    setIsSubmitting(true);

    if (role === 'patient') {
      const patientPayload = {
        fullName,
        email,
        phone,
        password,
        confirmPassword,
        age: parseInt(age, 10),
        gender,
        preferredLanguage,
        location: { city, state },
      };

      const result = await registerPatient(patientPayload);
      setIsSubmitting(false);

      if (result.success) {
        navigate('/patient/dashboard', { replace: true });
      } else {
        setFormError(result.error || 'Registration failed. Please check inputs.');
      }
    } else {
      // Doctor registration
      const doctorPayload = {
        fullName,
        email,
        phone,
        password,
        confirmPassword,
        qualification,
        specialization,
        experience: parseInt(experience, 10),
        hospitalName,
        consultationFee: parseFloat(consultationFee),
        languages,
        bio,
      };

      const result = await registerDoctor(doctorPayload);
      setIsSubmitting(false);

      if (result.success) {
        navigate('/doctor/dashboard', { replace: true });
      } else {
        setFormError(result.error || 'Doctor registration failed.');
      }
    }
  };

  return (
    <div className="w-full">
      {/* Outer Shell Machine Bezel */}
      <div className="p-2 sm:p-2.5 rounded-3xl bg-slate-200/60 backdrop-blur-md shadow-card border border-white/60">
        
        {/* Inner White Core */}
        <div className="bg-white rounded-[1.35rem] p-6 sm:p-8 space-y-6">
          
          <div className="text-center space-y-1.5">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600 mx-auto shadow-xs">
              <UserPlus className="w-6 h-6" />
            </div>
            <h2 className="font-display text-2xl font-bold text-slate-900 tracking-tight">
              Create an Account
            </h2>
            <p className="text-xs text-slate-500">
              Join MediConnect to access intelligent healthcare matching and direct appointments
            </p>
          </div>

          {/* Role Chooser Tabs */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider text-center">
              How do you want to use MediConnect?
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl">
              <button
                type="button"
                onClick={() => { setRole('patient'); setFormError(''); }}
                className={`py-2.5 px-3 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${
                  role === 'patient'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <User className="w-4 h-4 text-brand-600" />
                <span>I am a Patient</span>
              </button>

              <button
                type="button"
                onClick={() => { setRole('doctor'); setFormError(''); }}
                className={`py-2.5 px-3 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${
                  role === 'doctor'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Stethoscope className="w-4 h-4 text-brand-600" />
                <span>I am a Doctor</span>
              </button>
            </div>
          </div>

          {formError && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-700 animate-in fade-in duration-200">
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Common: Full Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={role === 'doctor' ? 'Dr. Vignesh Raman' : 'Ananya Sharma'}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
              />
            </div>

            {/* Common: Email & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 9876543210"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                />
              </div>
            </div>

            {/* Common: Password & Confirm */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Confirm Password
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat password"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                />
              </div>
            </div>

            {/* PATIENT SPECIFIC FIELDS */}
            {role === 'patient' && (
              <div className="pt-2 border-t border-slate-100 space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Age
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="120"
                      required
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="28"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Gender
                    </label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 bg-white"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Language
                    </label>
                    <select
                      value={preferredLanguage}
                      onChange={(e) => setPreferredLanguage(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 bg-white"
                    >
                      <option value="en">English</option>
                      <option value="ta">தமிழ் (Tamil)</option>
                      <option value="hi">हिन्दी (Hindi)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      City / Area
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Chennai"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      State
                    </label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="e.g. Tamil Nadu"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* DOCTOR SPECIFIC FIELDS */}
            {role === 'doctor' && (
              <div className="pt-2 border-t border-slate-100 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Qualification
                    </label>
                    <input
                      type="text"
                      required
                      value={qualification}
                      onChange={(e) => setQualification(e.target.value)}
                      placeholder="e.g. MBBS, MD (Cardiology)"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Specialization
                    </label>
                    <select
                      value={specialization}
                      onChange={(e) => setSpecialization(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 bg-white"
                    >
                      {specialtiesList.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Experience (Years)
                    </label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      placeholder="10"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Consultation Fee (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={consultationFee}
                      onChange={(e) => setConsultationFee(e.target.value)}
                      placeholder="600"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Hospital Affiliation
                    </label>
                    <input
                      type="text"
                      value={hospitalName}
                      onChange={(e) => setHospitalName(e.target.value)}
                      placeholder="e.g. Apollo Hospital"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Professional Bio
                  </label>
                  <textarea
                    rows={2}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Brief background on medical expertise and clinical philosophy..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm text-slate-800 resize-none"
                  />
                </div>

                <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200/80 text-[11px] text-amber-800 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <ShieldCheck className="w-4 h-4 text-amber-700" />
                    <span>Admin Verification Mandate</span>
                  </div>
                  <p>
                    Newly registered doctor profiles undergo strict credential verification by platform administrators before appearing in public patient searches.
                  </p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-slate-900 hover:bg-brand-600 text-white font-semibold text-sm shadow-md transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing Registration...</span>
                </>
              ) : (
                <span>Complete {role === 'doctor' ? 'Doctor' : 'Patient'} Registration</span>
              )}
            </button>

          </form>

          {/* Footer Navigation */}
          <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-brand-600 hover:text-brand-700 transition-colors">
              Sign in here
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
