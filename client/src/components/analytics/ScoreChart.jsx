// client/src/components/ScoreChart.jsx
import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

const rangeLabels = {
  0: '0-20',
  21: '21-40',
  41: '41-60',
  61: '61-80',
  81: '81-100',
  unscored: 'Unscored',
};

const ScoreChart = ({ data }) => {
  const chartData = (data || []).map((d) => ({
    range: rangeLabels[d.range] ?? String(d.range),
    count: d.count,
  }));

  if (chartData.length === 0) {
    return <p className="text-sm text-gray-400">No score data yet.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
        <XAxis dataKey="range" tick={{ fontSize: 12 }} />
        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
        <Tooltip />
        <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default React.memo(ScoreChart);
