// pages/InterviewSessionPage.jsx
// Route: /interview/session (Protected).
// Renders the live interview: question card, answer textarea, navigation
// buttons, progress bar, and session timer.
//
// Answer persistence guarantee: every keystroke calls saveAnswer() which
// writes to context immediately — navigating away and back pre-fills the
// textarea from answers[currentQuestionIndex].
//
// Phase 2 scope only: no evaluation, no submit, no feedback.
// If the user lands here without an active session (e.g. direct URL),
// they are redirected to setup.

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useInterview from '../hooks/useInterview';
import QuestionCard  from '../components/interview/QuestionCard';
import AnswerInput   from '../components/interview/AnswerInput';
import PreviousButton from '../components/interview/PreviousButton';
import NextButton    from '../components/interview/NextButton';
import ProgressBar   from '../components/interview/ProgressBar';
import SessionTimer  from '../components/interview/SessionTimer';

function InterviewSessionPage() {
  const {
    questions,
    answers,
    currentQuestionIndex,
    interviewConfig,
    isInterviewStarted,
    saveAnswer,
  } = useInterview();

  const navigate = useNavigate();

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

          {/* Right side: Next or end-of-session hint */}
          {isLastQuestion ? (
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              Last question
            </div>
          ) : (
            <NextButton />
          )}
        </div>

        {/* Answered count indicator */}
        <p className="text-xs text-center text-gray-400 pb-4">
          {answers.filter(Boolean).length} of {questions.length} answered
        </p>
      </main>
    </div>
  );
}

export default InterviewSessionPage;
