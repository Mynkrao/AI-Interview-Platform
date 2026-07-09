// pages/DashboardPage.jsx
// Route: /dashboard (Protected).
// Module 5: replaces the placeholder. Fetches real stats from
// GET /api/interview/dashboard and renders DashboardStats + charts.

import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardStats } from '../api/interviewAPI';
import DashboardStats    from '../components/analytics/DashboardStats';
import ScoreChart        from '../components/analytics/ScoreChart';
import InterviewTypeChart from '../components/analytics/InterviewTypeChart';
import DifficultyChart   from '../components/analytics/DifficultyChart';

const DashboardPage = () => {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDashboardStats();
      setStats(data);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load dashboard. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-3">
          <svg className="w-8 h-8 animate-spin text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
          </svg>
          <p className="text-sm text-gray-400">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 text-sm">{error}</p>
        <button
          onClick={fetchStats}
          className="mt-3 text-indigo-600 hover:underline text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  const isEmpty = !stats || stats.totalInterviews === 0;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Dashboard</h1>
        <div className="flex gap-3">
          <Link
            to="/history"
            id="link-history"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
            Interview History
          </Link>
          <Link
            to="/interview/setup"
            id="link-new-interview"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
          >
            New Interview
          </Link>
        </div>
      </div>

      {/* Stat cards */}
      <DashboardStats stats={stats} />

      {isEmpty ? (
        <div className="text-center py-16">
          <p className="text-sm text-gray-400">
            No interviews yet. Complete your first interview to see analytics here.
          </p>
          <Link
            to="/interview/setup"
            className="mt-4 inline-block text-indigo-600 hover:underline text-sm font-medium"
          >
            Start an Interview →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-sm font-medium text-gray-600 mb-3">Score Distribution</h2>
            <ScoreChart data={stats.scoreDistribution} />
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-sm font-medium text-gray-600 mb-3">Interview Type</h2>
            <InterviewTypeChart data={stats.interviewTypeStats} />
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-sm font-medium text-gray-600 mb-3">Difficulty</h2>
            <DifficultyChart data={stats.difficultyStats} />
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;


