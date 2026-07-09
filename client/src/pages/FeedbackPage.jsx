// pages/FeedbackPage.jsx
// Route: /feedback (Protected).
// SRS FR-03-09: displays the session feedback after a successful submit.
// Reads sessionResult from InterviewContext (populated by InterviewSessionPage
// after POST /api/interview/submit resolves). Redirects to /interview/setup
// if there is no session result (e.g. direct URL access).

import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useInterview from '../hooks/useInterview';
import FeedbackCard   from '../components/interview/FeedbackCard';
import SessionSummary from '../components/interview/SessionSummary';

// --- Score ring component (inline — single use, not extracted) ---
function ScoreRing({ score }) {
  // score is 0-10; map to 0-100 for the SVG stroke offset calculation.
  const pct       = Math.round((score / 10) * 100);
  const radius    = 42;
  const circ      = 2 * Math.PI * radius;
  const offset    = circ - (pct / 100) * circ;

  const ringColor =
    score >= 8 ? '#10b981' : score >= 5 ? '#f59e0b' : '#ef4444';

  return (
    <div className="relative inline-flex items-center justify-center" aria-hidden="true">
      <svg width="112" height="112" className="-rotate-90">
        {/* Track */}
        <circle cx="56" cy="56" r={radius} fill="none" stroke="#f1f5f9" strokeWidth="10" />
        {/* Progress */}
        <circle
          cx="56" cy="56" r={radius}
          fill="none"
          stroke={ringColor}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
      </svg>
      {/* Label */}
      <span
        className="absolute text-2xl font-bold text-gray-900"
        style={{ color: ringColor }}
      >
        {score}
      </span>
    </div>
  );
}

function FeedbackPage() {
  const { sessionResult, resetSession } = useInterview();
  const navigate = useNavigate();

  // Guard: no session result means the user arrived via direct URL.
  useEffect(() => {
    if (!sessionResult) {
      navigate('/interview/setup', { replace: true });
    }
  }, [sessionResult, navigate]);

  if (!sessionResult) return null;

  const {
    overallScore,
    sessionSummary,
    qaPairs,
    interviewConfig,
  } = sessionResult;

  function handleNewInterview() {
    resetSession();
    navigate('/interview/setup');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 pb-16">

      {/* ── Header bar ────────────────────────────────────────────────── */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-100 px-4 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
              Interview Complete
            </span>
            <p className="text-sm font-medium text-gray-700 mt-0.5">
              {interviewConfig?.type} · {interviewConfig?.domain}
              {interviewConfig?.company ? ` · ${interviewConfig.company}` : ''}
            </p>
          </div>
          <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full bg-gray-100 text-xs text-gray-500 font-medium">
            {interviewConfig?.difficulty} · {interviewConfig?.mode}
          </span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-8">

        {/* ── Overall score hero ────────────────────────────────────── */}
        <section
          aria-label="Overall score"
          className="bg-white border border-gray-100 rounded-2xl shadow-sm px-6 py-8 flex flex-col sm:flex-row items-center gap-6"
        >
          <ScoreRing score={overallScore} />
          <div className="text-center sm:text-left">
            <h1 className="text-2xl font-bold text-gray-900">
              Overall Score:{' '}
              <span
                className={
                  overallScore >= 8
                    ? 'text-emerald-600'
                    : overallScore >= 5
                    ? 'text-amber-600'
                    : 'text-red-600'
                }
              >
                {overallScore} / 10
              </span>
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {qaPairs?.length ?? 0} question{qaPairs?.length !== 1 ? 's' : ''} evaluated
            </p>
            <div className="mt-4 flex flex-wrap gap-3 justify-center sm:justify-start">
              <button
                id="btn-new-interview"
                type="button"
                onClick={handleNewInterview}
                className="
                  inline-flex items-center gap-2 px-4 py-2 rounded-xl
                  bg-indigo-600 text-sm font-semibold text-white
                  hover:bg-indigo-700 transition-colors
                  focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-1
                "
              >
                New Interview
              </button>
              <Link
                to="/dashboard"
                id="link-back-dashboard"
                className="
                  inline-flex items-center gap-2 px-4 py-2 rounded-xl
                  border border-gray-200 text-sm font-medium text-gray-700
                  bg-white hover:bg-gray-50 transition-colors
                  focus:outline-none focus:ring-2 focus:ring-gray-300
                "
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </section>

        {/* ── Session summary ───────────────────────────────────────── */}
        {sessionSummary && (
          <SessionSummary
            summary={sessionSummary.summary}
            overallStrengths={sessionSummary.overallStrengths}
            overallWeaknesses={sessionSummary.overallWeaknesses}
            recommendation={sessionSummary.recommendation}
          />
        )}

        {/* ── Per-question feedback ─────────────────────────────────── */}
        {qaPairs && qaPairs.length > 0 && (
          <section aria-label="Per-question feedback">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
              Question-by-Question Breakdown
            </h2>
            <div className="space-y-4">
              {qaPairs.map((pair, i) => (
                <FeedbackCard
                  key={i}
                  questionNumber={i + 1}
                  question={pair.question}
                  answer={pair.answer}
                  score={pair.score}
                  feedback={pair.feedback}
                  strengths={pair.strengths}
                  improvements={pair.improvements}
                />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default FeedbackPage;
