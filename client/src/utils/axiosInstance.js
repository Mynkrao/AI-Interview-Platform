// utils/axiosInstance.js
// Centralized Axios config. SAD Section 9.3 (as amended - see DEVIATION
// note below): this is the single, exclusive mechanism by which the token
// reaches the backend on every request - there is no cookie-based path.
//
// DEVIATION FROM SAD v2.0 SECTION 9.1 (logged, approved by project owner
// 2026-07-07): SAD v2.0 mandated in-memory-only token storage with no
// persistence. That caused every page refresh to log the user out, which
// was reported as a usability defect. Approved fix: persist the token/user
// pair in sessionStorage (tab-scoped, cleared on tab close) instead of
// pure in-memory state. This does not re-litigate that choice here; see
// AuthContext.jsx for the tradeoff it accepts (same XSS-readability
// exposure as before, now for the lifetime of the tab instead of the
// lifetime of the React tree). SAD must be formally revised to v3.0 to
// reflect this before Module 3 sign-off is final.
//
// Implementation note: the token itself is owned by AuthContext (React
// state, mirrored to sessionStorage on login/logout). Since this module is
// a plain JS file outside the React tree, it can't read React state
// directly - it holds a local mirror (setAuthToken) that AuthContext
// updates on every login()/logout() call, so the interceptor doesn't need
// to touch sessionStorage itself.

import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || '';

const axiosInstance = axios.create({
  baseURL: `${baseURL}/api`,
});

let currentToken = null;
let unauthorizedHandler = null;

export function setAuthToken(token) {
  currentToken = token;
}

// AuthContext registers its logout() here so the response interceptor
// below can trigger it on any 401, from any call, anywhere in the app.
export function registerUnauthorizedHandler(handler) {
  unauthorizedHandler = handler;
}

// Request interceptor: attach Authorization: Bearer <token> (SAD 9.3)
axiosInstance.interceptors.request.use((config) => {
  if (currentToken) {
    config.headers.Authorization = `Bearer ${currentToken}`;
  }
  return config;
});

// Response interceptor: on 401, clear in-memory auth state and redirect
// to /login (SAD 9.3). The actual clearing/redirect logic lives in
// AuthContext.logout(); this file only detects the 401 and invokes it.
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401 && unauthorizedHandler) {
      unauthorizedHandler();
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
