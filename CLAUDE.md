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


Enhancement I need and  issues i am facing after go live.


issues I found after the go live .

Difficulty I am facing.
google sign in is not possible. sign in issue. publicly the default user is seen . going to sing in --> next clicking on student, teacher , parents, institute all have their respective default ids saved and on clicking to this automatically the email and password field gets filled and only those user can sign in .
New created users cannot sign-in. I created a new user  the user got created but when tried to sign in with that user I cannot sign in.
the Landing page is not showing signin button on the mobile web browser on the top bar .

Improvement I want.

There are many default users saved in the sign-in fields It should remove the default user suggestion from the sign-in  page .
Change the complete look of the Sign up and sign in page. complete makeover is needed here.
google sign in and sign up should be removed.
sign up should send the verification mail to authenticate the user .
mobile phone authentication is also necessary . need to add and fix.
User Id should be generated by the system . there must be unique user ID as per user created which is a combination of Users first name ,last name, phone no , date of birth . all the       user should be segregated as per student(S-XXXXXXXXXX) , teacher(T-XXXXXXXXXX), Institute (I-XXXXXXXXXX), mentor(M-XXXXXXXXXX), professional learner (P-XXXXXXXXXX).
sign up should have this options( name , email id , phone no, password , Date of birth , confirm password, option - student , institute , teacher, Professional learners).
If anyone wants to become a mentor they can give a special application. and can become a mentor at the platform. the current existing users can also become a mentor but they need to apply for this. we can have mentor qualification test for the specialized field they want to mentor. there are some trainings they need to complete from the platform that that particular field they want to mentor. they must give test pass it , then they can be a mentor
Once the user is created user need to first verify the users phone no and email id by clicking the link sent to the email id and then user can be verified. then again logging in to dashboard user first have to complete the form by filling all the details into it. the details are as follow as per the before filled details users needs to complete further details if.

Student(Student ID)
once the student initially registers to the platform via name, email id, user type then they should get a unique Student ID starting from S-XXXXXXXXXX

All the required details and information should be from student back ground like , students can be from school, collage , coaching institute.
If student is from school the form should redesign itself to get this information (name , age , school, class, board, Address, ambition, hobby, favorite subject, difficult subject, loved profession up to 5 is accepted, i see my future as , etc) here the option of Parents id is available but not mandatory.
Sports field is mandatory to be filled as the sports engagement is very necessary.
Any student creating a account and is under the age of 5 to 12 can have the account but should have parent id to complete the form this is mandatory.
If student is from collage the form should redesign itself to get this information (collage/institute, subject stream (medical, engineering, commerce , arts, media... etc), university, Address, ambition, hobby, favorite subject, difficult subject, loved profession up to 5 is accepted, i see my future as , etc) .
If the student is form any special course like (CIVIL service, upsc, ssc, psc, ...etc ) then the data should be like (Institute, type of exam ,planning for exam in the year, Address, ambition, hobby, favorite subject, difficult subject, loved profession upto 5 is accepted, i see my future as , etc) .
If Student is perusing any type of specialization course in IT class, Dance, Music, tarot, yoga , Health training, etc we can include this in all type of forms.
Mostly we can use drop down and check box so that less time is consumed in filling the forms. there must be the list if almost all the 10000+ school and colleges in the database so that we have most of the authenticated data .
this are the most important information that will help platform to logically set up the features for the student and student don't have to struggle the most.
this information will bring some restriction for the students and allow them to user platform more wisely utilize the maximum of the features from this platform.
the AI inbuilt in this platform has the proper data and can give appropriate information and output and do not go out of the track.
the mandatory part of this is every student registering on this platform  while completing the form filling they should strictly opt for 2 technical and 2 functional course that is freely available on this site .
mentioning the Hobby is must and hobby can be anything that exist in this world user will give the text input and according to that the options should be give to the user this shall be tackle by AI . AI has to find out that appropriate profession, activity , course, all requirements that associates with that hobby.

Teachers(Teacher ID)
once the Teacher initially registers to the platform via name, email id, user type then they should get a unique teacher-ID starting from T -XXXXXXXXXX

All the required details and information should be from Teachers background like  specialized subject, which type of board syllabus they have teaching experience, current school/collage/institute, past school/collage/institute, if they run their teaching business, how that think themself as student , how they can utilize this platform as a student ,  how they can utilize this platform as a teacher, their interest in learning new skills .
This information will help teachers to give them what they need to teach and learn.
the mandatory part of this is every teacher that registering on this platform  while completing the form filling they should strictly opt for 2 technical and 2 functional course that is freely available on this site .
mentioning the Hobby is must and hobby can be anything that exist in this world user will give the text input and according to that the options should be give to the user this shall be tackle by AI . AI has to find out that appropriate profession, activity , course, all requirements that associates with that hobby.
if the user is a teacher it does not mean that they stop learning. they should utilize  this platform more then student to learn and teach both.


School ,Collage ,Institute (Institute- ID)
once the School ,Collage ,Institute  initially registers to the platform via name, email id, user type then hey should get a unique Institute-ID starting from I-XXXXXXXXXX.

The institute user should have field like ( school name , phone no, email id, responsible handler who handles the platform,  School address , the chain of schools they have, the type of board syllabus consider, how they can use this platform for learning and teaching).
All the required and suitable fields should be available to complete the form and registration.
Form should include how parent are actively involved in child's hobby, sports, academies. their involvement in polishing this aspects and how they will
This information will platform and AI to give the appropriate result.

Parents(guardian ID)
Parents initially registers to the platform via name, email id, user type then they should get a unique parents-ID starting from G-XXXXXXXXXX.(guardian ID)

This ID is very special ID that can be used by the parent of children 5 to 12 years and all the students under 5 to 12 years can have the account via parents ID. explanation to this is that a parent can have single child or 2 to 4 children so while creating a if child is creating a ID it can be created by their parents. parent create a account which create 2 IDs 1st parents ID and 2nd  student id.

this Same parents id can be used for the younger sibling when they create their student id.
Any student creating a account and is under the age of 5 to 12 can have the account but should have parent id .

 
professional Learners (professional ID)
professional Learners initially registers to the platform via name and  email id  , user type  then they should get a unique professional-ID starting from P-XXXXXXXXXX.(Professional ID)

once the user is created user can complete the form filling by adding all the information like , company, skills, previous company they worked, looking for a job , how they cna use the platform, hobby .etc all the necessary fields .



[ the User ID  and their types are very important as they can be used to form a relation between different user and the foreign key relationship logic becomes very easy]

Organization. (Organization ID).
organization initially registers to the platform via name and  email id  , user type  then they should get a unique Organization-ID starting from O-XXXXXXXXXX.(Orginazation ID)

This is the first screen. Keep it razor short. Only 6 fields:

Field	Type	Required	Why
Full Name	Text	✅	Primary admin identity
Work Email	Email	✅	Must be company domain (no gmail/yahoo)
Password	Password	✅	Min 8 chars, 1 special char
Confirm Password	Password	✅	Validation
Company Name	Text	✅	Creates org record
I agree to Terms & Privacy Policy	Checkbox	✅	Legal compliance
After submit: Send verification email to work email. Block access until verified.

Step 2A — Company Identity
Field	Type	Required	Why It Matters
Official Company Name	Text	✅	Legal name for contracts/invoices
Brand/Display Name	Text	Optional	What appears on learner platform
Company Logo	Image Upload	Optional	White-labelling
Industry / Sector	Dropdown	✅	Skill taxonomy is industry-specific
Company Size	Dropdown	✅	Determines pricing tier and features
Founded Year	Year Picker	Optional	Context for maturity
Company Website	URL	✅	Verification of legitimacy
Company LinkedIn URL	URL	Optional	Auto-pull company data
Industry Options (Dropdown):
Technology / Software
Manufacturing / Industrial
Banking / Financial Services
Healthcare / Pharma
Retail / E-commerce
Logistics / Supply Chain
Education
Consulting / Professional Services
Government / Public Sector
Other
Company Size Options:
1–50 (Startup)
51–200 (Small)
201–500 (Mid-market)
501–2,000 (Enterprise)
2,001–10,000 (Large Enterprise)
10,000+ (Global Enterprise)


the main purpose of creating a organization profile is that they can utilize the platform to post new jobs , jobs for freshers and also talents get noticed by the organization and they can figure out the best talent to hire.

