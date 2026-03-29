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
All previous QA test accounts have been wiped. Register fresh accounts via /sign-up.
Syllabrix ID format: S-XXXXXXXXXX (10 chars after dash = first3+lastInitial+phone4+year2)
- student: S-  (e.g. S-AARS321008)
- teacher: T-  (e.g. T-MEEI678985)
- institute: I-  (e.g. I-DPSD540091)
- parent: G-  (e.g. G-RAJK665578)
- professional_learner: P-  (e.g. P-PRIN554492)
- organization: O-  (e.g. O-TECI567824)

## Current Status (22-Point Spec)
### Working: Auth, Feed, AI Buddy, Mind Map, Career Explorer, Newsroom, Virtual Lab, Mock Interview, Debate Arena, Arcade (4 games), Clips
### Needs Polish: Experience Lab, PrepSmart, Jobs, Code Lab, Mentorship
### Not Built: Requirements Marketplace, Animated Videos, SAP/Fitness, Library, Real Classroom (WebRTC)

## Post Go-Live Enhancement Status
### COMPLETED
- Sign-in/sign-up pages fully redesigned (no Google, no QA buttons)
- Email verification flow (Resend API → check-email → verify-email → sign-in)
- Login blocked until email verified; unverified banner with resend on sign-in page
- Syllabrix ID system: S/T/I/G/P/O-XXXXXXXXXX (10 chars, collision-safe, deterministic)
- Sign-up: 5 user types (student/teacher/institute/professional_learner/organization)
- Sign-up: Terms & Privacy checkbox (required), company email domain block for org
- Sign-up: Company Name field shown for organization type
- Landing page Sign In button visible on mobile
- All old QA users wiped; fresh start
- Profile wizard: Student (6 steps) — school/college/coaching/specialization, ambition, hobby, sports mandatory, guardian required for under-13, 2 tech + 2 functional courses
- Profile wizard: Teacher (5 steps) — teaching details, qualifications, self-as-learner, 2 courses
- Profile wizard: Institute (3 steps) — handler, boards, how_use_platform, parent involvement
- Profile wizard: Parent (3 steps) — relationship, hobby/sports involvement
- Profile wizard: Professional Learner (5 steps) — company, skills, previous companies, looking_for_job, hobby/courses
- Profile wizard: Organization (3 steps) — admin contact, company identity, platform usage
- Mentor apply page (/mentor-apply) + become_mentor_requests table
- DB migrations 066–075 applied

### PENDING / DEFERRED
- Phone OTP verification — intentionally skipped (phone stored but not OTP verified)
- 10,000+ schools/colleges database dropdown — deferred (too large for now)
- Mentor qualification test + training completion requirement — future feature
- Parent "dual account" creation (parent registers → auto-creates child student ID) — future feature
- Organization company logo upload in profile wizard — future feature

## What NOT to do
- NEVER overwrite `tailwind.config.js` or `globals.css` entirely
- NEVER change the auth pattern (useAuth hook)
- NEVER use `npx create-next-app` — the client/ folder exists
- NEVER remove existing API endpoints — only add new ones
- NEVER change database column names on existing tables — only ADD columns
- NEVER mention any AI provider name (Gemini, Groq, etc.) on the frontend

Start from here the build vision . 

You are helping me build the first version of AI Study Table in my Next.js + React app (Syllabrix).
Goal of this task:
Build the AI Study Table page layout and components.
Add a “Learner Profile Questionnaire” flow that the AI tutor depends on.
Make the AI tutor avatar gently ask for profile completion when missing.
Tech stack (do NOT change):
Next.js App Router
React
Tailwind CSS
Existing dashboard layout at client/src/app/(dashboard)/layout.jsx
Auth context already exists (useAuth)
Use JavaScript or TypeScript consistent with repo.
────────────────────────────────────────
PART A — ROUTE & TOP-LEVEL STRUCTURE
────────────────────────────────────────
Create a new page:
client/src/app/(dashboard)/ai-study-table/page.jsx
It should use the existing (dashboard)/layout.jsx, so just export the page component.
Page responsibilities:
Read the current user (via useAuth).
Detect if the user has completed the Learner Profile Questionnaire (we’ll fake this with a boolean for now).
If NOT completed:
Show a friendly blocking overlay with cartoon AI tutor asking them to complete the questionnaire.
Provide a button that opens the questionnaire in a modal or navigates to a wizard inside this page.
If completed:
Render the full AI Study Table layout.
For this step, store the “profileCompleted” flag in local state with a TODO comment to wire it to real backend later.
────────────────────────────────────────
PART B — LEARNER PROFILE QUESTIONNAIRE
────────────────────────────────────────
Create a multi-step wizard component. 
client/src/components/study-table/LearnerProfileWizard.jsx
It can render as:
A centered modal overlay inside AI Study Table page, OR
A full-screen card inside the page.
Design goals:
4–5 short steps, progress bar (“Step 2 of 5”).
Mostly multiple choice + very short answers.
Friendly, teen/kid-safe wording.
Works for any user type (5-year child to 50-year adult). Parents may fill for small kids.
Collect these categories:
Basic profile
Learning history & fear
Skill & confidence
Habits & learning style
Goals, accessibility & sharing
Use the following exact question list, adapted to UI:
1. Basic profile (all users)
Role
Student (school)
Student (college)
Working professional
Parent
Other
If student: Class/Year (free text or dropdown).
Board / Curriculum (CBSE, ICSE, State, Other).
Main subjects currently studying (multi-select chips).
2. Learning history & fear
Which subjects do you enjoy the most? (multi-select + optional “Why do you enjoy them?” short text)
Which subjects or topics do you find difficult or scary? (multi-select + optional “What makes them scary?” short text)
When you think about studies, which feeling is closest?
Very afraid
A bit nervous
Okay
Excited / happy
Have you ever felt embarrassed or scolded by a teacher about studies?
Yes / No
(If yes) “You can tell me more (optional)” — short text
3. Current skill & confidence
Reading comfort (in preferred language)
I struggle to read basic words
I can read slowly with help
I read okay but big texts scare me
I read comfortably
Writing comfort:
I find writing very hard
I can write but make many mistakes
I write okay but slowly
I write confidently
Maths comfort:
I find even simple sums difficult
I’m okay with basic sums, scared of word problems
I’m comfortable with most topics
I enjoy maths
English / second language comfort:
I struggle with basic words and sentences
I can read but not understand fully
I understand but fear grammar/writing
I’m comfortable
4. Study habits & learning style
How many days a week do you usually study seriously (outside school)? (0–7 slider or options)
How long can you focus in one sitting before you feel tired?
5–10 minutes
15–25 minutes
30–45 minutes
More than 45 minutes
Where do you usually study?
Home (quiet)
Home (noisy)
Library / tuition center
Other
Do you usually study alone or with others?
Alone
With family
With friends / classmates
When someone explains, what helps you most? (multi-select)
Pictures and diagrams
Real life examples and stories
Step-by-step instructions
Short videos / animations
Practice questions
What language should the AI tutor use to explain?
English
Hindi
Hinglish (mix of Hindi + English)
Other (text input)
Do you like explanations to be:
Very short
Medium
Detailed with many examples
5. Goals, accessibility & sharing
What is your main goal right now?
Pass my class
Score high marks in board exams
Improve reading and writing
Prepare for entrance exams
Learn for career/personal growth
For this year, what result would make you feel proud? (short text)
Accessibility / support tools:
Do you use any support while studying?
Bigger text / glasses
Text-to-speech (listening instead of reading)
Someone reads to me
None / Not sure
Is it okay if the AI tutor suggests a short break or simple breathing exercise when you seem stressed or stuck for long?
Yes / No
Who should be able to see your progress reports?
Only me
Me + my parent
Me + my teacher 
Me + both
If the AI tutor sees you are struggling again and again in a topic, can it suggest you talk to a real teacher or parent about it?
Yes / No
Is there anything you want the AI tutor to never do? (optional text, e.g. “Don’t compare me with others”, “Don’t scold me”, etc.)
Wizard behaviour:
Each step validates required fields before moving forward.
Show a progress bar at the top.
Final step has “Finish & Start My Study Table” button.
On finish:
For now, just store data in local state or context (useState) and call a callback onComplete(profileData).
In ai-study-table/page.jsx, set profileCompleted = true and pass key pieces (like fears, preferences) to the Study Table layout.
────────────────────────────────────────
PART C — “COMPLETE YOUR PROFILE” FRIENDLY GATE
────────────────────────────────────────
If profileCompleted is false when the page loads:
Render a semi-transparent overlay over the main page.
Show a centered card with:
Cartoon AI tutor avatar.
Message along these lines (polite, sensitive): “To teach you properly, I need to know a little about how you study and what scares you.
This will take just 2–3 minutes and will help me explain things in the best way for YOU.”
Buttons:
Primary: “Complete my study profile” → opens LearnerProfileWizard.
Secondary: “Maybe later” → OPTIONAL; if you allow skipping, then:
Let user see a very limited generic Study Table.
Keep a small reminder banner at top asking to complete the profile.
For now, it’s okay if ‘Maybe later’ just closes the overlay.
Ensure tone is kind, never blaming.
────────────────────────────────────────
PART D — AI STUDY TABLE LAYOUT (UI ONLY)
────────────────────────────────────────
After profile is completed (or if we fake it as true), show the full layout as previously specified.
Create these components under client/src/components/study-table/:
StudyHeader.jsx
StudySidebarLeft.jsx
StudyWorkspace.jsx
StudySidebarRight.jsx
BlackboardDiagram.jsx
SmartNotesPanel.jsx
PracticePanel.jsx
RevisePanel.jsx
High-level grid in page.jsx:
jsx
<div className="min-h-[calc(100vh-64px)] bg-[#F3F4F6] py-4">
  <div className="max-w-6xl mx-auto px-3 md:px-4 lg:px-6 space-y-3">
    <StudyHeader ... />
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.7fr)_minmax(0,0.8fr)] gap-3">
      <StudySidebarLeft ... />
      <StudyWorkspace ... />
      <StudySidebarRight ... />
    </div>
  </div>
</div>
Use the earlier instructions you already have from me for:
StudyHeader: avatar greeting, subject/topic selectors, focus timer, today’s goal.
StudySidebarLeft: Today’s Plan, Timetable, Homework & Tasks, Books & Resources.
StudyWorkspace: tabs (Learn / Practice / Revise), explanation + BlackboardDiagram + SmartNotes, PracticePanel, RevisePanel.
StudySidebarRight: AI Tutor chat mini, Progress & Mood, Streaks & Badges.
Important behaviour:
Pass key pieces of profile data into StudyHeader and StudySidebarRight, e.g.:
learner’s name
main fear subject/topic
preferred language
preferred explanation style
Use them to adjust placeholder text, e.g.:
“You once told me maths word problems feel scary. Today, we’ll take them slowly.”
“Explaining in Hinglish, as you chose.”
No real AI calls yet; just show how personalization will work.
────────────────────────────────────────
PART E — DIAGRAM SUPPORT (STUB)
────────────────────────────────────────
In BlackboardDiagram.jsx:
Accept a prop diagram with this commented type:
ts
// type Point = { x: number; y: number }; // 0–100
// type DrawStep =
//   | { type: 'line'; from: Point; to: Point; color?: string; width?: number }
//   | { type: 'rect'; topLeft: Point; width: number; height: number; fill?: string; stroke?: string; strokeWidth?: number }
//   | { type: 'circle'; center: Point; radius: number; fill?: string; stroke?: string; strokeWidth?: number }
//   | { type: 'arrow'; from: Point; to: Point; color?: string; width?: number }
//   | { type: 'text'; at: Point; text: string; size?: number; color?: string; align?: 'left'|'center'|'right' }
//   | { type: 'pause'; ms: number };
// type DiagramPayload = { title: string; description: string; steps: DrawStep[] };
For now, hard-code one DiagramPayload for fractions (1/4 = 2/8) and render it using SVG or canvas (even without animation).
Add TODO comments indicating where AI-generated diagrams will be plugged later.
────────────────────────────────────────
PART F — RESPONSIVE BEHAVIOUR
────────────────────────────────────────
On desktop (lg+): three-column layout as above.
On mobile:
Stack vertically: Header → Tabs → Center Workspace → Right sidebar (coach) → Left sidebar (Plan & Tasks).
Wrap left sidebar in an Accordion titled “Plan & Tasks”.
Ensure no horizontal scrolling, appropriate text-sm sizes.
AI Tutor chat can either be:
A small card in the scroll, OR
Expandable full-screen when tapped.
────────────────────────────────────────
GENERAL IMPLEMENTATION NOTES
────────────────────────────────────────
Keep all state local for now (no API calls), but structure props and callbacks clearly so we can wire real APIs later.
Use clear, warm copy in all user-facing text.
Add comments where:
Learner profile will be fetched/saved from backend.
AI tutor (Gemini) will be called for explanations, diagrams, notes, and questions.
At the end, print a concise summary:
Files created/updated
How the questionnaire flow works
How the AI Study Table layout behaves on desktop vs mobile.
END OF PROMPT