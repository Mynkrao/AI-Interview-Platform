// components/common/ProtectedRoute.jsx
// Auth guard (SAD Section 9.2 / 12.2): checks isAuthenticated from
// AuthContext. Redirects to /login if false. Otherwise renders children.
// No change needed here for the sessionStorage deviation (see
// AuthContext.jsx) - isAuthenticated is already correct on first render
// because AuthContext rehydrates synchronously before this component
// ever mounts.

import { Navigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
