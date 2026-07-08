# CHANGELOG — Module 4 Phase 2

## [Phase 2] — 2026-07-08

### Added

| File | Description |
|---|---|
| `client/src/api/interviewAPI.js` | Wraps `POST /api/interview/generate`. Single export: `generateInterview(config)` → `string[]`. |
| `client/src/context/InterviewContext.jsx` | Global interview session state. Manages `questions[]`, `answers[]`, `currentQuestionIndex`, `interviewConfig`, `timeRemaining`, `isInterviewStarted`. Countdown timer is internal (no backend calls, no auto-submit). |
| `client/src/hooks/useInterview.js` | Convenience hook that consumes `InterviewContext`. Throws if used outside the provider. |
| `client/src/components/interview/SessionTimer.jsx` | Renders the countdown timer. Visible only in Timed mode. Pulses red when ≤ 60 s remain. Timer expires silently — no submit or backend action. |
| `client/src/components/interview/ProgressBar.jsx` | Accessible `progressbar` role. Shows animated fill track + "Question X / Y" label + % complete. |
| `client/src/components/interview/QuestionCard.jsx` | Presentational card that renders one question string, a numbered badge, and total count. No context coupling. |
| `client/src/components/interview/AnswerInput.jsx` | Controlled `<textarea>`. Calls `onChange` on every keystroke — answer is persisted to context immediately. |
| `client/src/components/interview/PreviousButton.jsx` | Calls `goPrevious()` from context. Disabled on question 0. |
| `client/src/components/interview/NextButton.jsx` | Calls `goNext()` from context. Disabled on final question. No submit logic. |
| `client/src/pages/InterviewSetupPage.jsx` | Route `/interview/setup`. Pill-group selectors for type, difficulty, count, mode plus text inputs for domain and optional company. Calls `generateInterview()`, hands result to `startSession()`, navigates to `/interview/session`. |
| `client/src/pages/InterviewSessionPage.jsx` | Route `/interview/session`. Composes all interview sub-components. Guards against direct-URL access by redirecting to setup when no session is active. |

### Modified

| File | What changed |
|---|---|
| `client/src/App.jsx` | Added imports and protected routes for `/interview/setup` and `/interview/session`. Comment header updated to reflect Module 4 Phase 2 scope. |
| `client/src/main.jsx` | Imported `InterviewProvider` and wrapped `<App />` with it (nested inside existing `AuthProvider`). Comment updated. |

### Unchanged (confirmed)

Backend (controllers, routes, validators, services, models, middleware), authentication, feedback, history, analytics, dashboard — **zero modifications**.

---

### Out of scope (Phase 2 explicitly excludes)

- Answer evaluation
- Score calculation
- Session submission (`POST /api/interview/submit`)
- Feedback page
- History page / analytics
- Timer auto-submit on expiry
