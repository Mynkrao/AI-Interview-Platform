// components/interview/SessionSummary.jsx
// Renders the overall session summary block: narrative text, overall
// strengths, overall weaknesses, and a single recommendation.
// Receives all data as props — no context coupling.

function TagList({ items, colorClass }) {
  if (!items || items.length === 0) return null;
  return (
    <ul className="flex flex-wrap gap-2 mt-2">
      {items.map((item, i) => (
        <li
          key={i}
          className={`px-3 py-1 rounded-full text-xs font-medium border ${colorClass}`}
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

function SessionSummary({ summary, overallStrengths, overallWeaknesses, recommendation }) {
  return (
    <section
      aria-label="Session summary"
      className="bg-white border border-gray-100 rounded-2xl shadow-sm px-6 py-6 space-y-5"
    >
      <h2 className="text-base font-semibold text-gray-900">Session Summary</h2>

      {/* Narrative */}
      {summary && (
        <p className="text-sm text-gray-700 leading-relaxed">{summary}</p>
      )}

      {/* Overall Strengths */}
      {overallStrengths?.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">
            Overall Strengths
          </p>
          <TagList
            items={overallStrengths}
            colorClass="bg-emerald-50 border-emerald-200 text-emerald-800"
          />
        </div>
      )}

      {/* Overall Weaknesses */}
      {overallWeaknesses?.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide">
            Areas to Improve
          </p>
          <TagList
            items={overallWeaknesses}
            colorClass="bg-amber-50 border-amber-200 text-amber-800"
          />
        </div>
      )}

      {/* Recommendation */}
      {recommendation && (
        <div className="flex items-start gap-3 rounded-xl bg-indigo-50 border border-indigo-100 px-4 py-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p className="text-sm text-indigo-800 font-medium">{recommendation}</p>
        </div>
      )}
    </section>
  );
}

export default SessionSummary;
