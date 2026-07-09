// components/history/InterviewCard.jsx
// Mobile card for a single interview row.
// Used by InterviewHistoryTable when the viewport is narrow.

import React from 'react';
import { useNavigate } from 'react-router-dom';

function ScorePill({ score }) {
  const color =
    score >= 8
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : score >= 5
      ? 'bg-amber-50 text-amber-700 border-amber-200'
      : 'bg-red-50 text-red-700 border-red-200';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${color}`}>
      {score}/10
    </span>
  );
}

const InterviewCard = React.memo(function InterviewCard({ interview, onDelete }) {
  const navigate = useNavigate();

  const date = interview.createdAt
    ? new Date(interview.createdAt).toLocaleDateString(undefined, {
        day: '2-digit', month: 'short', year: 'numeric',
      })
    : '—';

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`View interview: ${interview.interviewType} — ${interview.domain}`}
      onClick={() => navigate(`/history/${interview._id}`)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate(`/history/${interview._id}`); }}
      className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-3 cursor-pointer hover:border-indigo-200 hover:shadow-md transition-all"
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-800 truncate">{interview.domain}</p>
          <p className="text-xs text-gray-500 mt-0.5">{interview.interviewType} · {interview.difficulty}</p>
        </div>
        <ScorePill score={interview.overallScore} />
      </div>

      {/* Meta */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
        <span>{interview.mode}</span>
        {interview.company && <span>{interview.company}</span>}
        <span>{interview.questionCount} questions</span>
        <span>{date}</span>
      </div>

      {/* Actions */}
      <div className="flex justify-end">
        <button
          id={`btn-delete-${interview._id}`}
          type="button"
          onClick={(e) => { e.stopPropagation(); onDelete(interview._id); }}
          aria-label="Delete this interview"
          className="text-xs text-red-500 hover:text-red-700 font-medium px-2 py-1 rounded-lg hover:bg-red-50 transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  );
});

export default InterviewCard;
