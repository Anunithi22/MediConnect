import React, { useState } from 'react';
import { Sparkles, ShieldAlert, ArrowRight, CornerDownLeft } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

export default function AiSearchPage() {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [symptoms, setSymptoms] = useState(initialQuery);

  const samplePrompts = [
    'I have frequent throbbing headaches and sensitivity to bright light.',
    'I need a consultation for a red, itchy rash on my arms.',
    'My 5-year-old child has a recurrent high fever and cough.',
    'I have severe persistent lower back pain after lifting weights.',
    'I need a routine diabetes checkup and blood sugar monitoring.'
  ];

  return (
    <div className="py-12 md:py-20 max-w-4xl mx-auto px-4 sm:px-6">
      
      {/* Header */}
      <div className="text-center space-y-3 mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-brand-600" />
          <span>Semantic Medical Assistant</span>
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Tell us what healthcare help you are looking for
        </h1>
        <p className="text-sm text-slate-600 max-w-xl mx-auto">
          Describe your symptoms or healthcare need in natural language. We help identify potentially relevant specialties to guide your consultation.
        </p>
      </div>

      {/* Safety Notice */}
      <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-800 leading-relaxed">
          <span className="font-bold">Medical Safety Notice:</span> This AI recommendation service is intended solely to help you discover appropriate medical specialties and licensed practitioners. It does <strong>NOT</strong> provide a medical diagnosis, triage emergency symptoms, or prescribe medication.
        </p>
      </div>

      {/* Input Box */}
      <div className="p-2 sm:p-3 rounded-3xl bg-slate-200/60 backdrop-blur-md shadow-card border border-white/60 mb-6">
        <div className="bg-white rounded-[1.35rem] p-4 sm:p-6 space-y-4">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Your Healthcare Requirement / Symptoms
          </label>
          <textarea
            rows={5}
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            placeholder="Type your concern here, e.g., 'I have experienced persistent skin peeling and itchiness on my forearms for the past two weeks...'"
            className="w-full p-4 rounded-2xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 resize-none leading-relaxed"
          />
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <span className="text-[11px] text-slate-400">
              Min 5 characters. English, Tamil, or Hindi supported.
            </span>
            <button
              onClick={() => alert('AI interpretation and doctor recommendation scoring will be fully activated in Phase 12.')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs sm:text-sm shadow-md transition-all"
            >
              <span>Analyze & Match Specialty</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Example Prompts */}
      <div className="space-y-2">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Example Inquiries to Try:
        </p>
        <div className="flex flex-wrap gap-2">
          {samplePrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => setSymptoms(prompt)}
              className="text-left text-xs px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-brand-50 hover:border-brand-200 hover:text-brand-800 transition-colors shadow-xs"
            >
              "{prompt}"
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}
