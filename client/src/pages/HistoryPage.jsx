// pages/HistoryPage.jsx
// Route: /history (Protected).
// Module 5: Server-side paginated interview history with search, filter, sort.
// No third-party toast library — toast is implemented inline in InterviewHistoryTable.

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { getInterviewHistory } from '../api/interviewAPI';
import InterviewHistoryTable from '../components/history/InterviewHistoryTable';

// ─── Constants ────────────────────────────────────────────────────────────────
const SORT_OPTIONS = [
  { value: 'latest',        label: 'Newest First' },
  { value: 'oldest',        label: 'Oldest First' },
  { value: 'highest-score', label: 'Highest Score' },
  { value: 'lowest-score',  label: 'Lowest Score' },
];
const PAGE_SIZE = 10;

// ─── Pagination controls ──────────────────────────────────────────────────────
function Pagination({ pagination, onPage }) {
  if (!pagination || pagination.totalPages <= 1) return null;
  const { page, totalPages, hasNext, hasPrev, total } = pagination;

  return (
    <div className="flex items-center justify-between mt-4 flex-wrap gap-2">
      <p className="text-xs text-gray-400">
        Page {page} of {totalPages} ({total} total)
      </p>
      <div className="flex gap-2">
        <button
          id="btn-prev-page"
          type="button"
          onClick={() => onPage(page - 1)}
          disabled={!hasPrev}
          className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
        >
          ← Prev
        </button>
        <button
          id="btn-next-page"
          type="button"
          onClick={() => onPage(page + 1)}
          disabled={!hasNext}
          className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
        >
          Next →
        </button>
      </div>
    </div>
  );
}

// ─── HistoryPage ──────────────────────────────────────────────────────────────
function HistoryPage() {
  const [interviews,  setInterviews]  = useState([]);
  const [pagination,  setPagination]  = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');

  // Filter state
  const [search,     setSearch]     = useState('');
  const [type,       setType]       = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [mode,       setMode]       = useState('');
  const [sort,       setSort]       = useState('latest');
  const [page,       setPage]       = useState(1);

  const searchTimer = useRef(null);

  const fetchHistory = useCallback(async (params) => {
    setLoading(true);
    setError('');
    try {
      // Strip empty strings so they don't become query params.
      const clean = Object.fromEntries(
        Object.entries(params).filter(([, v]) => v !== '' && v !== undefined)
      );
      const data = await getInterviewHistory(clean);
      setInterviews(data.interviews || []);
      setPagination(data.pagination  || null);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load history. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Re-fetch when page or non-search filters change.
  useEffect(() => {
    fetchHistory({ page, limit: PAGE_SIZE, search, type, difficulty, mode, sort });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, type, difficulty, mode, sort]);

  // Debounce search: wait 400 ms after typing stops, then reset to page 1.
  function handleSearchChange(val) {
    setSearch(val);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setPage(1);
      fetchHistory({ page: 1, limit: PAGE_SIZE, search: val, type, difficulty, mode, sort });
    }, 400);
  }

  // Reset to page 1 when any drop-down filter changes.
  function handleFilterChange(setter) {
    return (e) => {
      setter(e.target.value);
      setPage(1);
    };
  }

  // Called by InterviewHistoryTable after a successful deletion — removes the
  // row optimistically so a full refetch isn't needed.
  function handleInterviewDeleted(deletedId) {
    setInterviews((prev) => prev.filter((iv) => iv._id !== deletedId));
    setPagination((prev) =>
      prev ? { ...prev, total: Math.max(0, prev.total - 1) } : prev
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            to="/dashboard"
            id="link-back-dashboard"
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600 transition-colors shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M19 12H5" /><polyline points="12 19 5 12 12 5" />
            </svg>
            Dashboard
          </Link>
          <span className="text-gray-300" aria-hidden="true">/</span>
          <h1 className="text-xl font-semibold text-gray-800 truncate">Interview History</h1>
        </div>
        <Link
          to="/interview/setup"
          id="link-new-interview"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors shrink-0"
        >
          + New Interview
        </Link>
      </div>

      {/* ── Filter bar ── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-6 flex flex-wrap gap-3 items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-[180px]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
            strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            id="input-search"
            type="search"
            placeholder="Search by domain…"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
          />
        </div>

        {/* Type */}
        <select
          id="select-type"
          value={type}
          onChange={handleFilterChange(setType)}
          className="px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
        >
          <option value="">All Types</option>
          <option value="Technical">Technical</option>
          <option value="HR">HR</option>
          <option value="Behavioral">Behavioral</option>
          <option value="Mixed">Mixed</option>
        </select>

        {/* Difficulty */}
        <select
          id="select-difficulty"
          value={difficulty}
          onChange={handleFilterChange(setDifficulty)}
          className="px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
        >
          <option value="">All Difficulties</option>
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
        </select>

        {/* Mode */}
        <select
          id="select-mode"
          value={mode}
          onChange={handleFilterChange(setMode)}
          className="px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
        >
          <option value="">All Modes</option>
          <option value="Practice">Practice</option>
          <option value="Timed">Timed</option>
        </select>

        {/* Sort */}
        <select
          id="select-sort"
          value={sort}
          onChange={handleFilterChange(setSort)}
          className="px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <svg className="w-7 h-7 animate-spin text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-label="Loading history">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
          </svg>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-sm text-red-600">{error}</p>
          <button
            type="button"
            onClick={() => fetchHistory({ page, limit: PAGE_SIZE, search, type, difficulty, mode, sort })}
            className="mt-3 text-indigo-600 hover:underline text-sm"
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          <InterviewHistoryTable
            interviews={interviews}
            onInterviewDeleted={handleInterviewDeleted}
          />
          <Pagination pagination={pagination} onPage={setPage} />
        </>
      )}
    </div>
  );
}

export default HistoryPage;
