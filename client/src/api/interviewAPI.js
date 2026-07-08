// api/interviewAPI.js
// SAD Section 8.2 / SRS FR-03-04: wraps POST /api/interview/generate.
// Phase 2 scope: only question generation. Submit, history, and delete
// endpoints belong to later phases and are not added here.

import axiosInstance from '../utils/axiosInstance';

/**
 * Generate interview questions.
 * @param {{ type: string, domain: string, count: number, difficulty: string, mode: string, company?: string }} config
 * @returns {Promise<string[]>} array of question strings
 */
export async function generateInterview(config) {
  const res = await axiosInstance.post('/interview/generate', config);
  // Standard envelope: { success, data: { questions } }
  return res.data.data.questions;
}
