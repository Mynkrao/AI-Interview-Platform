// App.jsx
// SAD Section 12.2: "Defines all routes using React Router v6. Wraps
// protected routes in ProtectedRoute."
//
// MODULE 3 SCOPE NOTE: only the routes needed to exercise the Auth module
// are wired here (Landing, Login, Register, and the Dashboard stub as the
// protected landing target). History, Interview, Feedback, Analytics, and
// Profile pages (SRS Section 13 / SAD Section 11.2) don't exist yet and
// are deliberately not routed to - adding routes to non-existent pages
// would be dead code. A catch-all 404 page (SRS Table 14) is also not
// added yet, since it's outside this module's stated scope; flagged as an
// open item for whichever module builds it.

import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
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
    </Routes>
  );
}

export default App;
