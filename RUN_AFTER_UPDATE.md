# RUN_AFTER_UPDATE — Module 4 Phase 2

No new packages were added. No backend changes were made.
No migrations or environment variable changes are required.

## Steps

```bash
# 1. From the project root — ensure the server is running
cd server
npm run dev          # or: node server.js

# 2. In a separate terminal — start the frontend dev server
cd client
npm run dev

# 3. Open the application
# http://localhost:5173  (or whichever port Vite reports)
```

## Verify the backend is reachable

The Vite dev proxy forwards `/api` requests to Express.
Check `client/vite.config.js` to confirm the proxy target matches your
running server port (default: 5000).

## That's it

Phase 2 is purely additive frontend work.
No `npm install`, no database migrations, no new environment variables.
