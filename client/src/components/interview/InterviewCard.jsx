// client/src/components/InterviewCard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const statusColor = {
  completed: 'bg-green-50 text-green-700',
  'in-progress': 'bg-amber-50 text-amber-700',
  abandoned: 'bg-gray-100 text-gray-500',
};

const InterviewCard = ({ interview, onDelete }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col gap-2">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-medium text-gray-800">
            {interview.interviewType} — {interview.domain}
          </p>
          <p className="text-xs text-gray-400">
            {new Date(interview.createdAt).toLocaleString()}
          </p>
        </div>
        <span
          className={`text-xs px-2 py-1 rounded-full ${
            statusColor[interview.status] || 'bg-gray-100 text-gray-500'
          }`}
        >
          {interview.status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-gray-500">
        <span>Difficulty: {interview.difficulty}</span>
        <span>Mode: {interview.mode}</span>
        {interview.company && <span>Company: {interview.company}</span>}
        <span>
          Score:{' '}
          <span className="font-semibold text-indigo-600">
            {interview.overallScore ?? '—'}
          </span>
        </span>
      </div>

      <div className="flex justify-end gap-3 mt-2">
        <button
          type="button"
          onClick={() => navigate(`/history/${interview._id}`)}
          className="text-sm text-indigo-600 hover:underline"
        >
          View Details
        </button>
        <button
          type="button"
          onClick={() => onDelete(interview._id)}
          className="text-sm text-red-500 hover:underline"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default React.memo(InterviewCard);
