# RUN_AFTER_UPDATE — Module 4 Phase 3

## What changed

Backend routes and AI service were extended. No new packages were installed.
The MongoDB schema is unchanged. No migrations required.

## Steps

```bash
# 1. Restart the backend (picks up the new /submit route and AI functions)
cd server
npm run dev          # or: node server.js

# 2. In a separate terminal — start (or hot-reload) the frontend
cd client
npm run dev

# 3. Open the app
# http://localhost:5173  (or the port Vite reports)
```

## Environment variables

No new variables required. The existing `GEMINI_API_KEY` and `GEMINI_MODEL`
(set to `gemini-2.5-flash`) are reused by the new AI functions.

## Notes on submission time

Each AI evaluation call is sequential to avoid Gemini rate-limit spikes.
For a 10-question session, expect roughly 20-40 seconds for the full
evaluation + summary. The Submit button shows a spinner during this wait.
