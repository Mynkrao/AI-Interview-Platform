// client/src/components/InterviewHistoryTable.jsx
//
// Desktop table view. HistoryPage swaps between this and InterviewCard
// (grid) based on viewport — see HistoryPage.jsx.

import React from 'react';
import { useNavigate } from 'react-router-dom';

const InterviewHistoryTable = ({ interviews, onDelete }) => {
  const navigate = useNavigate();

  if (!interviews || interviews.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400 text-sm">
        No interviews found. Try adjusting your filters.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-sm">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 text-gray-500 text-left">
          <tr>
            <th className="px-4 py-3 font-medium">Date</th>
            <th className="px-4 py-3 font-medium">Type</th>
            <th className="px-4 py-3 font-medium">Domain</th>
            <th className="px-4 py-3 font-medium">Difficulty</th>
            <th className="px-4 py-3 font-medium">Mode</th>
            <th className="px-4 py-3 font-medium">Company</th>
            <th className="px-4 py-3 font-medium">Score</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {interviews.map((i) => (
            <tr key={i._id} className="border-t border-gray-100 hover:bg-gray-50">
              <td className="px-4 py-3 text-gray-600">
                {new Date(i.createdAt).toLocaleDateString()}
              </td>
              <td className="px-4 py-3 text-gray-800">{i.interviewType}</td>
              <td className="px-4 py-3 text-gray-600">{i.domain}</td>
              <td className="px-4 py-3 text-gray-600">{i.difficulty}</td>
              <td className="px-4 py-3 text-gray-600">{i.mode}</td>
              <td className="px-4 py-3 text-gray-600">{i.company || '—'}</td>
              <td className="px-4 py-3 font-semibold text-indigo-600">
                {i.overallScore ?? '—'}
              </td>
              <td className="px-4 py-3 text-gray-600">{i.status}</td>
              <td className="px-4 py-3 text-right whitespace-nowrap">
                <button
                  type="button"
                  onClick={() => navigate(`/history/${i._id}`)}
                  className="text-indigo-600 hover:underline mr-3"
                >
                  View
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(i._id)}
                  className="text-red-500 hover:underline"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default React.memo(InterviewHistoryTable);
