// hooks/useInterview.js
// Consumes InterviewContext. Mirrors the pattern of useAuth (SAD Section 3.1).

import { useContext } from 'react';
import InterviewContext from '../context/InterviewContext';

export default function useInterview() {
  const ctx = useContext(InterviewContext);
  if (!ctx) {
    throw new Error('useInterview must be used within an InterviewProvider');
  }
  return ctx;
}
