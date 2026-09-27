import React from 'react';
import { 
  HelpCircle, 
  MessageSquare, 
  Sparkles, 
  Building2, 
  Users, 
  Scale, 
  Calendar, 
  CheckCircle, 
  HeartHandshake, 
  Star,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Container, SectionHeader, Card, Badge, Button } from '../components/ui';

export default function HowItWorksPage() {
  const steps = [
    {
      num: '01',
      title: 'Enter Healthcare Requirement',
      desc: 'Type your symptoms or care requirement in natural language (English, Tamil, or Hindi) without needing clinical terminology.',
      phase: 'Phase 5 & 10',
      icon: MessageSquare,
      color: 'teal',
    },
    {
      num: '02',
      title: 'AI Specialty Matching',
      desc: 'Our semantic AI matches your concerns to licensed medical disciplines (e.g. skin irritation → Dermatology) while observing strict non-diagnostic safety boundaries.',
      phase: 'Phase 12 (AI Engine)',
      icon: Sparkles,
      color: 'blue',
    },
    {
      num: '03',
      title: 'Discover Nearby Hospitals',
      desc: 'Haversine distance calculation identifies hospitals and certified medical centers providing that exact specialty near your coordinates.',
      phase: 'Phase 7 & 8',
      icon: Building2,
      color: 'emerald',
    },
    {
      num: '04',
      title: 'Find Suitable Doctors',
      desc: 'Review certified practitioners matching your requirements, including qualifications, clinical experience, and consultation fees.',
      phase: 'Phase 6',
      icon: Users,
      color: 'purple',
    },
    {
      num: '05',
      title: 'Compare Options & Scores',
      desc: 'Compare doctors and hospitals side-by-side using transparent recommendation factors: specialty match, proximity, reviews, and clinical experience.',
      phase: 'Phase 12',
      icon: Scale,
      color: 'amber',
    },
    {
      num: '06',
      title: 'Check Live Availability',
      desc: 'View the doctor’s verified calendar schedule with real-time open consultation slots, break times, and holiday dates.',
      phase: 'Phase 9',
      icon: Calendar,
      color: 'teal',
    },
    {
      num: '07',
      title: 'Book Appointment Online',
      desc: 'Select an available 30-minute slot, enter consultation details, and receive immediate booking confirmation with double-booking prevention.',
      phase: 'Phase 10',
      icon: CheckCircle,
      color: 'blue',
    },
    {
      num: '08',
      title: 'Attend Consultation',
      desc: 'Visit the hospital facility at the confirmed time. Doctors view basic appointment context to prepare your consultation.',
      phase: 'Phase 10 & 13',
      icon: HeartHandshake,
      color: 'emerald',
    },
    {
      num: '09',
      title: 'Submit Verified Review',
      desc: 'After your appointment is marked completed, submit verified feedback and ratings to help future patients make informed choices.',
      phase: 'Phase 11',
      icon: Star,
      color: 'amber',
    },
  ];

  return (
    <div className="py-12 md:py-20">
      <Container>
        <SectionHeader
          badge="Complete Healthcare Journey"
          badgeIcon={HelpCircle}
          title="How MediConnect Works"
          subtitle="A transparent, step-by-step roadmap from healthcare inquiry to post-consultation patient review."
        />

        {/* 9-Step Roadmap Grid */}
        <div className="mt-16 space-y-6 max-w-4xl mx-auto">
          {steps.map((s) => {
            const Icon = s.icon;
            return (
              <Card key={s.num} className="p-6 sm:p-7">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-700 shrink-0 font-display font-extrabold text-xl shadow-xs">
                    {s.num}
                  </div>

                  <div className="flex-1 space-y-1.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-brand-600" />
                        <h3 className="font-display font-bold text-base sm:text-lg text-slate-900">
                          {s.title}
                        </h3>
                      </div>
                      <Badge variant={s.color} size="sm">
                        {s.phase}
                      </Badge>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {s.desc}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Safety Callout */}
        <div className="mt-16 max-w-4xl mx-auto rounded-3xl bg-amber-50 border border-amber-200/80 p-6 sm:p-8 space-y-2 text-amber-900">
          <div className="flex items-center gap-2 font-bold text-sm">
            <ShieldCheck className="w-5 h-5 text-amber-700" />
            <span>Non-Diagnostic Clinical Guarantee</span>
          </div>
          <p className="text-xs text-amber-800 leading-relaxed">
            MediConnect is designed purely as an informational healthcare discovery and appointment scheduling platform. It does not replace professional medical diagnosis, laboratory testing, or physician consultation.
          </p>
        </div>

        <div className="mt-12 text-center">
          <Link to="/register">
            <Button size="lg" trailingIcon={ArrowRight} nestedTrailing={true}>
              Create Patient Account
            </Button>
          </Link>
        </div>

      </Container>
    </div>
  );
}
