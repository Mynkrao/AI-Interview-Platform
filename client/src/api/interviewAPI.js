// api/interviewAPI.js
// SAD Section 8.2: wraps all interview endpoints.
// Module 4 Phase 2: generateInterview (POST /generate)
// Module 4 Phase 3: submitInterview   (POST /submit)
// Module 5:         getDashboardStats (GET  /dashboard)
//                   getInterviewHistory (GET /history)
//                   getInterview        (GET /:id)
//                   deleteInterview     (DELETE /:id)

import axiosInstance from '../utils/axiosInstance';

// ── Module 4 ──────────────────────────────────────────────────────────────────

/** Generate interview questions. */
export async function generateInterview(config) {
  const res = await axiosInstance.post('/interview/generate', config);
  return res.data.data.questions;
}

/** Submit a completed interview session for AI evaluation. */
export async function submitInterview(payload) {
  const res = await axiosInstance.post('/interview/submit', payload);
  return res.data.data;
}

// ── Module 5 ──────────────────────────────────────────────────────────────────

/** Fetch dashboard statistics for the authenticated user. */
export async function getDashboardStats() {
  const res = await axiosInstance.get('/interview/dashboard');
  return res.data.data;
}

/**
 * Fetch paginated interview history.
 * @param {{ page?, limit?, search?, type?, difficulty?, mode?, sort? }} params
 */
export async function getInterviewHistory(params = {}) {
  const res = await axiosInstance.get('/interview/history', { params });
  return res.data.data; // { interviews, pagination }
}

/** Fetch a single interview session by id. */
export async function getInterview(id) {
  const res = await axiosInstance.get(`/interview/${id}`);
  return res.data.data.interview;
}

/** Delete an interview session by id. */
export async function deleteInterview(id) {
  const res = await axiosInstance.delete(`/interview/${id}`);
  return res.data.data;
}


