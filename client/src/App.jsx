// App.jsx
// SAD Section 12.2: Defines all routes using React Router v6.
// All protected routes are wrapped in ProtectedRoute.
//
// Module 4 Phase 3: /feedback route added.
// Module 5: /history and /history/:id routes added.
// All prior routes unchanged.

import { Routes, Route } from 'react-router-dom';
import LandingPage          from './pages/LandingPage.jsx';
import LoginPage            from './pages/LoginPage.jsx';
import RegisterPage         from './pages/RegisterPage.jsx';
import DashboardPage        from './pages/DashboardPage.jsx';
import InterviewSetupPage   from './pages/InterviewSetupPage.jsx';
import InterviewSessionPage from './pages/InterviewSessionPage.jsx';
import FeedbackPage         from './pages/FeedbackPage.jsx';
import HistoryPage          from './pages/HistoryPage.jsx';
import InterviewDetailPage  from './pages/InterviewDetailPage.jsx';
import ProtectedRoute       from './components/common/ProtectedRoute.jsx';

function App() {
  return (
    <Routes>
      {/* ── Public routes ── */}
      <Route path="/"         element={<LandingPage />} />
      <Route path="/login"    element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* ── Protected routes (Module 3+) ── */}
      <Route
        path="/dashboard"
        element={<ProtectedRoute><DashboardPage /></ProtectedRoute>}
      />
      <Route
        path="/interview/setup"
        element={<ProtectedRoute><InterviewSetupPage /></ProtectedRoute>}
      />
      <Route
        path="/interview/session"
        element={<ProtectedRoute><InterviewSessionPage /></ProtectedRoute>}
      />
      <Route
        path="/feedback"
        element={<ProtectedRoute><FeedbackPage /></ProtectedRoute>}
      />

      {/* ── Module 5 routes ── */}
      <Route
        path="/history"
        element={<ProtectedRoute><HistoryPage /></ProtectedRoute>}
      />
      <Route
        path="/history/:id"
        element={<ProtectedRoute><InterviewDetailPage /></ProtectedRoute>}
      />
    </Routes>
  );
}

export default App;


