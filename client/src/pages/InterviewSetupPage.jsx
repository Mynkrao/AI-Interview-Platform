// pages/InterviewSetupPage.jsx
// Route: /interview/setup (Protected).
// SRS FR-03-01 → FR-03-03: lets the user configure an interview session
// (type, domain, difficulty, count, mode, optional company), calls
// POST /api/interview/generate, then navigates to /interview/session.
//
// Phase 2 scope: question generation only. Evaluation, feedback, and
// submission belong to later phases.

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as interviewAPI from '../api/interviewAPI';
import useInterview from '../hooks/useInterview';

// ─── Static option sets (mirror interviewValidator.js) ───────────────────────
const INTERVIEW_TYPES = ['Technical', 'HR', 'Behavioral', 'Mixed'];
const DIFFICULTIES    = ['Beginner', 'Intermediate', 'Advanced'];
const MODES           = ['Practice', 'Timed'];
const COUNTS          = [5, 10, 15];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function validate(form) {
  const errors = {};
  if (!form.type)       errors.type       = 'Select an interview type';
  if (!form.domain.trim()) errors.domain  = 'Domain / role is required';
  if (!form.difficulty) errors.difficulty = 'Select a difficulty level';
  if (!form.count)      errors.count      = 'Select number of questions';
  if (!form.mode)       errors.mode       = 'Select interview mode';
  return errors;
}

// ─── Small sub-components ────────────────────────────────────────────────────
function FieldError({ message }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-red-600">{message}</p>;
}

function SectionLabel({ htmlFor, children }) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700 mb-1.5">
      {children}
    </label>
  );
}

// Option-pill group used for type, difficulty, mode, count.
function PillGroup({ id, options, value, onChange, error }) {
  return (
    <div id={id} role="group" className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const selected = String(value) === String(opt);
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            aria-pressed={selected}
            className={`
              px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-150
              focus:outline-none focus:ring-2 focus:ring-indigo-400
              ${selected
                ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                : 'bg-white border-gray-200 text-gray-600 hover:border-indigo-300 hover:text-indigo-600'}
            `}
          >
            {opt}
          </button>
        );
      })}
      {error && <FieldError message={error} />}
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────
function InterviewSetupPage() {
  const [form, setForm] = useState({
    type: '',
    domain: '',
    difficulty: '',
    count: '',
    mode: '',
    company: '',
  });
  const [fieldErrors, setFieldErrors]   = useState({});
  const [serverError, setServerError]   = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const { startSession } = useInterview();
  const navigate          = useNavigate();

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
    // Clear the field error as soon as the user provides a value.
    if (fieldErrors[key]) {
      setFieldErrors((prev) => ({ ...prev, [key]: '' }));
    }
  }

  async function handleGenerate(e) {
    e.preventDefault();
    setServerError('');

    const errors = validate(form);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsGenerating(true);
    try {
      const config = {
        type:       form.type,
        domain:     form.domain.trim(),
        difficulty: form.difficulty,
        count:      Number(form.count),
        mode:       form.mode,
        ...(form.company.trim() ? { company: form.company.trim() } : {}),
      };

      const questions = await interviewAPI.generateInterview(config);
      startSession(questions, config);
      navigate('/interview/session');
    } catch (err) {
      const message =
        err.response?.data?.message ||
        'Failed to generate questions. Please try again.';
      setServerError(message);
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" aria-hidden="true" />
            New Interview
          </span>
          <h1 className="text-3xl font-bold text-gray-900">Set Up Your Interview</h1>
          <p className="mt-1 text-gray-500 text-sm">
            Configure the session and let AI generate tailored questions for you.
          </p>
        </div>

        {/* Form card */}
        <form
          onSubmit={handleGenerate}
          noValidate
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8 space-y-7"
        >

          {/* Server error */}
          {serverError && (
            <div role="alert" className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-red-500 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <p className="text-sm text-red-700">{serverError}</p>
            </div>
          )}

          {/* Interview Type */}
          <div>
            <SectionLabel htmlFor="group-type">Interview Type</SectionLabel>
            <PillGroup
              id="group-type"
              options={INTERVIEW_TYPES}
              value={form.type}
              onChange={(v) => setField('type', v)}
              error={fieldErrors.type}
            />
          </div>

          {/* Domain */}
          <div>
            <SectionLabel htmlFor="domain">Domain / Role</SectionLabel>
            <input
              id="domain"
              type="text"
              value={form.domain}
              onChange={(e) => setField('domain', e.target.value)}
              placeholder="e.g. Frontend Development, System Design, Product Management"
              className="
                w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800
                focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent
                placeholder:text-gray-400 hover:border-gray-300 transition-shadow
              "
            />
            <FieldError message={fieldErrors.domain} />
          </div>

          {/* Difficulty */}
          <div>
            <SectionLabel htmlFor="group-difficulty">Difficulty</SectionLabel>
            <PillGroup
              id="group-difficulty"
              options={DIFFICULTIES}
              value={form.difficulty}
              onChange={(v) => setField('difficulty', v)}
              error={fieldErrors.difficulty}
            />
          </div>

          {/* Number of Questions */}
          <div>
            <SectionLabel htmlFor="group-count">Number of Questions</SectionLabel>
            <PillGroup
              id="group-count"
              options={COUNTS}
              value={form.count}
              onChange={(v) => setField('count', v)}
              error={fieldErrors.count}
            />
          </div>

          {/* Mode */}
          <div>
            <SectionLabel htmlFor="group-mode">Mode</SectionLabel>
            <PillGroup
              id="group-mode"
              options={MODES}
              value={form.mode}
              onChange={(v) => setField('mode', v)}
              error={fieldErrors.mode}
            />
            {form.mode === 'Timed' && (
              <p className="mt-2 text-xs text-indigo-600 font-medium">
                Timed mode: {form.count ? `${form.count} min total (1 min per question)` : 'countdown begins once the session starts'}
              </p>
            )}
          </div>

          {/* Company (optional) */}
          <div>
            <SectionLabel htmlFor="company">
              Target Company{' '}
              <span className="text-gray-400 font-normal">(optional)</span>
            </SectionLabel>
            <input
              id="company"
              type="text"
              value={form.company}
              onChange={(e) => setField('company', e.target.value)}
              placeholder="e.g. Google, Amazon, Startup"
              className="
                w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800
                focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent
                placeholder:text-gray-400 hover:border-gray-300 transition-shadow
              "
            />
          </div>

          {/* Submit */}
          <button
            id="btn-generate-interview"
            type="submit"
            disabled={isGenerating}
            className="
              w-full flex items-center justify-center gap-2 py-3 rounded-xl
              bg-indigo-600 text-white text-sm font-semibold
              shadow-md shadow-indigo-100 transition-all duration-150
              hover:bg-indigo-700
              disabled:opacity-60 disabled:cursor-not-allowed
              focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2
            "
          >
            {isGenerating ? (
              <>
                <svg className="w-4 h-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                </svg>
                Generating Questions…
              </>
            ) : (
              <>
                Generate Interview
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden="true">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default InterviewSetupPage;
