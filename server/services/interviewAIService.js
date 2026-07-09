// services/interviewAIService.js
// SOLE file in the codebase that imports the Gemini SDK (SAD Section 3.6 /
// Section 12.1: "ONLY file that imports Gemini SDK"). No controller or
// route file may import an AI SDK directly (SRS Section 12.5 / SAD
// Section 2.1).
//
// Phase 3 additions: evaluateAnswer and generateSessionSummary are now
// implemented in this same file as planned in Phase 1 scope notes.
// generateQuestions is unchanged.

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

// --- Generic JSON object parser (shared by evaluate and summary parsers) ---
// Strips markdown fences, attempts JSON.parse, returns null on any failure.
function parseJsonObject(rawText) {
  if (typeof rawText !== 'string') return null;

  const stripped = rawText
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  try {
    const parsed = JSON.parse(stripped);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed;
    return null;
  } catch {
    return null;
  }
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

// evaluateAnswer(question, answer) ->
//   { score, feedback, strengths[], improvements[] }
// Phase 3 (SAD Section 3.6 / SRS FR-03-05). One Gemini call + one retry on
// invalid JSON. Never retries on 429 or timeout (delegated to callGemini).
// Empty answers receive a zero-score placeholder — no AI call wasted.
async function evaluateAnswer(question, answer) {
  if (!answer || !answer.trim()) {
    return {
      score: 0,
      feedback: 'No answer was provided for this question.',
      strengths: [],
      improvements: ['Provide a complete answer to receive a score.'],
      aiModel: MODEL_NAME,
    };
  }

  const systemInstruction =
    'You are an expert interview coach evaluating a candidate\'s answer. ' +
    'Return ONLY a valid JSON object with no markdown, no explanation, no extra text. ' +
    'The object must have exactly these fields: ' +
    '"score" (integer 0-10), ' +
    '"feedback" (string), ' +
    '"strengths" (array of strings), ' +
    '"improvements" (array of strings).';

  const userPrompt =
    `Question: ${question}\n\nCandidate Answer: ${answer}\n\nEvaluate and return JSON only.`;

  const firstAttempt = await callGemini(systemInstruction, userPrompt);
  let evaluation = parseJsonObject(firstAttempt);

  if (!isValidEvaluation(evaluation)) {
    const secondAttempt = await callGemini(systemInstruction, userPrompt);
    evaluation = parseJsonObject(secondAttempt);
  }

  if (!isValidEvaluation(evaluation)) {
    throw apiError('The AI service returned an unexpected evaluation. Please try again.', 500);
  }

  return {
    score: Math.min(10, Math.max(0, Math.round(Number(evaluation.score)))),
    feedback: String(evaluation.feedback || ''),
    strengths: Array.isArray(evaluation.strengths)
      ? evaluation.strengths.map(String)
      : [],
    improvements: Array.isArray(evaluation.improvements)
      ? evaluation.improvements.map(String)
      : [],
    aiModel: MODEL_NAME,
  };
}

function isValidEvaluation(obj) {
  if (!obj || typeof obj !== 'object') return false;
  return typeof obj.score !== 'undefined' && typeof obj.feedback !== 'undefined';
}

// generateSessionSummary(interviewType, domain, difficulty, qaPairs) ->
//   { summary, overallStrengths[], overallWeaknesses[], recommendation }
// Phase 3 (SAD Section 3.6 / SRS FR-03-06). One call + one retry on
// invalid JSON. The controller maps this to sessionSummary.strengths and
// sessionSummary.improvements to fit the existing schema.
async function generateSessionSummary(interviewType, domain, difficulty, qaPairs) {
  const avgScore =
    qaPairs.reduce((sum, p) => sum + (p.score || 0), 0) / (qaPairs.length || 1);

  const pairsText = qaPairs
    .map((p, i) => `Q${i + 1}: ${p.question}\nAnswer: ${p.answer}\nScore: ${p.score}/10`)
    .join('\n\n');

  const systemInstruction =
    'You are a senior career coach writing a post-interview performance summary. ' +
    'Return ONLY a valid JSON object with no markdown, no explanation, no extra text. ' +
    'The object must have exactly these fields: ' +
    '"summary" (string — 2-4 sentence overall assessment), ' +
    '"overallStrengths" (array of strings), ' +
    '"overallWeaknesses" (array of strings), ' +
    '"recommendation" (string — one actionable sentence).';

  const userPrompt =
    `Interview Type: ${interviewType}\nDomain: ${domain}\nDifficulty: ${difficulty}\n` +
    `Average Score: ${avgScore.toFixed(1)}/10\n\n${pairsText}\n\nGenerate the summary JSON.`;

  const firstAttempt = await callGemini(systemInstruction, userPrompt);
  let summary = parseJsonObject(firstAttempt);

  if (!isValidSummary(summary)) {
    const secondAttempt = await callGemini(systemInstruction, userPrompt);
    summary = parseJsonObject(secondAttempt);
  }

  if (!isValidSummary(summary)) {
    throw apiError('The AI service returned an unexpected summary. Please try again.', 500);
  }

  return {
    summary: String(summary.summary || ''),
    overallStrengths: Array.isArray(summary.overallStrengths)
      ? summary.overallStrengths.map(String)
      : [],
    overallWeaknesses: Array.isArray(summary.overallWeaknesses)
      ? summary.overallWeaknesses.map(String)
      : [],
    recommendation: String(summary.recommendation || ''),
  };
}

function isValidSummary(obj) {
  if (!obj || typeof obj !== 'object') return false;
  return typeof obj.summary !== 'undefined';
}

module.exports = { generateQuestions, evaluateAnswer, generateSessionSummary };
