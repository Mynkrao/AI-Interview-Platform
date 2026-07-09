// pages/InterviewSessionPage.jsx
// Route: /interview/session (Protected).
// Phase 2: navigation, progress bar, timer, answer persistence.
// Phase 3: Submit Interview button on the last question — calls
// POST /api/interview/submit, stores result in context, navigates to /feedback.

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useInterview from '../hooks/useInterview';
import { submitInterview } from '../api/interviewAPI';
import QuestionCard   from '../components/interview/QuestionCard';
import AnswerInput    from '../components/interview/AnswerInput';
import PreviousButton from '../components/interview/PreviousButton';
import NextButton     from '../components/interview/NextButton';
import ProgressBar    from '../components/interview/ProgressBar';
import SessionTimer   from '../components/interview/SessionTimer';

function InterviewSessionPage() {
  const {
    questions,
    answers,
    currentQuestionIndex,
    interviewConfig,
    isInterviewStarted,
    saveAnswer,
    storeResult,
  } = useInterview();

  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError]   = useState('');

  // Guard: redirect to setup if no active session.
  useEffect(() => {
    if (!isInterviewStarted) {
      navigate('/interview/setup', { replace: true });
    }
  }, [isInterviewStarted, navigate]);

  // Don't render until session is confirmed active.
  if (!isInterviewStarted || questions.length === 0) return null;

  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswer   = answers[currentQuestionIndex] ?? '';
  const isLastQuestion  = currentQuestionIndex === questions.length - 1;

  async function handleSubmit() {
    setSubmitError('');
    setIsSubmitting(true);
    try {
      const payload = {
        type:       interviewConfig.type,
        domain:     interviewConfig.domain,
        difficulty: interviewConfig.difficulty,
        mode:       interviewConfig.mode,
        ...(interviewConfig.company ? { company: interviewConfig.company } : {}),
        qaPairs: questions.map((question, i) => ({
          question,
          answer: answers[i] ?? '',
        })),
      };
      const result = await submitInterview(payload);
      storeResult({ ...result, interviewConfig });
      navigate('/feedback');
    } catch (err) {
      const message =
        err.response?.data?.message || 'Submission failed. Please try again.';
      setSubmitError(message);
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">

      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-gray-100 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">

          {/* Session meta */}
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2 h-2 rounded-full bg-green-400 shrink-0" aria-hidden="true" />
            <span className="text-sm font-medium text-gray-700 truncate">
              {interviewConfig?.type} · {interviewConfig?.domain}
            </span>
            <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full bg-gray-100 text-xs text-gray-500 font-medium capitalize">
              {interviewConfig?.difficulty}
            </span>
          </div>

          {/* Timer (visible only in Timed mode) */}
          <SessionTimer />
        </div>
      </header>

      {/* ── Main content ────────────────────────────────────────────────── */}
      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">

        {/* Progress */}
        <ProgressBar />

        {/* Question */}
        <QuestionCard
          question={currentQuestion}
          questionNumber={currentQuestionIndex + 1}
          totalQuestions={questions.length}
        />

        {/* Answer */}
        <AnswerInput
          value={currentAnswer}
          onChange={(text) => saveAnswer(currentQuestionIndex, text)}
          questionIndex={currentQuestionIndex}
        />

        {/* Navigation */}
        <div className="flex items-center justify-between pt-2">
          <PreviousButton />

          {isLastQuestion ? (
            <button
              id="btn-submit-interview"
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              aria-label="Submit interview for evaluation"
              className="
                inline-flex items-center gap-2 px-5 py-2.5 rounded-xl
                bg-emerald-600 text-sm font-semibold text-white
                shadow-sm transition-all duration-150
                hover:bg-emerald-700
                disabled:opacity-60 disabled:cursor-not-allowed
                focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-1
              "
            >
              {isSubmitting ? (
                <>
                  <svg className="w-4 h-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                  </svg>
                  Evaluating…
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden="true">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  Submit Interview
                </>
              )}
            </button>
          ) : (
            <NextButton />
          )}
        </div>

        {/* Submit error */}
        {submitError && (
          <div role="alert" className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-red-500 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <p className="text-sm text-red-700">{submitError}</p>
          </div>
        )}

        {/* Answered count indicator */}
        <p className="text-xs text-center text-gray-400 pb-4">
          {answers.filter(Boolean).length} of {questions.length} answered
        </p>
      </main>
    </div>
  );
}

export default InterviewSessionPage;
