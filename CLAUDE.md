# SYLLABRIX — Project Instructions for Claude Code

## Project Overview
Syllabrix is India's first complete education ecosystem platform (ages 5+). AI-powered education with social networking, career exploration, exam prep, virtual labs, and 574+ profession simulations.

## Commands
- `cd server && npm run dev` — Start backend on port 5000
- `cd client && npm run dev` — Start frontend on port 3000
- `cd server && node src/database/migrate.js` — Run database migrations
- `npm test` — Run tests (in server/ or client/)

## Tech Stack
- **Frontend:** Next.js 14 (App Router), Tailwind CSS, Lucide icons
- **Backend:** Express.js, MySQL (Aiven), JWT auth, Socket.io
- **AI:** Gemini 2.5 Flash (primary), Groq/Together/Cohere (fallback)
- **Media:** Cloudinary
- **Deploy:** Vercel (frontend) + Railway (backend)

## Architecture
```
client/src/app/(dashboard)/     — All dashboard pages
client/src/app/(auth)/          — Sign-in, sign-up, forgot-password
client/src/app/complete-profile/ — Profile wizard after signup
client/src/components/layout/   — Sidebar, TopBar, MobileNav
client/src/components/feed/     — CreatePostBox, PostCard
client/src/components/ai/       — SpeakButton, MathRenderer, DiagramRenderer, MapView
client/src/contexts/            — AuthContext (useAuth hook)
client/src/lib/api/             — API client files (postsAPI, aiAPI, etc.)
client/src/lib/api-client.js    — Axios instance with JWT interceptor

server/src/features/            — 36 feature modules (auth, posts, ai, etc.)
server/src/services/ai.service.js — Gemini/Groq/Together/Cohere fallback chain
server/src/middleware/           — Auth, validation, rate limiting
server/src/database/             — Connection pool, migration runner
server/src/config/env.js         — Environment variable loader

database/migrations/             — 65 SQL migration files
shared/                          — Shared constants, validation, utils
```

## CRITICAL Conventions (NEVER violate)
1. **Pages:** ALWAYS in `client/src/app/(dashboard)/page-name/page.jsx`
2. **Auth:** ALWAYS use `useAuth()` hook. NEVER prop-drill auth data.
3. **User field:** `user.username` — NEVER `user.first_name`
4. **HTTP:** ALWAYS use `client/src/lib/api-client.js` (axios). NEVER use raw `fetch()`
5. **API exports:** Use CAPITAL names — `postsAPI`, `aiAPI`, `prepAPI`, `paymentsAPI`, `uploadAPI`
6. **Post creation:** MUST include `post_type: 'regular'` in create payload
7. **File upload:** `uploadAPI.single(file)` takes raw File object (builds FormData internally)
8. **Sidebar:** Width `w-[220px]`, dashboard margin `md:ml-[220px]`
9. **Logo:** `/images/logo/syllabrix-logo.png` (also has -white variant)
10. **AI model:** `gemini-2.5-flash` — configured in `server/.env.development` as `GEMINI_API_KEY`
11. **Background:** Dashboard uses `bg-[#F0F2F5]` (Facebook-grade gray)
12. **Card shadows:** `shadow-[0_1px_2px_rgba(0,0,0,0.1)]` on all cards
13. **Border radius:** `rounded-xl` (12px) on cards, `rounded-lg` (8px) on buttons
14. **Font sizes:** 13px body, 12px secondary, 10px labels, 9px micro
15. **Hover color:** `hover:bg-[#F0F2F5]` on interactive elements

## Database
- **Host:** mysql-267b741c-adarshksingh369-891a.a.aivencloud.com
- **Port:** 28164
- **DB:** defaultdb
- **User:** avnadmin
- **SSL:** required (`DB_SSL=true`)
- **Tables:** 64+ (users, posts, comments, likes, follows, messages, etc.)

## Sensitive Professions (NO practical activities)
Doctor, Surgeon, Dentist, Nurse, Pharmacist, Electrician, Plumber, Welder, Mechanic, Pilot, Army/Navy/Police Officer, Firefighter, Nuclear/Chemical Engineer — knowledge-only modules for these.

## QA Test Accounts
- student: aarav@qa.syllabrix.com / Test@1234
- teacher: meera@qa.syllabrix.com / Test@1234
- institute: dps@qa.syllabrix.com / Test@1234
- parent: parent.sharma@qa.syllabrix.com / Test@1234

## Current Status (22-Point Spec)
### Working: Auth, Feed, AI Buddy, Mind Map, Career Explorer, Newsroom, Virtual Lab, Mock Interview, Debate Arena, Arcade (4 games), Clips
### Needs Polish: Experience Lab, PrepSmart, Jobs, Code Lab, Mentorship
### Not Built: Requirements Marketplace, Animated Videos, SAP/Fitness, Library, Real Classroom (WebRTC)

## What NOT to do
- NEVER overwrite `tailwind.config.js` or `globals.css` entirely
- NEVER change the auth pattern (useAuth hook)
- NEVER use `npx create-next-app` — the client/ folder exists
- NEVER remove existing API endpoints — only add new ones
- NEVER change database column names on existing tables — only ADD columns
- NEVER mention any AI provider name (Gemini, Groq, etc.) on the frontend
