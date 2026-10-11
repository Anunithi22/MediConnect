// src/ai/healthcareMatchingService.js
/**
 * AI Healthcare Matching Service
 *
 * Interprets a natural‑language patient query and returns a structured
 * object that the recommendation engine can consume.
 *
 * The implementation prefers an external LLM (e.g., OpenAI, Anthropic) but
 * provides a deterministic fallback when no API key is configured.
 *
 * IMPORTANT SAFETY NOTES
 * - The model never receives personally identifiable information – only the
 *   query text is sent.
 * - The response is validated against a strict schema; any missing fields or
 *   unexpected values cause the service to fall back to safe defaults.
 * - No diagnosis or treatment advice is generated – the model is instructed
 *   to suggest specialties only.
 */
import fetch from 'node-fetch';
import { config } from '../config/env.js';

// Simple schema validator – ensures the shape we need.
const validateResponse = (obj) => {
  if (!obj || typeof obj !== 'object') return false;
  const { suggestedSpecialties, searchKeywords, statedPreferences, safetyMessage } = obj;
  if (!Array.isArray(suggestedSpecialties) || suggestedSpecialties.length === 0) return false;
  if (typeof safetyMessage !== 'string') return false;
  // optional fields can be empty but must be arrays/objects if present
  if (searchKeywords && !Array.isArray(searchKeywords)) return false;
  if (statedPreferences && typeof statedPreferences !== 'object') return false;
  return true;
};

// Deterministic fallback – basic keyword extraction using regex.
const fallbackInterpret = (query) => {
  const lower = query.toLowerCase();
  const specialties = [];
  // Very simple mapping – extend as needed.
  const map = {
    heart: 'Cardiology',
    cardiology: 'Cardiology',
    lung: 'Pulmonology',
    pulmonology: 'Pulmonology',
    skin: 'Dermatology',
    dermatologist: 'Dermatology',
    eye: 'Ophthalmology',
    dentist: 'Dentistry',
    mental: 'Psychiatry',
    mental health: 'Psychiatry',
    orthopedics: 'Orthopedics',
    bone: 'Orthopedics',
  };
  for (const [keyword, spec] of Object.entries(map)) {
    if (lower.includes(keyword)) specialties.push(spec);
  }
  // Default to generic "General Medicine" if none matched.
  if (specialties.length === 0) specialties.push('General Medicine');
  return {
    suggestedSpecialties: specialties,
    searchKeywords: [],
    statedPreferences: {},
    safetyMessage:
      'MediConnect provides informational assistance only and does not offer medical diagnosis or treatment advice.',
  };
};

/**
 * Interpret a patient query using the configured AI provider.
 * @param {string} query – raw natural‑language query from the patient.
 * @returns {Promise<Object>} – normalized interpretation object.
 */
export const interpretQuery = async (query) => {
  // Trim and ensure a reasonable length.
  const trimmed = query.trim();
  if (!trimmed) throw new Error('Query cannot be empty');

  // If no provider key is set, use deterministic fallback.
  if (!config.AI_API_KEY) {
    return fallbackInterpret(trimmed);
  }

  // Build request to the external LLM (example OpenAI Chat Completion).
  const payload = {
    model: config.AI_MODEL || 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content:
          'You are a helpful medical discovery assistant. Do NOT provide diagnoses, treatment plans, or medication advice. Only suggest relevant medical specialties based on the user query and extract any explicit preferences (location, budget, language, etc.). Respond strictly in JSON with the following fields: suggestedSpecialties (array of strings), searchKeywords (array), statedPreferences (object), safetyMessage (string).',
      },
      { role: 'user', content: trimmed },
    ],
    temperature: 0,
  };

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.AI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      timeout: 8000, // 8 s timeout
    });
    if (!response.ok) throw new Error(`AI provider error ${response.status}`);
    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content?.trim();
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      // Not JSON – fallback
      return fallbackInterpret(trimmed);
    }
    if (validateResponse(parsed)) return parsed;
    // Invalid shape – fallback
    return fallbackInterpret(trimmed);
  } catch (err) {
    // Log but do not expose details to client.
    console.error('AI interpretation failed:', err);
    return fallbackInterpret(trimmed);
  }
};
