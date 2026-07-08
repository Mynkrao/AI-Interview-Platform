// components/interview/ProgressBar.jsx
// Displays visual progress and "Question X / Y" counter.
// Reads from InterviewContext — no local state.

import useInterview from '../../hooks/useInterview';

function ProgressBar() {
  const { currentQuestionIndex, questions } = useInterview();

  const total = questions.length;
  const current = currentQuestionIndex + 1;
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="w-full">
      {/* Label row */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-600">
          Question{' '}
          <span className="text-indigo-700 font-semibold">{current}</span>
          {' '}/ {total}
        </span>
        <span className="text-xs text-gray-400">{pct}% complete</span>
      </div>

      {/* Track */}
      <div
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={1}
        aria-valuemax={total}
        aria-label={`Question ${current} of ${total}`}
        className="w-full h-2 bg-gray-100 rounded-full overflow-hidden"
      >
        <div
          className="h-full bg-indigo-500 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default ProgressBar;
