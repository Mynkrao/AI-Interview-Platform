// services/interviewAIService.js
// SOLE file in the codebase that imports the Gemini SDK (SAD Section 3.6 /
// Section 12.1: "ONLY file that imports Gemini SDK"). No controller or
// route file may import an AI SDK directly (SRS Section 12.5 / SAD
// Section 2.1).
//
// PHASE 1 SCOPE NOTE: SAD Section 3.6 specifies three exported functions
// (generateQuestions, evaluateAnswer, generateSessionSummary). Only
// generateQuestions is implemented here. evaluateAnswer and
// generateSessionSummary are intentionally NOT stubbed — they have no
// caller until Phase 3 (session submission), and this project's existing
// convention (see app.js's Module 1 note on not wiring non-existent
// routers) is to avoid dead/untested code rather than pre-scaffold it.
// They will be added to this same file in Phase 3, not a new one.

const { GoogleGenerativeAI } = require('@google/generative-ai');
const env = require('../config/env');
const { apiError } = require('../utils/apiResponse');

const MODEL_NAME = env.GEMINI_MODEL || "gemini-2.5-flash"; // SAD Section 2.2 / Section 3.6

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

// --- Prompt construction (SRS Section 12.2, verbatim) ---
function buildQuestionGenerationSystemPrompt({ type, domain, count, difficulty, mode, company }) {
  const companyClause = company
    ? `Focus on ${company} interview style and known question patterns.`
    : 'Generate standard interview questions.';

  return (
    `You are a senior technical interviewer. Generate exactly ${count} interview ` +
    `questions for a ${difficulty} ${type} interview targeting the role of ${domain}. ` +
    `Interview mode: ${mode}. ${companyClause} ` +
    `Return ONLY a valid JSON array of strings. No explanations, no numbering.`
  );
}

// --- Gemini call with SAD Section 10.4 error mapping ---
// Timeout / transport failure -> 503. Rate limit (429) -> 503. Both are
// distinguished only for logging; the client-facing message is the same
// "temporarily unavailable" shape SAD documents for both cases.
async function callGemini(systemInstruction, userPrompt) {
  const model = genAI.getGenerativeModel({ model: MODEL_NAME, systemInstruction });

  try {
    const result = await model.generateContent(userPrompt);
    return result.response.text();
  } catch (err) {
    const status = err?.status || err?.response?.status;
    console.error("FULL GEMINI ERROR: ");
    console.error(err);


    if (status === 429) {
      throw apiError('AI service temporarily unavailable. Please try again shortly.', 503);
    }

    // Any other transport/timeout/unknown failure from the SDK call itself.
    throw apiError('The AI service did not respond. Please try again.', 503);
  }
}

// --- Response parsing ---
// Gemini is instructed to return only a JSON array, but models sometimes
// wrap output in markdown code fences despite instructions. Strip fences
// defensively before parsing; do not attempt any other repair.
function parseQuestionArray(rawText) {
  if (typeof rawText !== 'string') return null;

  const stripped = rawText
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  let parsed;
  try {
    parsed = JSON.parse(stripped);
  } catch (err) {
    return null;
  }

  if (!Array.isArray(parsed) || parsed.length === 0) return null;
  if (!parsed.every((q) => typeof q === 'string' && q.trim().length > 0)) return null;

  return parsed;
}

// generateQuestions(type, domain, count, difficulty, mode, company) -> string[]
// SAD Section 3.6. One Gemini call per invocation, plus one retry ONLY on
// an invalid-JSON response (SAD Section 10.4: "retry once -> if still
// fails -> 500 with fallback message"). Timeout and rate-limit failures
// are not retried here — they already throw a 503 directly from callGemini.
async function generateQuestions(type, domain, count, difficulty, mode, company) {
  const systemInstruction = buildQuestionGenerationSystemPrompt({ type, domain, count, difficulty, mode, company });
  const userPrompt = 'Generate the questions now.'; // SRS Section 12.2

  const firstAttempt = await callGemini(systemInstruction, userPrompt);
  let questions = parseQuestionArray(firstAttempt);

  if (!questions) {
    const secondAttempt = await callGemini(systemInstruction, userPrompt);
    questions = parseQuestionArray(secondAttempt);
  }

  if (!questions) {
    throw apiError('The AI service returned an unexpected response. Please try again.', 500);
  }

  return questions;
}

module.exports = { generateQuestions };
