import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare, AlertCircle, CheckCircle } from 'lucide-react';
import { Container, SectionHeader, Card, Input, Textarea, Button, Badge } from '../components/ui';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;
    setSubmitted(true);
  };

  return (
    <div className="py-12 md:py-20">
      <Container>
        <SectionHeader
          badge="Support & Outreach"
          badgeIcon={MessageSquare}
          title="Get in Touch with MediConnect"
          subtitle="Have questions about the platform, hospital onboarding, or technical assistance? We're here to help."
        />

        <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Contact Details Card */}
          <div className="space-y-6">
            <Card className="p-6 space-y-6">
              <h3 className="font-display font-bold text-lg text-slate-900">
                Contact Information
              </h3>

              <div className="space-y-4 text-xs text-slate-600">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-brand-50 text-brand-700 shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 block">Email Support</span>
                    <span className="text-slate-500">support@mediconnect.local</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-brand-50 text-brand-700 shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 block">Helpline (General)</span>
                    <span className="text-slate-500">+91 44 2800 1100 (Mon–Sat, 9AM–6PM)</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-brand-50 text-brand-700 shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 block">Development Headquarters</span>
                    <span className="text-slate-500">MediConnect Technologies, Chennai, Tamil Nadu, India</span>
                  </div>
                </div>
              </div>

              {/* Emergency Hotline Alert */}
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider block text-rose-700">
                  Critical Emergency Notice
                </span>
                <p className="text-xs leading-relaxed">
                  For immediate medical life emergencies, call <strong>112</strong> or <strong>108</strong> directly. Do not wait for an email reply.
                </p>
              </div>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card doubleBezel={true}>
              {submitted ? (
                <div className="p-8 text-center space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-xs">
                    <CheckCircle className="w-7 h-7" />
                  </div>
                  <h3 className="font-display font-bold text-xl text-slate-900">
                    Message Received
                  </h3>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 max-w-md mx-auto space-y-1">
                    <p className="font-semibold text-slate-800">
                      Phase 4 Notice: Contact form is currently in UI Preview.
                    </p>
                    <p>
                      Automated email notification pipelines and ticketing dispatch will be connected in Phase 16.
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setSubmitted(false)}>
                    Send Another Inquiry
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Your Name"
                      required
                      placeholder="e.g. Ramesh Kumar"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                    <Input
                      label="Email Address"
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <Input
                    label="Subject"
                    required
                    placeholder="e.g. Hospital listing inquiry / Technical question"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />

                  <Textarea
                    label="Message"
                    required
                    rows={5}
                    placeholder="Please describe how we can assist you..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />

                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <span>
                      MediConnect does not provide clinical diagnosis or treatment guidance via support channels.
                    </span>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    trailingIcon={Send}
                    className="w-full sm:w-auto"
                  >
                    Submit Inquiry
                  </Button>
                </form>
              )}
            </Card>
          </div>

        </div>
      </Container>
    </div>
  );
}
