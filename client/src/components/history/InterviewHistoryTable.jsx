// components/history/InterviewHistoryTable.jsx
// Renders interview history as a responsive table (md+) or card stack (sm).
// Manages the DeleteDialog overlay state internally.
// All data/filter state lives in HistoryPage; this component is presentational
// except for the delete flow.

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import InterviewCard from './InterviewCard';
import DeleteDialog  from './DeleteDialog';

// ─── Score badge ──────────────────────────────────────────────────────────────
function ScoreBadge({ score }) {
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

// ─── Toast notification ───────────────────────────────────────────────────────
function Toast({ message, onDone }) {
  React.useEffect(() => {
    const t = setTimeout(onDone, 2800);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-900 text-white text-sm shadow-lg animate-fade-in"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-emerald-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
      {message}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
const InterviewHistoryTable = React.memo(function InterviewHistoryTable({
  interviews,
  onInterviewDeleted,
}) {
  const navigate = useNavigate();
  const [deleteTarget, setDeleteTarget] = useState(null); // sessionId to confirm
  const [toast,        setToast]        = useState('');

  function handleDeleteRequest(id) {
    setDeleteTarget(id);
  }

  function handleDeleted(id) {
    setDeleteTarget(null);
    setToast('Interview deleted successfully');
    onInterviewDeleted(id);
  }

  if (!interviews || interviews.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-sm text-gray-400">No interviews match your filters.</p>
      </div>
    );
  }

  const formatDate = (iso) =>
    iso
      ? new Date(iso).toLocaleDateString(undefined, {
          day: '2-digit', month: 'short', year: 'numeric',
        })
      : '—';

  return (
    <>
      {/* ── Mobile card list ─── */}
      <div className="md:hidden space-y-3">
        {interviews.map((iv) => (
          <InterviewCard
            key={iv._id}
            interview={iv}
            onDelete={handleDeleteRequest}
          />
        ))}
      </div>

      {/* ── Desktop table ──── */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-gray-100 shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
            <tr>
              <th className="px-4 py-3 font-semibold">Date</th>
              <th className="px-4 py-3 font-semibold">Type</th>
              <th className="px-4 py-3 font-semibold">Domain</th>
              <th className="px-4 py-3 font-semibold">Difficulty</th>
              <th className="px-4 py-3 font-semibold">Mode</th>
              <th className="px-4 py-3 font-semibold">Company</th>
              <th className="px-4 py-3 font-semibold">Score</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold sr-only">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-50">
            {interviews.map((iv) => (
              <tr
                key={iv._id}
                onClick={() => navigate(`/history/${iv._id}`)}
                className="hover:bg-indigo-50/40 cursor-pointer transition-colors"
                aria-label={`View ${iv.interviewType} interview for ${iv.domain}`}
              >
                <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                  {formatDate(iv.createdAt)}
                </td>
                <td className="px-4 py-3 text-gray-700 font-medium">{iv.interviewType}</td>
                <td className="px-4 py-3 text-gray-800 font-medium max-w-[160px] truncate">
                  {iv.domain}
                </td>
                <td className="px-4 py-3 text-gray-600">{iv.difficulty}</td>
                <td className="px-4 py-3 text-gray-600">{iv.mode}</td>
                <td className="px-4 py-3 text-gray-500">{iv.company || '—'}</td>
                <td className="px-4 py-3">
                  <ScoreBadge score={iv.overallScore} />
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 capitalize">
                    {iv.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    id={`btn-delete-${iv._id}`}
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleDeleteRequest(iv._id); }}
                    aria-label={`Delete interview: ${iv.domain}`}
                    className="text-xs text-red-500 hover:text-red-700 font-medium px-2 py-1 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Delete confirmation dialog */}
      {deleteTarget && (
        <DeleteDialog
          sessionId={deleteTarget}
          onDeleted={handleDeleted}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {/* Success toast */}
      {toast && (
        <Toast message={toast} onDone={() => setToast('')} />
      )}
    </>
  );
});

export default InterviewHistoryTable;
