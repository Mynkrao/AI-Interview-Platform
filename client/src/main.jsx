// main.jsx
// React DOM root.
// SAD Section 12.2: "Wraps App with AuthContext and InterviewContext providers."
//
// MODULE 4 PHASE 2: InterviewProvider now wired here as stated in SAD.
// It is nested inside AuthProvider (which must already exist for Router
// context) because interview API calls go through axiosInstance which
// AuthContext owns.
//
// AuthProvider is nested INSIDE BrowserRouter (not the other way around)
// because it calls useNavigate() internally (SAD Section 9.3: redirect to
// /login on 401/logout), which requires Router context to already exist.

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { InterviewProvider } from './context/InterviewContext.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <InterviewProvider>
          <App />
        </InterviewProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
