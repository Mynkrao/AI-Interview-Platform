// pages/DashboardPage.jsx
// Route: /dashboard (Protected).
//
// SCOPE NOTE (read before extending this file): this is a MINIMAL STUB,
// not an implementation of FR-02 (Dashboard). SRS's registration/login
// user journey (Section 6.1) sends the user here after auth, but the
// actual Dashboard feature - stat cards, score trend chart, recent
// activity, recommended interview (FR-02-01 through FR-02-05, SAD
// Sections 3.5, 6.4, 8.3) - is out of scope for the Auth module and
// belongs to its own module. This file exists only so ProtectedRoute has
// a real, testable destination. It contains zero analytics/interview API
// calls. Replace this file entirely when the Dashboard module is built -
// do not incrementally bolt FR-02 features onto it.

import useAuth from '../hooks/useAuth';

function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8">
        <h1 className="text-2xl font-semibold text-gray-800">Welcome, {user?.name}</h1>
        <p className="mt-2 text-gray-500">
          You are authenticated. Dashboard features are not implemented yet.
        </p>
        <button
          onClick={logout}
          className="mt-6 px-5 py-2 rounded-md border border-gray-300 text-gray-700 font-medium hover:bg-gray-100"
        >
          Log out
        </button>
      </div>
    </div>
  );
}

export default DashboardPage;
