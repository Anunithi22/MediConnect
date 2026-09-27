import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Search, 
  Building2, 
  MapPin, 
  Navigation, 
  Calendar, 
  Star, 
  ShieldCheck, 
  ArrowRight, 
  Clock, 
  Users, 
  Activity, 
  HeartHandshake,
  CheckCircle2,
  Stethoscope,
  HeartPulse,
  Scale,
  Globe2,
  AlertTriangle,
  Info
} from 'lucide-react';

import {
  Container,
  SectionHeader,
  Button,
  Card,
  Badge,
  Modal,
  DoctorCard,
  HospitalCard
} from '../components/ui';

export default function LandingPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  // Search UI State
  const [searchConcern, setSearchConcern] = useState('');
  const [searchSpecialty, setSearchSpecialty] = useState('All Specialties');
  const [searchLocation, setSearchLocation] = useState('');
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState({ title: '', body: '' });

  // AI Assistant Interactive Demo State
  const [activePromptIndex, setActivePromptIndex] = useState(0);

  const sampleAiPrompts = [
    {
      userQuery: "I need a doctor for skin-related problems and persistent itching.",
      assistantReply: "Based on your description, Dermatology may be a relevant specialty to consider.",
      matchedSpecialty: "Dermatology",
      urgency: "Routine Outpatient",
      recommendedHospitals: ["Apollo Speciality Hospitals (3.2 km)", "MIOT International (5.1 km)"],
      leadDoctor: {
        name: "Dr. Priya Ramaswamy",
        specialty: "Dermatology",
        exp: 10,
        rating: 4.8,
        matchScore: "94% Match"
      }
    },
    {
      userQuery: "I am experiencing frequent throbbing headaches and light sensitivity.",
      assistantReply: "Based on your description, Neurology may be a relevant specialty to evaluate migraines.",
      matchedSpecialty: "Neurology",
      urgency: "Specialist Consultation",
      recommendedHospitals: ["Kauvery Hospital (2.8 km)", "Gleneagles Health City (6.4 km)"],
      leadDoctor: {
        name: "Dr. Deepa Natarajan",
        specialty: "Neurology",
        exp: 11,
        rating: 4.9,
        matchScore: "96% Match"
      }
    },
    {
      userQuery: "My 4-year-old child has had high fever and persistent chest cough for 2 days.",
      assistantReply: "Based on your description, Pediatrics is the primary specialty for infant and child respiratory care.",
      matchedSpecialty: "Pediatrics",
      urgency: "Prompt Evaluation",
      recommendedHospitals: ["Fortis Malar Hospital (3.5 km)", "Apollo Children's Clinic (4.1 km)"],
      leadDoctor: {
        name: "Dr. Meera Nambiar",
        specialty: "Pediatrics",
        exp: 9,
        rating: 4.8,
        matchScore: "95% Match"
      }
    }
  ];

  const currentAiDemo = sampleAiPrompts[activePromptIndex];

  // Demo Doctor cards for Section 18
  const demoDoctors = [
    {
      name: 'Dr. Arun Kumar',
      specialization: 'Cardiology',
      qualification: 'MBBS, MD, DM (Cardiology), FACC',
      experience: 14,
      rating: 4.9,
      reviewCount: 124,
      hospital: 'Apollo Speciality Hospitals, Greams Rd',
      distance: '3.2 km away',
      nextAvailable: 'Available Tomorrow',
      consultationFee: 800,
      image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300',
    },
    {
      name: 'Dr. Priya Ramaswamy',
      specialization: 'Dermatology',
      qualification: 'MBBS, MD (DVL)',
      experience: 10,
      rating: 4.8,
      reviewCount: 98,
      hospital: 'Kauvery Hospital, Mylapore',
      distance: '4.5 km away',
      nextAvailable: 'Available Today, 4:00 PM',
      consultationFee: 700,
      image: 'https://images.unsplash.com/photo-1594824813511-1335cb9f2a0b?auto=format&fit=crop&q=80&w=300',
    },
    {
      name: 'Dr. Rajesh Sundaram',
      specialization: 'Orthopedics',
      qualification: 'MBBS, MS (Ortho), MCh (Joint Repl)',
      experience: 16,
      rating: 4.9,
      reviewCount: 180,
      hospital: 'MIOT International, Manapakkam',
      distance: '5.8 km away',
      nextAvailable: 'Available Wed, 10:30 AM',
      consultationFee: 900,
      image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=300',
    }
  ];

  // Demo Hospital cards for Section 19
  const demoHospitals = [
    {
      name: 'Apollo Speciality Hospitals',
      rating: 4.8,
      address: 'Greams Road, Thousand Lights, Chennai',
      distance: '3.2 km away',
      specialties: ['Cardiology', 'Oncology', 'Neurology', 'Orthopedics'],
      facilities: ['24/7 Emergency', 'Cardiology Lab', 'ICU', 'MRI / CT Scan'],
      image: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&q=80&w=600',
      doctorCount: 48,
      emergencyService: true,
    },
    {
      name: 'MIOT International',
      rating: 4.7,
      address: 'Mount Poonamallee Road, Manapakkam, Chennai',
      distance: '5.1 km away',
      specialties: ['Orthopedics', 'Trauma Resuscitation', 'Robotic Surgery'],
      facilities: ['Level 1 Trauma', 'Robotic OT', 'Blood Bank', 'Pharmacy'],
      image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=600',
      doctorCount: 36,
      emergencyService: true,
    },
    {
      name: 'Kauvery Hospital',
      rating: 4.7,
      address: 'Luz Church Road, Mylapore, Chennai',
      distance: '2.8 km away',
      specialties: ['Geriatrics', 'Neurology', 'Internal Medicine'],
      facilities: ['Geriatric Wing', 'Neuro ICU', 'Ambulance 24x7'],
      image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=600',
      doctorCount: 32,
      emergencyService: true,
    }
  ];

  // Handlers for search preview
  const handleSearchPreviewSubmit = (e) => {
    e.preventDefault();
    setModalMessage({
      title: 'Search Interface Preview',
      body: `You queried: "${searchConcern || 'All specialists'}" in ${searchSpecialty} around ${searchLocation || 'your location'}.\n\nIn Phase 4, this is a visual UI preview. Live database queries, Haversine geo-distance filtering, and instant slot reservations will be fully connected in Phase 6 (Doctor Discovery) and Phase 7 (Hospital Search).`
    });
    setPreviewModalOpen(true);
  };

  const handleDemoCardClick = (itemTitle) => {
    setModalMessage({
      title: `${itemTitle} — Profile Preview`,
      body: `You selected ${itemTitle}. In Phase 4, this demonstrates our reusable card architecture with fictional preview data.\n\nFull doctor profiles, verified hospital departments, real-time schedule calendars, and appointment booking will be activated in Phases 6 through 10.`
    });
    setPreviewModalOpen(true);
  };

  return (
    <div className="relative overflow-hidden">
      
      {/* Informational Preview Modal */}
      <Modal
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        title={modalMessage.title}
      >
        <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
          <p className="whitespace-pre-line">{modalMessage.body}</p>
          <div className="pt-2 flex justify-end">
            <Button size="sm" variant="dark" onClick={() => setPreviewModalOpen(false)}>
              Got it
            </Button>
          </div>
        </div>
      </Modal>

      {/* Background Soft Mesh Ambient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[700px] pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-32 left-1/4 w-96 h-96 rounded-full bg-brand-200/40 blur-3xl" />
        <div className="absolute top-20 right-1/4 w-[28rem] h-[28rem] rounded-full bg-teal-100/50 blur-3xl" />
      </div>

      {/* ============================================================ */}
      {/* 1. HERO SECTION (Sections 10 & 11) */}
      {/* ============================================================ */}
      <section className="pt-10 pb-20 md:pt-16 md:pb-28">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Hero Narrative */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200/80 text-brand-800 text-xs font-semibold tracking-wide shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-brand-600 animate-pulse" />
                <span>AI-Assisted Healthcare Discovery</span>
              </div>

              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
                Find the Right Care, <br className="hidden sm:inline" />
                <span className="text-brand-600">Closer to You.</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal max-w-xl mx-auto lg:mx-0">
                Discover suitable doctors and hospitals based on your healthcare needs, location, patient reviews, experience, and availability.
              </p>

              {/* Hero CTAs */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
                <Link to="/find-doctor">
                  <Button size="lg" variant="primary" trailingIcon={ArrowRight} nestedTrailing={true}>
                    Find a Doctor
                  </Button>
                </Link>

                <Link to="/find-hospital">
                  <Button size="lg" variant="outline" icon={Building2}>
                    Find a Hospital
                  </Button>
                </Link>

                <Link to="/patient/ai-search">
                  <Button size="lg" variant="secondary" icon={Sparkles}>
                    Try AI Health Search
                  </Button>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-500 font-medium">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Licensed Healthcare Providers</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Transparent Proximity Matching</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>No Double-Booking Guarantee</span>
                </div>
              </div>

            </div>

            {/* Right Hero Visual Card Mockup (Section 11) */}
            <div className="lg:col-span-5 relative">
              <div className="p-2 sm:p-2.5 rounded-3xl bg-slate-200/60 backdrop-blur-md shadow-elevated border border-white/60">
                <div className="bg-white rounded-[1.35rem] p-6 shadow-xs border border-slate-100 space-y-4">
                  
                  {/* Visual Header */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-rose-500 animate-pulse" />
                      <span className="text-xs font-bold text-slate-800">Live Care Discovery</span>
                    </div>
                    <Badge variant="teal" size="sm" dot={true}>
                      Haversine Active
                    </Badge>
                  </div>

                  {/* Sample Matched Doctor Snippet */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-brand-700">
                        Top Recommended Match (94%)
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">3.2 km away</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <img
                        src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=140"
                        alt="Doctor preview"
                        className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                      />
                      <div className="min-w-0 flex-1">
                        <h4 className="font-display font-bold text-sm text-slate-900 truncate">
                          Dr. Arun Kumar
                        </h4>
                        <p className="text-xs text-slate-500">Cardiology • 14 yrs exp</p>
                      </div>
                      <div className="text-right">
                        <span className="flex items-center gap-1 font-bold text-xs text-amber-600">
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                          4.9
                        </span>
                        <span className="text-[10px] text-emerald-600 font-semibold block">
                          Tomorrow
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Sample Hospital Proximity Card */}
                  <div className="p-3 rounded-2xl bg-teal-50/50 border border-teal-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <Building2 className="w-4 h-4 text-brand-600" />
                      <div>
                        <span className="font-bold text-slate-800 block">Apollo Speciality</span>
                        <span className="text-[11px] text-slate-500">24/7 Emergency ICU</span>
                      </div>
                    </div>
                    <Badge variant="blue" size="sm">
                      3.2 km
                    </Badge>
                  </div>

                  {/* Sample Appointment Lock Card */}
                  <div className="p-3 rounded-2xl bg-slate-900 text-white flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-brand-400" />
                      <div>
                        <span className="font-bold block">Online Booking Ready</span>
                        <span className="text-[11px] text-slate-400">Zero double-booking guarantee</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-brand-500 text-white text-[10px] font-bold">
                      Direct Slot
                    </span>
                  </div>

                </div>
              </div>
            </div>

          </div>

          {/* ============================================================ */}
          {/* 2. HERO SEARCH PREVIEW (Section 12) */}
          {/* ============================================================ */}
          <div className="mt-14 max-w-4xl mx-auto">
            <div className="p-2 sm:p-2.5 rounded-3xl bg-slate-200/60 backdrop-blur-md shadow-card border border-white/60">
              <form
                onSubmit={handleSearchPreviewSubmit}
                className="bg-white rounded-[1.35rem] p-4 sm:p-6 shadow-xs border border-slate-100"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  
                  {/* Healthcare Concern input */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      What healthcare help are you looking for?
                    </label>
                    <div className="relative">
                      <Stethoscope className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={searchConcern}
                        onChange={(e) => setSearchConcern(e.target.value)}
                        placeholder="e.g. skin rash, chest palpitations..."
                        className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                      />
                    </div>
                  </div>

                  {/* Specialization select */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Specialization
                    </label>
                    <div className="relative">
                      <Activity className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <select
                        value={searchSpecialty}
                        onChange={(e) => setSearchSpecialty(e.target.value)}
                        className="w-full pl-10 pr-8 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 appearance-none cursor-pointer"
                      >
                        <option value="All Specialties">All Specialties</option>
                        <option value="General Medicine">General Medicine</option>
                        <option value="Cardiology">Cardiology</option>
                        <option value="Dermatology">Dermatology</option>
                        <option value="Pediatrics">Pediatrics</option>
                        <option value="Orthopedics">Orthopedics</option>
                        <option value="Neurology">Neurology</option>
                      </select>
                      <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                        ▼
                      </div>
                    </div>
                  </div>

                  {/* Location input */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Location
                      </label>
                      <span className="text-[10px] font-semibold text-brand-600 flex items-center gap-0.5">
                        <Navigation className="w-2.5 h-2.5" />
                        <span>GPS Ready</span>
                      </span>
                    </div>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={searchLocation}
                        onChange={(e) => setSearchLocation(e.target.value)}
                        placeholder="e.g. Chennai, Madurai, PIN code"
                        className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                      />
                    </div>
                  </div>

                </div>

                {/* Submit Row with Preview Badge */}
                <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Badge variant="teal" size="sm">
                      UI Preview
                    </Badge>
                    <span>Phase 4 Search Component Preview. Live API hooks in Phase 6 & 7.</span>
                  </div>

                  <Button type="submit" variant="dark" size="md" icon={Search}>
                    Search Providers
                  </Button>
                </div>
              </form>
            </div>
          </div>

        </Container>
      </section>

      {/* ============================================================ */}
      {/* 3. TRUST SECTION (Section 13) */}
      {/* ============================================================ */}
      <section className="py-20 bg-slate-100/70 border-y border-slate-200/80">
        <Container>
          <SectionHeader
            badge="Healthcare Discovery Made Simple"
            badgeIcon={HeartHandshake}
            title="Transparent, Data-Driven Healthcare Navigation"
            subtitle="MediConnect eliminates medical guesswork by analyzing five core pillars to assist your consultation choices."
          />

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            {[
              {
                title: 'Specialty Matching',
                desc: 'Maps everyday symptoms to accredited clinical disciplines.',
                icon: Stethoscope,
              },
              {
                title: 'Location & Distance',
                desc: 'Exact Haversine calculation to discover closest clinics.',
                icon: MapPin,
              },
              {
                title: 'Verified Reviews',
                desc: 'Unbiased reviews restricted to completed consultations.',
                icon: Star,
              },
              {
                title: 'Doctor Availability',
                desc: 'Real-time schedule visibility without surprise cancellations.',
                icon: Calendar,
              },
              {
                title: 'Online Booking',
                desc: 'Immediate booking confirmation with zero double-booking.',
                icon: CheckCircle2,
              },
            ].map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2 text-center"
                >
                  <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="font-display font-bold text-sm text-slate-900">
                    {pillar.title}
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      {/* ============================================================ */}
      {/* 4. FEATURES SECTION (Section 14) */}
      {/* ============================================================ */}
      <section className="py-24">
        <Container>
          <SectionHeader
            badge="Core Platform Features"
            badgeIcon={Sparkles}
            title="Engineered for Patients and Healthcare Providers"
            subtitle="Explore the capabilities designed to make finding, comparing, and scheduling medical visits seamless."
          />

          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: 'AI-Assisted Recommendations',
                desc: 'Find potentially relevant specialties and healthcare providers based on the information you provide.',
                icon: Sparkles,
                badge: 'Phase 12',
                color: 'teal',
              },
              {
                title: 'Nearby Hospitals',
                desc: 'Discover certified hospitals and healthcare institutions based on your selected location coordinates.',
                icon: Building2,
                badge: 'Phase 7 & 8',
                color: 'blue',
              },
              {
                title: 'Doctor Availability',
                desc: 'View real-time doctor working days, daily consultation hours, and open 30-minute appointment slots.',
                icon: Clock,
                badge: 'Phase 9',
                color: 'emerald',
              },
              {
                title: 'Online Appointment Booking',
                desc: 'Book appointments conveniently online with immediate booking ID confirmation and schedule tracking.',
                icon: Calendar,
                badge: 'Phase 10',
                color: 'purple',
              },
              {
                title: 'Patient Reviews',
                desc: 'Compare authentic patient ratings and verified reviews left following completed clinical visits.',
                icon: Star,
                badge: 'Phase 11',
                color: 'amber',
              },
              {
                title: 'Multilingual Support',
                desc: 'Use MediConnect natively in English, தமிழ் (Tamil), and हिन्दी (Hindi) with high-contrast accessibility.',
                icon: Globe2,
                badge: 'Phase 15',
                color: 'rose',
              },
            ].map((f, idx) => {
              const Icon = f.icon;
              return (
                <Card key={idx} className="p-6 sm:p-7 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center">
                      <Icon className="w-6 h-6" />
                    </div>
                    <Badge variant={f.color} size="sm">
                      {f.badge}
                    </Badge>
                  </div>
                  <h3 className="font-display font-bold text-lg text-slate-900 pt-1">
                    {f.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {f.desc}
                  </p>
                </Card>
              );
            })}
          </div>
        </Container>
      </section>

      {/* ============================================================ */}
      {/* 5. HOW IT WORKS SECTION (Section 15) */}
      {/* ============================================================ */}
      <section className="py-20 bg-slate-900 text-white">
        <Container>
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
            <span className="px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-[10px] font-bold uppercase tracking-widest border border-brand-500/30">
              Step-by-Step Patient Flow
            </span>
            <h2 className="font-display text-2xl sm:text-4xl font-extrabold tracking-tight">
              How It Works
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Four visual steps connecting your healthcare concern to a confirmed consultation slot.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            {[
              {
                num: '01',
                title: 'Tell Us Your Need',
                desc: 'Describe the healthcare service or concern you are looking for in everyday words.',
              },
              {
                num: '02',
                title: 'Discover Suitable Options',
                desc: 'MediConnect helps identify relevant specialties, certified hospitals, and doctors.',
              },
              {
                num: '03',
                title: 'Compare Factors',
                desc: 'Compare location, proximity, ratings, clinical experience, and live available dates.',
              },
              {
                num: '04',
                title: 'Book Appointment',
                desc: 'Choose an open time slot, confirm details, and receive an instant booking voucher.',
              },
            ].map((step, idx) => (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-slate-800/80 border border-slate-700/80 space-y-3 relative shadow-card"
              >
                <div className="w-10 h-10 rounded-2xl bg-brand-500 text-white font-display font-extrabold flex items-center justify-center text-sm shadow-md">
                  {step.num}
                </div>
                <h4 className="font-display font-bold text-base text-white">
                  {step.title}
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ============================================================ */}
      {/* 6. AI ASSISTANT PREVIEW (Section 16) */}
      {/* ============================================================ */}
      <section className="py-24 bg-slate-50 border-b border-slate-200/80">
        <Container>
          <SectionHeader
            badge="Interactive Assistant Preview"
            badgeIcon={Sparkles}
            title="Meet the MediConnect AI Assistant"
            subtitle="Describe the healthcare help you are looking for and MediConnect can assist you in finding potentially relevant specialties and healthcare providers."
          />

          {/* Interactive AI Preview Container */}
          <div className="mt-12 max-w-4xl mx-auto">
            <Card doubleBezel={true}>
              <div className="space-y-6">
                
                {/* Sample Prompt Selector Buttons */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Select an inquiry scenario to preview:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {sampleAiPrompts.map((scenario, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActivePromptIndex(idx)}
                        className={`text-xs px-3 py-1.5 rounded-xl font-semibold transition-all ${
                          activePromptIndex === idx
                            ? 'bg-slate-900 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        Scenario {idx + 1}: {scenario.matchedSpecialty}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Simulated Conversation Feed */}
                <div className="space-y-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                  
                  {/* User Question Bubble */}
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs text-slate-700 shrink-0">
                      User
                    </div>
                    <div className="p-3.5 rounded-2xl bg-white border border-slate-200 text-xs sm:text-sm text-slate-800 shadow-2xs max-w-xl">
                      "{currentAiDemo.userQuery}"
                    </div>
                  </div>

                  {/* AI Response Bubble */}
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white shrink-0">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div className="space-y-3 p-4 rounded-2xl bg-brand-50/80 border border-brand-200/80 text-xs sm:text-sm text-slate-800 shadow-2xs max-w-xl">
                      <p className="font-medium text-brand-950">
                        {currentAiDemo.assistantReply}
                      </p>

                      <div className="p-3 rounded-xl bg-white border border-brand-200 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">
                            Potentially Relevant Specialty:
                          </span>
                          <Badge variant="teal" size="sm">
                            {currentAiDemo.matchedSpecialty}
                          </Badge>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          <strong>Nearby facilities providing care:</strong>{' '}
                          {currentAiDemo.recommendedHospitals.join(' • ')}
                        </div>
                      </div>

                      {/* Medical Disclaimer Banner */}
                      <p className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200/60">
                        <strong>Medical Notice:</strong> This feature provides informational assistance to discover healthcare professionals and is not a medical diagnosis.
                      </p>
                    </div>
                  </div>

                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-[11px] text-slate-400">
                    Phase 4 UI Preview • AI Engine is fully activated in Phase 12
                  </span>
                  <Link to="/patient/ai-search">
                    <Button size="sm" variant="primary" trailingIcon={ArrowRight}>
                      Open AI Search Page
                    </Button>
                  </Link>
                </div>

              </div>
            </Card>
          </div>
        </Container>
      </section>

      {/* ============================================================ */}
      {/* 7. NEARBY DISCOVERY PREVIEW (Section 17) */}
      {/* ============================================================ */}
      <section className="py-20">
        <Container>
          <SectionHeader
            badge="Geographic Discovery Preview"
            badgeIcon={MapPin}
            title="Find Care Near You"
            subtitle="Calculate precise distances to accredited hospitals and certified specialty centers using high-accuracy coordinates."
          />

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              {
                name: 'Apollo Speciality Hospitals',
                city: 'Thousand Lights, Chennai',
                distance: '3.2 km away',
                emergency: true,
                rating: 4.8,
              },
              {
                name: 'Kauvery Hospital',
                city: 'Mylapore, Chennai',
                distance: '5.1 km away',
                emergency: true,
                rating: 4.7,
              },
              {
                name: 'MIOT International',
                city: 'Manapakkam, Chennai',
                distance: '7.4 km away',
                emergency: true,
                rating: 4.7,
              },
            ].map((hosp, idx) => (
              <Card
                key={idx}
                className="p-6 text-center space-y-3"
                onClick={() => handleDemoCardClick(hosp.name)}
              >
                <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-base text-slate-900">
                    {hosp.name}
                  </h4>
                  <p className="text-xs text-slate-500">{hosp.city}</p>
                </div>
                <div className="pt-1 flex items-center justify-center gap-2">
                  <Badge variant="blue" size="md">
                    {hosp.distance}
                  </Badge>
                  <span className="text-xs font-bold text-amber-600 flex items-center gap-0.5">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    {hosp.rating}
                  </span>
                </div>
                <div className="pt-2">
                  <Button size="sm" variant="outline" className="w-full">
                    View Details
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          <div className="mt-6 text-center">
            <span className="text-[11px] text-slate-400">
              * Fictional demo values. Live browser Geolocation and Haversine sorting connect in Phase 8.
            </span>
          </div>
        </Container>
      </section>

      {/* ============================================================ */}
      {/* 8. DOCTOR CARD PREVIEW (Section 18) */}
      {/* ============================================================ */}
      <section className="py-20 bg-slate-100/60 border-t border-slate-200/80">
        <Container>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-12">
            <SectionHeader
              badge="Specialist Preview"
              badgeIcon={Stethoscope}
              title="Featured Doctors & Specialists"
              subtitle="Preview certified healthcare professionals with verified clinical credentials."
              centered={false}
            />
            <Link to="/find-doctor">
              <Button size="sm" variant="dark" trailingIcon={ArrowRight}>
                View All Doctors
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {demoDoctors.map((doc, idx) => (
              <DoctorCard
                key={idx}
                {...doc}
                isDemo={true}
                onViewProfile={() => handleDemoCardClick(doc.name)}
              />
            ))}
          </div>
        </Container>
      </section>

      {/* ============================================================ */}
      {/* 9. HOSPITAL CARD PREVIEW (Section 19) */}
      {/* ============================================================ */}
      <section className="py-20">
        <Container>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-12">
            <SectionHeader
              badge="Institutions Preview"
              badgeIcon={Building2}
              title="Partner Hospitals & Medical Centers"
              subtitle="Compare facilities, emergency readiness, and specialized departments."
              centered={false}
            />
            <Link to="/find-hospital">
              <Button size="sm" variant="dark" trailingIcon={ArrowRight}>
                View All Hospitals
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {demoHospitals.map((hosp, idx) => (
              <HospitalCard
                key={idx}
                {...hosp}
                isDemo={true}
                onViewHospital={() => handleDemoCardClick(hosp.name)}
                onFindDoctors={() => handleDemoCardClick(`${hosp.name} Specialists`)}
              />
            ))}
          </div>
        </Container>
      </section>

      {/* ============================================================ */}
      {/* 10. SAFETY / TRUST SECTION (Section 20) */}
      {/* ============================================================ */}
      <section className="py-16 bg-amber-50/60 border-y border-amber-200/80">
        <Container size="small">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>

            <h3 className="font-display font-bold text-2xl text-slate-900">
              Your Health Decisions Matter
            </h3>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xl mx-auto">
              MediConnect is designed to help you discover and compare healthcare providers. Recommendations are informational and do not replace professional medical advice.
            </p>

            <div className="p-4 rounded-2xl bg-white border border-amber-200 text-amber-900 max-w-lg mx-auto text-xs leading-relaxed space-y-1">
              <strong className="block text-amber-800">Emergency Protocol:</strong>
              If you are experiencing a medical emergency or severe symptoms, contact local emergency services (<strong>112 / 108</strong>) or visit the nearest emergency department immediately.
            </div>
          </div>
        </Container>
      </section>

      {/* ============================================================ */}
      {/* 11. LANGUAGE SECTION (Section 21) */}
      {/* ============================================================ */}
      <section className="py-20">
        <Container size="small">
          <Card doubleBezel={true} className="text-center">
            <div className="p-6 sm:p-10 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
                <Globe2 className="w-6 h-6" />
              </div>

              <h3 className="font-display font-bold text-2xl text-slate-900">
                Healthcare in Your Language
              </h3>

              <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
                MediConnect supports English, தமிழ் (Tamil), and हिन्दी (Hindi) with regional fonts and high-contrast accessibility.
              </p>

              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => i18n.changeLanguage('en')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                    i18n.language === 'en'
                      ? 'bg-brand-600 text-white border-brand-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => i18n.changeLanguage('ta')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                    i18n.language === 'ta'
                      ? 'bg-brand-600 text-white border-brand-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  தமிழ் (Tamil)
                </button>
                <button
                  type="button"
                  onClick={() => i18n.changeLanguage('hi')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                    i18n.language === 'hi'
                      ? 'bg-brand-600 text-white border-brand-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  हिन्दी (Hindi)
                </button>
              </div>
            </div>
          </Card>
        </Container>
      </section>

    </div>
  );
}
