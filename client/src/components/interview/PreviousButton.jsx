// components/interview/PreviousButton.jsx
// Decrements currentQuestionIndex via InterviewContext.goPrevious().
// Disabled when already on the first question.

import useInterview from '../../hooks/useInterview';

function PreviousButton() {
  const { currentQuestionIndex, goPrevious } = useInterview();

  const isFirst = currentQuestionIndex === 0;

  return (
    <button
      type="button"
      id="btn-previous-question"
      onClick={goPrevious}
      disabled={isFirst}
      aria-label="Go to previous question"
      className="
        inline-flex items-center gap-2 px-5 py-2.5 rounded-xl
        border border-gray-200 bg-white text-sm font-medium text-gray-700
        shadow-sm transition-all duration-150
        hover:bg-gray-50 hover:border-gray-300
        disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white
        focus:outline-none focus:ring-2 focus:ring-indigo-400
      "
    >
      {/* Left chevron */}
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
        <polyline points="15 18 9 12 15 6" />
      </svg>
      Previous
    </button>
  );
}

export default PreviousButton;
