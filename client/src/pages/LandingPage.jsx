// pages/LandingPage.jsx
// Route: / (Public). SRS Table 14: "Hero section, feature cards, CTA
// buttons (Login / Register)." Kept intentionally minimal - this page has
// no FR of its own; it exists so Guest users have somewhere to start the
// journey described in SRS Section 6.1.

import { Link } from 'react-router-dom';

function LandingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8 max-w-xl">
        <h1 className="text-3xl font-bold text-gray-800">AI Mock Interview Platform</h1>
        <p className="mt-4 text-gray-600">
          Practice technical and HR interviews with AI-generated questions, get instant
          feedback, and track your progress over time.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link
            to="/register"
            className="px-5 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700"
          >
            Get Started
          </Link>
          <Link
            to="/login"
            className="px-5 py-2 rounded-md border border-gray-300 text-gray-700 font-medium hover:bg-gray-100"
          >
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
