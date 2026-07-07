// src/test/auth.regression.test.jsx
//
// Module 3 regression suite for the SAD v2.0 Section 9.1 deviation
// (in-memory-only token -> sessionStorage). No test suite existed for
// Module 3 prior to this change, so this is a new baseline, not a rerun
// of a pre-existing one - flagged here rather than silently implied.
//
// Covers the five flows named in the request:
//   1. register  -> same code path as login() below (RegisterPage and
//      LoginPage both call context.login(token, user) on success - see
//      pages/RegisterPage.jsx / pages/LoginPage.jsx). Testing login()
//      exercises that shared path; there is no separate register-only
//      persistence logic to test.
//   2. login      -> "persists auth on login"
//   3. refresh    -> "rehydrates from sessionStorage on remount"
//   4. logout     -> "clears session and redirects on logout"
//   5. unauthorized -> "ProtectedRoute blocks when no session" +
//                       "401 response triggers logout+redirect"

import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect, beforeEach } from 'vitest';
import { AuthProvider } from '../context/AuthContext';
import useAuth from '../hooks/useAuth';
import ProtectedRoute from '../components/common/ProtectedRoute';
import axiosInstance, { setAuthToken } from '../utils/axiosInstance';

const TOKEN_KEY = 'aimip_auth_token';
const USER_KEY = 'aimip_auth_user';

function Consumer() {
  const { isAuthenticated, user, login, logout } = useAuth();
  return (
    <div>
      <span data-testid="auth-state">{isAuthenticated ? 'authed' : 'anon'}</span>
      <span data-testid="user-name">{user?.name || ''}</span>
      <button onClick={() => login('tok-123', { id: 'u1', name: 'Rudra' })}>
        do-login
      </button>
      <button onClick={logout}>do-logout</button>
    </div>
  );
}

function renderApp(initialEntries = ['/app']) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<div>login-page</div>} />
          <Route path="/app" element={<Consumer />} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
}

beforeEach(() => {
  sessionStorage.clear();
  setAuthToken(null);
});

describe('login/register persistence (shared login() path)', () => {
  it('starts logged out with a clean session', () => {
    renderApp();
    expect(screen.getByTestId('auth-state').textContent).toBe('anon');
  });

  it('persists token and user to sessionStorage on login', async () => {
    renderApp();
    fireEvent.click(screen.getByText('do-login'));

    expect(screen.getByTestId('auth-state').textContent).toBe('authed');
    expect(screen.getByTestId('user-name').textContent).toBe('Rudra');
    expect(sessionStorage.getItem(TOKEN_KEY)).toBe('tok-123');
    expect(JSON.parse(sessionStorage.getItem(USER_KEY))).toEqual({ id: 'u1', name: 'Rudra' });
  });
});

describe('refresh (rehydration from sessionStorage)', () => {
  it('restores an authenticated session on fresh mount, simulating a page reload', () => {
    // Simulate "the user was already logged in before the refresh" by
    // seeding sessionStorage the way login() would have, THEN mounting -
    // this is the actual defect being fixed: Module 3 previously started
    // every mount from blank in-memory state regardless of storage.
    sessionStorage.setItem(TOKEN_KEY, 'tok-persisted');
    sessionStorage.setItem(USER_KEY, JSON.stringify({ id: 'u9', name: 'Persisted User' }));

    renderApp();

    expect(screen.getByTestId('auth-state').textContent).toBe('authed');
    expect(screen.getByTestId('user-name').textContent).toBe('Persisted User');
  });

  it('fails safe to logged-out on corrupted sessionStorage instead of throwing', () => {
    sessionStorage.setItem(TOKEN_KEY, 'tok-persisted');
    sessionStorage.setItem(USER_KEY, '{not valid json');

    expect(() => renderApp()).not.toThrow();
    expect(screen.getByTestId('auth-state').textContent).toBe('anon');
  });
});

describe('logout', () => {
  it('clears sessionStorage and redirects to /login', async () => {
    renderApp();
    fireEvent.click(screen.getByText('do-login'));
    expect(sessionStorage.getItem(TOKEN_KEY)).toBe('tok-123');

    fireEvent.click(screen.getByText('do-logout'));

    await waitFor(() => expect(screen.getByText('login-page')).toBeInTheDocument());
    expect(sessionStorage.getItem(TOKEN_KEY)).toBeNull();
    expect(sessionStorage.getItem(USER_KEY)).toBeNull();
  });
});

describe('unauthorized access', () => {
  it('ProtectedRoute redirects to /login when there is no session', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<div>login-page</div>} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <div>secret-dashboard</div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );

    expect(screen.getByText('login-page')).toBeInTheDocument();
    expect(screen.queryByText('secret-dashboard')).not.toBeInTheDocument();
  });

  it('ProtectedRoute renders children when a persisted session exists (post-refresh case)', () => {
    sessionStorage.setItem(TOKEN_KEY, 'tok-persisted');
    sessionStorage.setItem(USER_KEY, JSON.stringify({ id: 'u9', name: 'Persisted User' }));

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<div>login-page</div>} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <div>secret-dashboard</div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );

    expect(screen.getByText('secret-dashboard')).toBeInTheDocument();
  });

  it('a 401 response still clears session and is routed through the same logout path (SAD 9.3)', async () => {
    renderApp();
    fireEvent.click(screen.getByText('do-login'));
    expect(screen.getByTestId('auth-state').textContent).toBe('authed');

    // Directly exercise axiosInstance's response interceptor, the way a
    // real 401 from an expired/invalid JWT would - without needing a live
    // backend. This confirms the interceptor still reaches the same
    // logout() that clears sessionStorage, so an expired session doesn't
    // linger as a stale "authed" state after this change.
    const rejectedHandler = axiosInstance.interceptors.response.handlers[0].rejected;
    await act(async () => {
      await rejectedHandler({ response: { status: 401 } }).catch(() => {});
    });

    await waitFor(() => expect(screen.getByText('login-page')).toBeInTheDocument());
    expect(sessionStorage.getItem(TOKEN_KEY)).toBeNull();
  });
});
