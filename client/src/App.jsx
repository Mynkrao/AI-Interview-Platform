// App.jsx
// SAD Section 12.2: "Defines all routes using React Router v6. Wraps
// protected routes in ProtectedRoute."
//
// MODULE 4 PHASE 2: Interview session routes added.
// /interview/setup    — InterviewSetupPage  (Protected)
// /interview/session  — InterviewSessionPage (Protected)
// All auth routes from Phase 1 are unchanged.

import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import InterviewSetupPage from './pages/InterviewSetupPage.jsx';
import InterviewSessionPage from './pages/InterviewSessionPage.jsx';
import ProtectedRoute from './components/common/ProtectedRoute.jsx';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/interview/setup"
        element={
          <ProtectedRoute>
            <InterviewSetupPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/interview/session"
        element={
          <ProtectedRoute>
            <InterviewSessionPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
