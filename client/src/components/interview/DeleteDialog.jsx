// client/src/components/DeleteDialog.jsx
//
// Simple confirmation modal. Assumes Tailwind is available (per existing
// project convention) and no external modal library is in use. If your
// project already has a shared Modal component, swap the wrapper markup
// below for that instead of this standalone version.

import React from 'react';

const DeleteDialog = ({ open, onCancel, onConfirm, isDeleting }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm">
        <h3 className="text-lg font-semibold text-gray-800">Delete this interview?</h3>
        <p className="text-sm text-gray-500 mt-2">
          This action cannot be undone. The interview session and its feedback will be
          permanently removed.
        </p>
        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 text-sm"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700 disabled:opacity-60"
          >
            {isDeleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteDialog;
