// components/interview/NextButton.jsx
// Increments currentQuestionIndex via InterviewContext.goNext().
// Disabled when already on the last question.
// Phase 2: no submission triggered here — submit belongs to a later phase.

import useInterview from '../../hooks/useInterview';

function NextButton() {
  const { currentQuestionIndex, questions, goNext } = useInterview();

  const isLast = currentQuestionIndex === questions.length - 1;

  return (
    <button
      type="button"
      id="btn-next-question"
      onClick={goNext}
      disabled={isLast}
      aria-label="Go to next question"
      className="
        inline-flex items-center gap-2 px-5 py-2.5 rounded-xl
        bg-indigo-600 text-sm font-medium text-white
        shadow-sm transition-all duration-150
        hover:bg-indigo-700
        disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-indigo-600
        focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-1
      "
    >
      Next
      {/* Right chevron */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-4 h-4"
        aria-hidden="true"
      >
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </button>
  );
}

export default NextButton;
