import React from 'react';
import { FileText, AlertTriangle, ShieldCheck, HeartHandshake } from 'lucide-react';
import { Container, SectionHeader, Card } from '../components/ui';

export default function TermsPage() {
  return (
    <div className="py-12 md:py-20">
      <Container size="small">
        <SectionHeader
          badge="Platform Terms"
          badgeIcon={FileText}
          title="Terms of Service"
          subtitle="Please read these terms carefully before utilizing the MediConnect healthcare discovery platform."
        />

        <div className="mt-12 space-y-8 text-xs sm:text-sm text-slate-600 leading-relaxed">
          
          {/* Medical Disclaimer Banner */}
          <div className="p-6 rounded-3xl bg-amber-50 border border-amber-200/80 space-y-2 text-amber-900">
            <div className="flex items-center gap-2 font-bold text-sm">
              <AlertTriangle className="w-5 h-5 text-amber-700" />
              <span>Medical Safety & Non-Diagnostic Disclaimer</span>
            </div>
            <p className="text-xs leading-relaxed text-amber-800">
              MediConnect provides informational recommendations to assist users in discovering healthcare professionals and hospital facilities. It does <strong>NOT</strong> provide medical diagnosis, prescribe pharmaceutical medications, or design clinical treatment regimens. The final medical decision belongs solely to the patient and certified healthcare practitioners.
            </p>
          </div>

          <Card className="p-6 sm:p-8 space-y-4">
            <h3 className="font-display font-bold text-base text-slate-900">
              1. Platform Nature & Scope
            </h3>
            <p>
              MediConnect functions as an AI-assisted directory and online appointment scheduling mediator. We do not employ medical staff or operate hospitals.
            </p>
          </Card>

          <Card className="p-6 sm:p-8 space-y-4">
            <h3 className="font-display font-bold text-base text-slate-900">
              2. User Obligations & Accuracy
            </h3>
            <p>
              Users agree to provide accurate demographic information (such as age, contact phone, and consultation reasons) during booking. Misrepresentation or fraudulent bookings will result in immediate profile deactivation.
            </p>
          </Card>

          <Card className="p-6 sm:p-8 space-y-4">
            <h3 className="font-display font-bold text-base text-slate-900">
              3. Doctor Verification & Listings
            </h3>
            <p>
              Doctors registering on MediConnect are required to submit medical credentials (qualifications, council registrations, and hospital affiliations). All doctor listings undergo administrator verification prior to public discovery appearance.
            </p>
          </Card>

          <Card className="p-6 sm:p-8 space-y-4">
            <h3 className="font-display font-bold text-base text-slate-900">
              4. Emergency Services
            </h3>
            <p>
              MediConnect is NOT an emergency dispatch service. In acute life-threatening situations, severe chest pain, major trauma, or pediatric respiratory distress, immediately contact <strong>112</strong> or <strong>108</strong> or proceed to the nearest emergency hospital casualty.
            </p>
          </Card>

        </div>
      </Container>
    </div>
  );
}
