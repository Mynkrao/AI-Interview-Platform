// components/interview/SessionTimer.jsx
// Displays a live countdown timer driven by InterviewContext.timeRemaining.
// Timer state is managed entirely in InterviewContext — this component only
// renders it. No auto-submit, no backend calls, no evaluation logic.

import useInterview from '../../hooks/useInterview';

function padTwo(n) {
  return String(n).padStart(2, '0');
}

function formatTime(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) {
    return `${padTwo(h)}:${padTwo(m)}:${padTwo(s)}`;
  }
  return `${padTwo(m)}:${padTwo(s)}`;
}

function SessionTimer() {
  const { timeRemaining, interviewConfig } = useInterview();

  // Only render in Timed mode; in Practice mode there is no countdown.
  if (interviewConfig?.mode !== 'Timed') return null;

  const isLow = timeRemaining <= 60 && timeRemaining > 0;
  const isExpired = timeRemaining === 0;

  return (
    <div
      role="timer"
      aria-live="polite"
      aria-label={`Time remaining: ${formatTime(timeRemaining)}`}
      className={`
        inline-flex items-center gap-2 px-4 py-2 rounded-full font-mono text-sm font-semibold
        transition-colors duration-300
        ${isExpired
          ? 'bg-gray-100 text-gray-400 border border-gray-200'
          : isLow
          ? 'bg-red-50 text-red-600 border border-red-200 animate-pulse'
          : 'bg-indigo-50 text-indigo-700 border border-indigo-200'}
      `}
    >
      {/* Clock icon */}
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
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
      <span>{isExpired ? 'Time up' : formatTime(timeRemaining)}</span>
    </div>
  );
}

export default SessionTimer;
