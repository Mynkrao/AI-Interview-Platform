// context/AuthContext.jsx
// Global auth state (SAD Section 3.1 / 12.2): user, token, isAuthenticated.
// Actions: login(), logout(), setUser().
//
// DEVIATION FROM SAD v2.0 SECTION 9.1 (logged, approved by project owner
// 2026-07-07): SAD v2.0 required in-memory-only storage and explicitly
// accepted logout-on-refresh as a deliberate consequence. That was
// reported back as a usability defect, so this was revisited. Approved
// replacement strategy: sessionStorage.
//
// What this buys and what it costs, stated plainly (SAD must restate this
// in v3.0 - Section 9.1's "no localStorage/sessionStorage/cookie" line is
// now FALSE and needs to be corrected there, not just here):
//   + Survives a page refresh (fixes the reported defect).
//   + Still dies on tab close, unlike localStorage - not a permanent
//     "remember me"; scope is deliberately limited to the current tab.
//   - Readable by any JS running in the page, same as localStorage would
//     be. If this app is ever XSS'd, the token is exposed either way.
//     This was true before too (in-memory state is also readable by
//     injected JS while the tab is open) - sessionStorage doesn't make
//     the XSS exposure worse, it just extends the exposure window from
//     "until next reload" to "until tab close." That's the tradeoff being
//     accepted here, explicitly, not silently.
// A stronger fix (httpOnly refresh cookie) was offered and declined for
// this pass because it requires new backend session/rotation
// infrastructure and contradicts SRS FR-01-04's "no server-side session
// store" - out of scope for a Module 3 patch.

import { createContext, useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { setAuthToken, registerUnauthorizedHandler } from '../utils/axiosInstance';

const AuthContext = createContext(null);

const TOKEN_KEY = 'aimip_auth_token';
const USER_KEY = 'aimip_auth_user';

// Synchronous read so the very first render already reflects a persisted
// session - no loading spinner, no flash-of-logged-out-state, no race
// against ProtectedRoute's redirect check.
function readPersistedAuth() {
  try {
    const token = sessionStorage.getItem(TOKEN_KEY);
    const rawUser = sessionStorage.getItem(USER_KEY);
    if (!token || !rawUser) return { token: null, user: null };
    return { token, user: JSON.parse(rawUser) };
  } catch {
    // Corrupted JSON, sessionStorage unavailable (e.g. some private-mode
    // configurations), or any other read failure: fail safe to logged-out
    // rather than throwing during render.
    return { token: null, user: null };
  }
}

function persistAuth(token, user) {
  try {
    sessionStorage.setItem(TOKEN_KEY, token);
    sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch {
    // Storage can throw (quota, disabled storage, etc). The app still
    // works for the current render via in-memory state; it just won't
    // survive a refresh in that edge case. Not worth surfacing to the user
    // as an error for what is a UX nicety, not a functional requirement.
  }
}

function clearPersistedAuth() {
  try {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
  } catch {
    // Nothing meaningful to do if sessionStorage itself is unavailable.
  }
}

export function AuthProvider({ children }) {
  const [{ token, user }, setAuthState] = useState(() => {
    const persisted = readPersistedAuth();
    // Warm axiosInstance's token mirror synchronously, before any child
    // component's effects fire and potentially make an API call.
    if (persisted.token) setAuthToken(persisted.token);
    return persisted;
  });
  const navigate = useNavigate();

  const login = useCallback((newToken, newUser) => {
    setAuthState({ token: newToken, user: newUser });
    setAuthToken(newToken);
    persistAuth(newToken, newUser);
  }, []);

  const logout = useCallback(() => {
    setAuthState({ token: null, user: null });
    setAuthToken(null);
    clearPersistedAuth();
    navigate('/login');
  }, [navigate]);

  const setUser = useCallback((updatedUser) => {
    setAuthState((prev) => {
      // Keep sessionStorage's copy of `user` in sync with any profile
      // update (e.g. updateProfile()), otherwise a refresh after editing
      // targetRole/skills would rehydrate the STALE pre-edit user object.
      persistAuth(prev.token, updatedUser);
      return { ...prev, user: updatedUser };
    });
  }, []);

  // Wire axiosInstance's 401 handler to this context's logout, so any
  // expired/invalid token anywhere in the app clears state and redirects
  // (SAD Section 9.3).
  useEffect(() => {
    registerUnauthorizedHandler(logout);
  }, [logout]);

  const value = {
    user,
    token,
    isAuthenticated: !!token,
    login,
    logout,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContext;
