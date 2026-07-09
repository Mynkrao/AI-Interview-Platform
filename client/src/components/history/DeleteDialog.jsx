// components/history/DeleteDialog.jsx
// Accessible confirmation dialog for deleting an interview.
// Renders as a modal overlay; blocks interaction with the page behind it.
// Calls onConfirm() on "Delete" and onCancel() on "Cancel" or backdrop click.

import React, { useEffect, useRef, useState } from 'react';
import { deleteInterview } from '../../api/interviewAPI';

function DeleteDialog({ sessionId, onDeleted, onCancel }) {
  const [deleting, setDeleting] = useState(false);
  const [error,    setError]    = useState('');
  const cancelRef               = useRef(null);

  // Focus the Cancel button when the dialog opens for keyboard accessibility.
  useEffect(() => { cancelRef.current?.focus(); }, []);

  async function handleConfirm() {
    setError('');
    setDeleting(true);
    try {
      await deleteInterview(sessionId);
      onDeleted(sessionId);
    } catch (err) {
      setError(err?.response?.data?.message || 'Deletion failed. Please try again.');
      setDeleting(false);
    }
  }

  return (
    /* Backdrop */
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      {/* Dim overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />

      {/* Panel */}
      <div className="relative bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-sm p-6 space-y-4">
        {/* Icon */}
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-50 mx-auto">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <path d="M10 11v6" /><path d="M14 11v6" />
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
          </svg>
        </div>

        <div className="text-center">
          <h2 id="delete-dialog-title" className="text-base font-semibold text-gray-900">
            Delete Interview?
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            This action cannot be undone. All question feedback and scores will be permanently removed.
          </p>
        </div>

        {error && (
          <p role="alert" className="text-sm text-red-600 text-center">{error}</p>
        )}

        <div className="flex gap-3 pt-1">
          <button
            ref={cancelRef}
            id="btn-cancel-delete"
            type="button"
            onClick={onCancel}
            disabled={deleting}
            className="flex-1 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            id="btn-confirm-delete"
            type="button"
            onClick={handleConfirm}
            disabled={deleting}
            className="flex-1 px-4 py-2 rounded-xl bg-red-600 text-sm font-semibold text-white hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
          >
            {deleting ? (
              <>
                <svg className="w-3.5 h-3.5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                </svg>
                Deleting…
              </>
            ) : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteDialog;
