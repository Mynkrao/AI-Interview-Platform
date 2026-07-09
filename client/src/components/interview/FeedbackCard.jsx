// components/interview/FeedbackCard.jsx
// Renders the AI evaluation for a single question-answer pair.
// Receives all data as props — no context coupling.

function ScoreBadge({ score }) {
  const color =
    score >= 8
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : score >= 5
      ? 'bg-amber-50 text-amber-700 border-amber-200'
      : 'bg-red-50 text-red-700 border-red-200';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${color}`}>
      {score}/10
    </span>
  );
}

function StringList({ items, emptyText }) {
  if (!items || items.length === 0) {
    return <p className="text-xs text-gray-400 italic">{emptyText}</p>;
  }
  return (
    <ul className="space-y-1">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
          <span className="mt-1 w-1.5 h-1.5 rounded-full bg-current shrink-0" aria-hidden="true" />
          {item}
        </li>
      ))}
    </ul>
  );
}

function FeedbackCard({ questionNumber, question, answer, score, feedback, strengths, improvements }) {
  return (
    <article
      aria-label={`Feedback for question ${questionNumber}`}
      className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide shrink-0">
            Q{questionNumber}
          </span>
          <p className="text-sm font-medium text-gray-800 leading-snug">{question}</p>
        </div>
        <ScoreBadge score={score} />
      </div>

      <div className="px-6 py-5 space-y-5">
        {/* User answer */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
            Your Answer
          </p>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
            {answer?.trim() || <span className="italic text-gray-400">No answer provided</span>}
          </p>
        </div>

        {/* AI feedback */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
            AI Feedback
          </p>
          <p className="text-sm text-gray-700 leading-relaxed">{feedback}</p>
        </div>

        {/* Strengths / Improvements */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-3">
            <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-2">
              Strengths
            </p>
            <div className="text-emerald-800">
              <StringList items={strengths} emptyText="No strengths noted." />
            </div>
          </div>
          <div className="rounded-xl bg-amber-50 border border-amber-100 px-4 py-3">
            <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-2">
              Improvements
            </p>
            <div className="text-amber-800">
              <StringList items={improvements} emptyText="No improvements noted." />
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export default FeedbackCard;
