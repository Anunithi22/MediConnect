import React from 'react';
import { 
  HeartHandshake, 
  ShieldCheck, 
  Target, 
  Users, 
  MapPin, 
  Sparkles, 
  CalendarCheck, 
  Globe2, 
  CheckCircle2 
} from 'lucide-react';
import { Container, SectionHeader, Card, Badge } from '../components/ui';

export default function AboutPage() {
  const pillars = [
    {
      title: 'Ethical Non-Diagnostic AI',
      desc: 'Our AI model analyzes symptom semantics purely to recommend relevant medical disciplines (e.g. skin rash → Dermatology). We categorically prohibit algorithmic medical diagnosis and drug prescription.',
      icon: ShieldCheck,
      badge: 'Safety First',
      color: 'teal',
    },
    {
      title: 'Geographic Distance Precision',
      desc: 'Using high-precision mathematical Haversine calculations, patients determine the closest licensed health institutions without relying on vague travel estimates.',
      icon: MapPin,
      badge: 'Proximity',
      color: 'blue',
    },
    {
      title: 'Double-Booking Prevention',
      desc: 'Our real-time backend calendar lock validates doctor slots at the database transaction layer, eliminating double-booked appointments and extended waiting room queues.',
      icon: CalendarCheck,
      badge: 'Efficiency',
      color: 'emerald',
    },
    {
      title: 'Rural & Elderly Inclusivity',
      desc: 'Engineered with large touch targets, high contrast visual hierarchy, and full native support in English, தமிழ் (Tamil), and हिन्दी (Hindi) for rural patients unfamiliar with medical jargon.',
      icon: Globe2,
      badge: 'Accessibility',
      color: 'purple',
    },
  ];

  return (
    <div className="py-12 md:py-20">
      <Container>
        {/* Header */}
        <SectionHeader
          badge="Our Mission"
          badgeIcon={HeartHandshake}
          title="Bridging Patients with the Right Healthcare"
          subtitle="MediConnect was engineered to solve one practical question: 'Which specialist should I consult, which nearby hospital offers that care, and how can I book an appointment online?'"
        />

        {/* Problem & Solution Grid */}
        <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="p-6 sm:p-8 space-y-4 border-rose-100 bg-rose-50/20">
            <Badge variant="rose" size="sm">
              The Healthcare Challenge
            </Badge>
            <h3 className="font-display font-bold text-xl text-slate-900">
              Why Patients Struggle to Find Care
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Patients frequently suffer from symptoms without knowing which medical specialty is appropriate. Rural and elderly users often travel long distances only to discover a hospital lacks the required department, or that the specialist is on leave.
            </p>
            <ul className="space-y-2 text-xs text-slate-600 pt-2">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                <span>Uncertainty regarding medical specialties vs general practice</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                <span>Lack of transparent doctor schedules and availability</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                <span>Language barriers preventing digital healthcare adoption</span>
              </li>
            </ul>
          </Card>

          <Card className="p-6 sm:p-8 space-y-4 border-teal-100 bg-teal-50/20">
            <Badge variant="teal" size="sm">
              The MediConnect Solution
            </Badge>
            <h3 className="font-display font-bold text-xl text-slate-900">
              Assisted Discovery + Direct Scheduling
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              MediConnect bridges this gap by interpreting patient inquiries in everyday language, mapping them to accredited medical specialties, finding nearby hospitals, ranking suitable doctors based on experience and reviews, and securing online slots.
            </p>
            <ul className="space-y-2 text-xs text-slate-600 pt-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-600" />
                <span>AI-assisted specialty suggestions with full medical safety safeguards</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-600" />
                <span>Exact distance calculations based on user coordinates</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-600" />
                <span>Multilingual interfaces tailored for regional and rural users</span>
              </li>
            </ul>
          </Card>
        </div>

        {/* 4 Architectural Pillars */}
        <div className="mt-20">
          <SectionHeader
            badge="Architecture Principles"
            badgeIcon={Target}
            title="Core Platform Tenets"
            subtitle="Built from the ground up for safety, speed, and absolute clinical transparency."
          />

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
            {pillars.map((p, idx) => {
              const Icon = p.icon;
              return (
                <Card key={idx} className="p-6 sm:p-8 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center">
                      <Icon className="w-6 h-6" />
                    </div>
                    <Badge variant={p.color} size="sm">
                      {p.badge}
                    </Badge>
                  </div>
                  <h4 className="font-display font-bold text-lg text-slate-900 pt-1">
                    {p.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {p.desc}
                  </p>
                </Card>
              );
            })}
          </div>
        </div>

      </Container>
    </div>
  );
}
