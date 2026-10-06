import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { AuthProvider, useAuth } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';

// Public Pages
import LandingPage from './pages/LandingPage';
import HowItWorksPage from './pages/HowItWorksPage';
import AboutPage from './pages/AboutPage';
import FindDoctorPage from './pages/FindDoctorPage';
import DoctorProfilePage from './pages/DoctorProfilePage';
import FindHospitalPage from './pages/FindHospitalPage';
import HospitalProfilePage from './pages/HospitalProfilePage';
import ComparisonPage from './pages/ComparisonPage';
import AiSearchPage from './pages/AiSearchPage';
import ContactPage from './pages/ContactPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import NotFoundPage from './pages/NotFoundPage';

// Authentication Pages
import LoginPage from './pages/auth/Login';
import RegisterPage from './pages/auth/Register';

// Protected Dashboards & Layouts
import PatientLayout from './layouts/PatientLayout';
import PatientDashboard from './pages/patient/PatientDashboard';
import PatientProfile from './pages/patient/PatientProfile';
import PatientAppointments from './pages/patient/PatientAppointments';
import PatientAppointmentDetails from './pages/patient/PatientAppointmentDetails';
import PatientSavedDoctors from './pages/patient/PatientSavedDoctors';
import PatientSavedHospitals from './pages/patient/PatientSavedHospitals';
import PatientSearchHistory from './pages/patient/PatientSearchHistory';
import PatientNotifications from './pages/patient/PatientNotifications';
import PatientReviews from './pages/patient/PatientReviews';
import PatientSettings from './pages/patient/PatientSettings';
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';

// Route Guards
import ProtectedRoute from './routes/ProtectedRoute';
import RoleProtectedRoute from './routes/RoleProtectedRoute';

// Public Auth Route Guard (Redirects already authenticated users to their dashboard)
function PublicAuthRoute({ children }) {
  const { isAuthenticated, currentUser, loading } = useAuth();

  if (loading) {
    return null; // Wait for initial session verification
  }

  if (isAuthenticated && currentUser) {
    if (currentUser.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (currentUser.role === 'doctor') return <Navigate to="/doctor/dashboard" replace />;
    return <Navigate to="/patient/dashboard" replace />;
  }

  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#0F172A',
            color: '#F8FAFC',
            borderRadius: '1rem',
            fontSize: '13px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          },
        }}
      />
      <Routes>
        {/* Main Public Layout Routes */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/find-doctor" element={<FindDoctorPage />} />
          <Route path="/doctor/:id" element={<DoctorProfilePage />} />
          <Route path="/find-hospital" element={<FindHospitalPage />} />
          <Route path="/hospital/:id" element={<HospitalProfilePage />} />
          <Route path="/compare" element={<ComparisonPage />} />
          <Route path="/patient/ai-search" element={<AiSearchPage />} />

          {/* Auth Routes with redirection if already logged in */}
          <Route
            path="/login"
            element={
              <PublicAuthRoute>
                <LoginPage />
              </PublicAuthRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicAuthRoute>
                <RegisterPage />
              </PublicAuthRoute>
            }
          />

          {/* Protected Doctor Routes */}
          <Route element={<RoleProtectedRoute allowedRoles={['doctor']} />}>
            <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
          </Route>

          {/* Protected Admin Routes */}
          <Route element={<RoleProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Route>

          {/* 404 Fallback */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        {/* Dedicated Protected Patient Portal with PatientLayout */}
        <Route element={<RoleProtectedRoute allowedRoles={['patient']} />}>
          <Route element={<PatientLayout />}>
            <Route path="/patient" element={<Navigate to="/patient/dashboard" replace />} />
            <Route path="/patient/dashboard" element={<PatientDashboard />} />
            <Route path="/patient/profile" element={<PatientProfile />} />
            <Route path="/patient/appointments" element={<PatientAppointments />} />
            <Route path="/patient/appointments/:id" element={<PatientAppointmentDetails />} />
            <Route path="/patient/saved-doctors" element={<PatientSavedDoctors />} />
            <Route path="/patient/saved-hospitals" element={<PatientSavedHospitals />} />
            <Route path="/patient/search-history" element={<PatientSearchHistory />} />
            <Route path="/patient/notifications" element={<PatientNotifications />} />
            <Route path="/patient/reviews" element={<PatientReviews />} />
            <Route path="/patient/settings" element={<PatientSettings />} />
          </Route>
        </Route>
      </Routes>
    </AuthProvider>
  );
}
