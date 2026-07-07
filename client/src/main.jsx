// main.jsx
// React DOM root.
// SAD Section 12.2: "Wraps App with AuthContext and InterviewContext providers."
//
// MODULE 3 SCOPE NOTE: only AuthProvider is wired here. InterviewContext
// doesn't exist yet - it's business logic for the Interview module and
// will be added then, not stubbed here as a dead import.
//
// AuthProvider is nested INSIDE BrowserRouter (not the other way around)
// because it calls useNavigate() internally (SAD Section 9.3: redirect to
// /login on 401/logout), which requires Router context to already exist.

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
