// client/src/components/DashboardStats.jsx
//
// Renders the 6 stat cards from GET /api/interview/dashboard.
// Presentational only — data fetching happens in DashboardPage.

import React from 'react';

const StatCard = React.memo(({ label, value }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
    <p className="text-sm text-gray-500">{label}</p>
    <p className="text-2xl font-semibold text-indigo-600 mt-1">{value}</p>
  </div>
));
StatCard.displayName = 'StatCard';

const DashboardStats = ({ stats }) => {
  if (!stats) return null;

  const cards = [
    { label: 'Total Interviews', value: stats.totalInterviews ?? 0 },
    { label: 'Average Score', value: `${stats.averageScore ?? 0}%` },
    { label: 'Highest Score', value: `${stats.highestScore ?? 0}%` },
    {
      label: 'Latest Interview',
      value: stats.latestInterview
        ? new Date(stats.latestInterview.createdAt).toLocaleDateString()
        : '—',
    },
    { label: 'This Week', value: stats.interviewsThisWeek ?? 0 },
    { label: 'This Month', value: stats.interviewsThisMonth ?? 0 },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards.map((c) => (
        <StatCard key={c.label} label={c.label} value={c.value} />
      ))}
    </div>
  );
};

export default React.memo(DashboardStats);
