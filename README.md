# AI-Based Mock Interview Platform

MERN-stack platform for AI-driven mock interviews, score feedback, and
performance analytics. Built strictly against **SRS v3.3 (Approved)** and
**SAD v2.0 (Implementation-Ready)**.

**Status:** Module 1 (Project Initialization) and Module 2 (Database &
Backend Foundation) complete. Mongoose models (`User`, `InterviewSession`)
and foundation utilities exist. No authentication, interview, or AI business
logic is implemented yet — routes, controllers, services, and validators
remain empty placeholders until those modules are built.

## Stack
- **Frontend:** React 18 + Vite, React Router v6, Axios, Context API, Recharts, Tailwind CSS
- **Backend:** Node.js v20 + Express.js v4, Mongoose v7, JWT (Bearer-only), bcryptjs
- **Database:** MongoDB Atlas
- **AI:** Google Gemini API (`gemini-1.5-flash`), isolated in `server/services/interviewAIService.js`

## Local setup

### 1. Backend
```bash
cd server
cp .env.example .env   # fill in MONGODB_URI, JWT_SECRET, GEMINI_API_KEY
npm install
npm run dev             # starts on http://localhost:5000
```
Sanity check: `GET http://localhost:5000/api/health` should return
`{ "success": true, "data": { "status": "ok", ... } }`.

### 2. Frontend
```bash
cd client
cp .env.example .env
npm install
npm run dev             # starts on http://localhost:5173
```

## Folder structure
See SAD v2.0 Section 11 for the authoritative folder structure. This
scaffold matches it exactly — empty directories contain a `.gitkeep`
placeholder until their module is implemented.

## Documentation
- `SRS v3.3` — functional requirements, source of truth for scope
- `SAD v2.0` — architecture, API contracts, data model, sequence diagrams

Where implementation and documentation conflict, SAD v2.0 governs, per its
Document Control section. Any conflict discovered during implementation is
flagged explicitly rather than resolved silently.

## Known infrastructure risk (flagged, not yet resolved)
SAD Section 5.1 specifies a persistent disk on Render/Railway for resume
uploads. Render's free/starter tiers do not include persistent disk by
default — files written to `server/uploads/` may not survive a redeploy
unless a paid disk add-on is provisioned or storage is moved to an external
service (S3/Cloudinary). Decide before the Auth module's resume-upload
endpoint goes to production.
