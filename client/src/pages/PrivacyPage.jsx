import React from 'react';
import { ShieldCheck, Lock, Eye, Database, Globe } from 'lucide-react';
import { Container, SectionHeader, Card } from '../components/ui';

export default function PrivacyPage() {
  return (
    <div className="py-12 md:py-20">
      <Container size="small">
        <SectionHeader
          badge="Data Governance"
          badgeIcon={ShieldCheck}
          title="Privacy Policy"
          subtitle="How MediConnect responsibly handles your user profile, appointment preferences, and geolocation data."
        />

        <div className="mt-12 space-y-8 text-xs sm:text-sm text-slate-600 leading-relaxed">
          
          <Card className="p-6 sm:p-8 space-y-4">
            <h3 className="font-display font-bold text-base text-slate-900 flex items-center gap-2">
              <Lock className="w-4 h-4 text-brand-600" />
              <span>1. Information We Collect</span>
            </h3>
            <p>
              MediConnect collects only information necessary to deliver doctor and hospital recommendation services and facilitate appointment booking:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-slate-600">
              <li>
                <strong>Account Data:</strong> Full name, verified email address, mobile number, demographic age, gender, and preferred interface language (English, தமிழ், हिन्दी).
              </li>
              <li>
                <strong>Doctor Profile Information:</strong> Medical qualifications, verified specialties, clinic/hospital affiliations, years of clinical experience, and consultation fees.
              </li>
              <li>
                <strong>Appointment Data:</strong> Selected consultation dates, slot times, and reasons for consultation.
              </li>
              <li>
                <strong>Location Data:</strong> Geolocation coordinates or manual location input are used exclusively for calculating Haversine distances to nearby hospitals. Location access is always optional and never forced.
              </li>
              <li>
                <strong>Patient Reviews:</strong> Voluntary ratings and written feedback submitted after an appointment is marked completed.
              </li>
            </ul>
          </Card>

          <Card className="p-6 sm:p-8 space-y-4">
            <h3 className="font-display font-bold text-base text-slate-900 flex items-center gap-2">
              <Eye className="w-4 h-4 text-brand-600" />
              <span>2. How Your Information Is Used</span>
            </h3>
            <p>
              Information is used strictly to power our transparent recommendation scoring engine (matching specialties, computing proximity, verifying doctor availability) and generating booking receipts. We do not sell or monetize personal health inquiries.
            </p>
          </Card>

          <Card className="p-6 sm:p-8 space-y-4">
            <h3 className="font-display font-bold text-base text-slate-900 flex items-center gap-2">
              <Database className="w-4 h-4 text-brand-600" />
              <span>3. Data Storage & Security</span>
            </h3>
            <p>
              All passwords are encrypted using one-way bcrypt hashing with salt. API transmissions are guarded with JSON Web Tokens (JWT), Helmet security headers, CORS boundaries, and rate-limiting middleware.
            </p>
          </Card>

          <Card className="p-6 sm:p-8 space-y-4">
            <h3 className="font-display font-bold text-base text-slate-900 flex items-center gap-2">
              <Globe className="w-4 h-4 text-brand-600" />
              <span>4. Non-Diagnostic Confidentiality</span>
            </h3>
            <p>
              Inquiries typed into the AI Assistant are used solely to map symptom keywords to relevant medical specialties (e.g. skin irritation → Dermatology). They do not constitute an Electronic Health Record (EHR) and are never used to render medical diagnoses.
            </p>
          </Card>

        </div>
      </Container>
    </div>
  );
}
