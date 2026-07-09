// client/src/components/DifficultyChart.jsx
import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = { Beginner: '#a5b4fc', Intermediate: '#6366f1', Advanced: '#4338ca' };

const DifficultyChart = ({ data }) => {
  const chartData = (data || []).map((d) => ({
    name: d.difficulty || 'Unknown',
    value: d.count,
  }));

  if (chartData.length === 0) {
    return <p className="text-sm text-gray-400">No difficulty data yet.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={90}
          label={(entry) => entry.name}
        >
          {chartData.map((entry, i) => (
            <Cell key={i} fill={COLORS[entry.name] || '#a1a1aa'} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default React.memo(DifficultyChart);
