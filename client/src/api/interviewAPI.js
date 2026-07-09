// api/interviewAPI.js
// SAD Section 8.2: wraps interview endpoints.
// Phase 2: generateInterview (POST /generate).
// Phase 3: submitInterview  (POST /submit).

import axiosInstance from '../utils/axiosInstance';

/**
 * Generate interview questions.
 * @param {{ type, domain, count, difficulty, mode, company? }} config
 * @returns {Promise<string[]>}
 */
export async function generateInterview(config) {
  const res = await axiosInstance.post('/interview/generate', config);
  return res.data.data.questions;
}

/**
 * Submit a completed interview session for AI evaluation.
 * @param {{ type, domain, difficulty, mode, company?, qaPairs: {question, answer}[] }} payload
 * @returns {Promise<{ sessionId, overallScore, sessionSummary, qaPairs }>}
 */
export async function submitInterview(payload) {
  const res = await axiosInstance.post('/interview/submit', payload);
  return res.data.data;
}

