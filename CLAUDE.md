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

need to start form here 


Build the complete competitive exam + private publisher database 
for Syllabrix AI Library. No shortcuts, fully dynamic, production-ready.

═══════════════════════════════════════════════════
STEP 1: MIGRATION FILES
═══════════════════════════════════════════════════
Create in database/migrations/phase-session2/ 
continuing from 087 (next is 088):

── 088_create_publishers.sql ──
CREATE TABLE publishers (
  id                  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name                VARCHAR(200) NOT NULL,
  short_name          VARCHAR(50),           -- 'S.Chand', 'Arihant'
  focus_area          VARCHAR(300),          -- 'School + Competitive'
  website             VARCHAR(300),
  amazon_search_url   VARCHAR(500),          -- for affiliate links
  flipkart_search_url VARCHAR(500),
  partnership_status  ENUM('none','contacted','licensed') DEFAULT 'none',
  is_active           TINYINT(1) DEFAULT 1,
  created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

── 089_create_exam_categories.sql ──
CREATE TABLE exam_categories (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code          VARCHAR(50) UNIQUE NOT NULL,  -- 'UPSC','JEE','NEET','SSC','BANKING','NDA'
  name          VARCHAR(200) NOT NULL,
  type          ENUM('school','engineering','medical',
                     'civil_services','banking','ssc',
                     'defence','state_psc','other') NOT NULL,
  level         ENUM('national','state') DEFAULT 'national',
  state         VARCHAR(100) NULL,            -- for state PSC only
  conducting_body VARCHAR(200),              -- 'UPSC', 'NTA', 'SSC Board'
  official_website VARCHAR(300),
  is_active     TINYINT(1) DEFAULT 1,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

── 090_create_competitive_subjects.sql ──
CREATE TABLE competitive_subjects (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  exam_category_id INT UNSIGNED NOT NULL,
  name            VARCHAR(200) NOT NULL,      -- 'Modern History', 'Physical Geography'
  parent_subject  VARCHAR(100),              -- 'History', 'Geography', 'Physics'
  sub_category    VARCHAR(100),              -- 'Ancient', 'Medieval', 'Modern'
  description     TEXT,
  syllabus_url    VARCHAR(300),              -- official exam syllabus link
  weightage_percent DECIMAL(5,2),            -- % in that exam
  is_active       TINYINT(1) DEFAULT 1,
  FOREIGN KEY (exam_category_id) REFERENCES exam_categories(id) ON DELETE CASCADE
);

── 091_create_competitive_books.sql ──
CREATE TABLE competitive_books (
  id                    INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  publisher_id          INT UNSIGNED NOT NULL,
  competitive_subject_id INT UNSIGNED NULL,   -- NULL = general/multi-subject
  title                 VARCHAR(500) NOT NULL,
  author                VARCHAR(300),
  edition               VARCHAR(50),
  publication_year      YEAR,
  is_copyrighted        TINYINT(1) DEFAULT 1,
  is_available_free     TINYINT(1) DEFAULT 0,
  google_books_id       VARCHAR(100),
  open_library_id       VARCHAR(100),
  amazon_affiliate_url  VARCHAR(500),
  flipkart_affiliate_url VARCHAR(500),
  google_books_preview_url VARCHAR(300),
  cover_image_url       VARCHAR(300),
  priority_rank         TINYINT UNSIGNED DEFAULT 1, -- 1=must read, 2=recommended, 3=optional
  usage_tip             TEXT,               -- "Read after NCERT", "Only for advanced"
  is_active             TINYINT(1) DEFAULT 1,
  created_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (publisher_id) REFERENCES publishers(id),
  FOREIGN KEY (competitive_subject_id) REFERENCES competitive_subjects(id)
);

── 092_create_book_exam_links.sql ──
-- Many-to-many: one book can serve multiple exams
CREATE TABLE book_exam_links (
  id                INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  competitive_book_id INT UNSIGNED NOT NULL,
  exam_category_id  INT UNSIGNED NOT NULL,
  relevance         ENUM('primary','secondary','supplementary') DEFAULT 'primary',
  FOREIGN KEY (competitive_book_id) REFERENCES competitive_books(id) ON DELETE CASCADE,
  FOREIGN KEY (exam_category_id) REFERENCES exam_categories(id) ON DELETE CASCADE,
  UNIQUE KEY unique_book_exam (competitive_book_id, exam_category_id)
);

── 093_alter_books_add_competitive_fields.sql ──
-- Extend existing school books table for competitive context
ALTER TABLE books 
  ADD COLUMN publisher_id INT UNSIGNED NULL,
  ADD COLUMN exam_category_id INT UNSIGNED NULL,
  ADD COLUMN priority_rank TINYINT UNSIGNED DEFAULT 1,
  ADD COLUMN affiliate_link VARCHAR(500) NULL,
  ADD COLUMN google_books_preview_url VARCHAR(300) NULL,
  ADD FOREIGN KEY (publisher_id) REFERENCES publishers(id),
  ADD FOREIGN KEY (exam_category_id) REFERENCES exam_categories(id);

═══════════════════════════════════════════════════
STEP 2: SEED FILES
═══════════════════════════════════════════════════
Create in server/src/database/seeds/

── publishers.seed.js ──
Seed ALL publishers below (INSERT IGNORE, idempotent):

SCHOOL PUBLISHERS:
1.  S. Chand & Company — focus: School + Competitive — website: schandpublishing.com
2.  R.S. Aggarwal (S. Chand) — focus: Mathematics + Reasoning
3.  R.D. Sharma (Dhanpat Rai) — focus: School Mathematics
4.  Wren & Martin (S. Chand) — focus: English Grammar
5.  Sumita Arora (Dhanpat Rai) — focus: Computer Science
6.  Lakhmir Singh (S. Chand) — focus: School Science
7.  Trueman's (Trueman Publication) — focus: Biology

COMPETITIVE PUBLISHERS:
8.  Arihant Publications — focus: All competitive exams — website: arihantbooks.com
9.  Disha Publications — focus: UPSC + State PSC + Banking
10. MTG Learning Media — focus: NEET + JEE + Olympiad
11. Cengage Learning India — focus: JEE Advanced
12. DC Pandey (Arihant) — focus: Physics (JEE/NEET)
13. HC Verma (Bharati Bhawan) — focus: Physics Concepts
14. Bharati Bhawan — focus: School + Competitive
15. Lucent Publications — focus: GK + SSC + Banking
16. Kiran Prakashan — focus: SSC + Banking
17. Rakesh Yadav Readers — focus: SSC Mathematics
18. Spectrum Books — focus: Modern History (UPSC)
19. Shankar IAS Academy — focus: Environment + UPSC
20. Vision IAS — focus: UPSC Current Affairs + GS
21. Insights IAS — focus: UPSC
22. Unique Publications — focus: GPSC + Gujarat State PSC
23. Target Publications — focus: MPSC + Maharashtra
24. Sura Books — focus: TNPSC + Tamil Nadu
25. Sapna Book House — focus: KPSC + Karnataka
26. GC Leong (ELBS/Longman) — focus: Geography
27. Orient BlackSwan — focus: History + Social Science
28. TMH (Tata McGraw Hill) — focus: UPSC General Studies
29. Vajiram & Ravi — focus: UPSC coaching notes
30. Pathfinder Academy — focus: NDA + CDS

── exam_categories.seed.js ──
Seed ALL exam categories:

ENGINEERING:
- JEE_MAIN: Joint Entrance Examination Main — national — NTA
- JEE_ADV: Joint Entrance Examination Advanced — national — IIT
- BITSAT: BITS Admission Test — national — BITS Pilani
- VITEEE: VIT Engineering Entrance — national
- MHT_CET: Maharashtra CET Engineering — state — Maharashtra

MEDICAL:
- NEET_UG: National Eligibility cum Entrance Test UG — national — NTA
- AIIMS: AIIMS MBBS (now merged with NEET) — national
- JIPMER: JIPMER MBBS — national

CIVIL SERVICES:
- UPSC_IAS: UPSC Civil Services (IAS/IPS/IFS) — national — UPSC
- UPSC_CDS: Combined Defence Services — national — UPSC
- UPSC_CAPF: Central Armed Police Forces — national — UPSC

STATE PSC:
- GPSC: Gujarat Public Service Commission — state — Gujarat
- MPSC: Maharashtra Public Service Commission — state — Maharashtra
- UPPSC: Uttar Pradesh PSC — state — Uttar Pradesh
- TNPSC: Tamil Nadu PSC — state — Tamil Nadu
- KPSC: Karnataka PSC — state — Karnataka
- RPSC: Rajasthan PSC — state — Rajasthan
- BPSC: Bihar PSC — state — Bihar
- MPPSC: Madhya Pradesh PSC — state — Madhya Pradesh
- WBPSC: West Bengal PSC — state — West Bengal
- HPSC: Haryana PSC — state — Haryana
- PPSC: Punjab PSC — state — Punjab
- APPSC: Andhra Pradesh PSC — state — Andhra Pradesh
- TSPSC: Telangana PSC — state — Telangana

BANKING:
- SBI_PO: SBI Probationary Officer — national — SBI
- IBPS_PO: IBPS PO — national — IBPS
- IBPS_CLERK: IBPS Clerk — national — IBPS
- RBI_GRADE_B: RBI Grade B Officer — national — RBI
- NABARD: NABARD Grade A — national

SSC:
- SSC_CGL: SSC Combined Graduate Level — national — SSC
- SSC_CHSL: SSC Combined Higher Secondary Level — national — SSC
- SSC_GD: SSC GD Constable — national — SSC
- SSC_CPO: SSC Central Police Organisation — national — SSC

DEFENCE:
- NDA: National Defence Academy — national — UPSC
- CDS: Combined Defence Services — national — UPSC
- AFCAT: Air Force Common Admission Test — national — IAF
- MNS: Military Nursing Service — national

── competitive_subjects.seed.js ──
Seed ALL subjects for ALL exam categories:

FOR UPSC_IAS — seed these subjects:
1.  History → Ancient India (sub_category: ancient, weightage: 8%)
2.  History → Medieval India (sub_category: medieval, weightage: 6%)
3.  History → Modern India (sub_category: modern, weightage: 12%)
4.  History → World History (sub_category: world, weightage: 5%)
5.  History → Art & Culture (sub_category: culture, weightage: 8%)
6.  Geography → Indian Geography (sub_category: indian, weightage: 10%)
7.  Geography → World Geography (sub_category: world, weightage: 6%)
8.  Geography → Physical Geography (sub_category: physical, weightage: 5%)
9.  Geography → Human & Economic Geography (sub_category: human, weightage: 4%)
10. Polity → Indian Constitution & Governance (weightage: 15%)
11. Polity → Parliamentary System (weightage: 5%)
12. Economy → Indian Economy (weightage: 12%)
13. Economy → Economic Survey & Budget (weightage: 5%)
14. Environment → Environment & Ecology (weightage: 8%)
15. Science → Science & Technology (weightage: 6%)
16. Ethics → Ethics, Integrity & Aptitude (weightage: 10%)
17. Current Affairs → National & International Events (weightage: 15%)
18. Disaster Management → (weightage: 3%)
19. Internal Security → (weightage: 4%)
20. Social Issues → Social Justice & Welfare (weightage: 5%)

FOR JEE_MAIN + JEE_ADV — seed:
1. Physics → Mechanics (weightage: 25%)
2. Physics → Thermodynamics (weightage: 10%)
3. Physics → Electromagnetism (weightage: 20%)
4. Physics → Optics & Modern Physics (weightage: 15%)
5. Chemistry → Physical Chemistry (weightage: 35%)
6. Chemistry → Organic Chemistry (weightage: 35%)
7. Chemistry → Inorganic Chemistry (weightage: 30%)
8. Mathematics → Algebra (weightage: 30%)
9. Mathematics → Calculus (weightage: 25%)
10. Mathematics → Coordinate Geometry (weightage: 20%)
11. Mathematics → Trigonometry & Vectors (weightage: 15%)

FOR NEET_UG — seed:
1. Physics → full NEET Physics (weightage: 25%)
2. Chemistry → Physical Chemistry (weightage: 12%)
3. Chemistry → Organic Chemistry (weightage: 15%)
4. Chemistry → Inorganic Chemistry (weightage: 8%)
5. Biology → Botany (weightage: 25%)
6. Biology → Zoology (weightage: 25%)

FOR SSC_CGL — seed:
1. Quantitative Aptitude → (weightage: 25%)
2. Reasoning → Verbal & Non-Verbal (weightage: 25%)
3. English → Comprehension & Grammar (weightage: 25%)
4. General Awareness → History, Geography, Polity, Science (weightage: 25%)

FOR BANKING (SBI_PO, IBPS_PO) — seed:
1. Quantitative Aptitude → (weightage: 20%)
2. Reasoning → Logical & Verbal (weightage: 20%)
3. English → (weightage: 20%)
4. General Awareness → Banking + Current Affairs (weightage: 20%)
5. Computer Awareness → (weightage: 10%)
6. Data Interpretation → (weightage: 10%)

FOR NDA/CDS — seed:
1. Mathematics → (weightage: 30%)
2. General Ability → English (weightage: 20%)
3. General Ability → Physics (weightage: 10%)
4. General Ability → Chemistry (weightage: 8%)
5. General Ability → History & Polity (weightage: 12%)
6. General Ability → Geography (weightage: 10%)
7. General Ability → Current Affairs (weightage: 10%)

FOR ALL STATE PSCs (GPSC, MPSC, UPPSC, TNPSC, KPSC, RPSC, BPSC) — seed:
1. General Studies → History (national + state specific)
2. General Studies → Geography (national + state specific)
3. General Studies → Polity
4. General Studies → Economy
5. General Studies → Science & Tech
6. General Studies → Current Affairs
7. State Specific → State History (name dynamically per state)
8. State Specific → State Geography
9. State Specific → State Culture & Heritage
10. State Specific → State Economy & Development

── competitive_books.seed.js ──
Seed ALL books mapped to correct publisher + subject:

PHYSICS BOOKS:
1. "Concepts of Physics Vol 1" — HC Verma — Bharati Bhawan
   → priority_rank: 1, exams: JEE_MAIN, JEE_ADV, NEET_UG
   → usage_tip: "Bible of Physics. Read cover to cover before any other book."
2. "Concepts of Physics Vol 2" — HC Verma — Bharati Bhawan
   → priority_rank: 1, exams: JEE_MAIN, JEE_ADV, NEET_UG
3. "DC Pandey Physics Series" — DC Pandey — Arihant
   → priority_rank: 2, exams: JEE_MAIN, JEE_ADV, NEET_UG
4. "Lakhmir Singh Physics Class 9" — Lakhmir Singh — S.Chand
   → priority_rank: 1, exams: SCHOOL_CBSE
5. "Lakhmir Singh Physics Class 10" — Lakhmir Singh — S.Chand
   → priority_rank: 1, exams: SCHOOL_CBSE
6. "Problems in General Physics" — IE Irodov — Mir Publishers
   → priority_rank: 3, exams: JEE_ADV
   → usage_tip: "Only for JEE Advanced aspirants. Very challenging."

CHEMISTRY BOOKS:
7.  "Physical Chemistry" — P Bahadur — GRB Publishers
    → priority_rank: 2, exams: JEE_MAIN, JEE_ADV
8.  "Organic Chemistry" — MS Chauhan — Balaji Publications
    → priority_rank: 1, exams: JEE_MAIN, JEE_ADV, NEET_UG
9.  "Concise Inorganic Chemistry" — JD Lee — Wiley
    → priority_rank: 2, exams: JEE_ADV
10. "O.P. Tandon Physical Chemistry" — O.P. Tandon — GRB
    → priority_rank: 2, exams: JEE_MAIN, NEET_UG
11. "Lakhmir Singh Chemistry" — Lakhmir Singh — S.Chand
    → priority_rank: 1, exams: SCHOOL_CBSE

MATHEMATICS BOOKS:
12. "Mathematics Class 9" — R.D. Sharma — Dhanpat Rai
    → priority_rank: 1, exams: SCHOOL_CBSE
13. "Mathematics Class 10" — R.D. Sharma — Dhanpat Rai
    → priority_rank: 1, exams: SCHOOL_CBSE
14. "Quantitative Aptitude" — R.S. Aggarwal — S.Chand
    → priority_rank: 1, exams: SSC_CGL, SBI_PO, IBPS_PO, NDA
    → usage_tip: "Standard book for all aptitude exams. Start here."
15. "Fast Track Objective Arithmetic" — Rajesh Verma — Arihant
    → priority_rank: 2, exams: SSC_CGL, SSC_CHSL
16. "Advance Maths" — Rakesh Yadav — Rakesh Yadav Readers
    → priority_rank: 1, exams: SSC_CGL
    → usage_tip: "Best for SSC CGL Tier 2 Mathematics."

BIOLOGY BOOKS:
17. "Trueman's Elementary Biology Vol 1" — Trueman — Trueman Publication
    → priority_rank: 1, exams: NEET_UG, SCHOOL_CBSE
18. "Trueman's Elementary Biology Vol 2" — Trueman — Trueman Publication
    → priority_rank: 1, exams: NEET_UG
19. "MTG Fingertips Biology" — MTG — MTG Learning Media
    → priority_rank: 2, exams: NEET_UG
    → usage_tip: "Best for quick revision and MCQ practice."

HISTORY BOOKS (UPSC):
20. "India's Struggle for Independence" — Bipin Chandra — Penguin
    → priority_rank: 1, subject: Modern India, exams: UPSC_IAS, GPSC, MPSC
    → usage_tip: "Must read for Modern History. Non-negotiable."
21. "Spectrum Modern History" — Rajiv Ahir — Spectrum
    → priority_rank: 1, subject: Modern India, exams: UPSC_IAS, all State PSC
    → usage_tip: "Best single book for Modern History revision."
22. "Medieval India" — Satish Chandra — NCERT/McGraw Hill
    → priority_rank: 1, subject: Medieval India, exams: UPSC_IAS
23. "Ancient India" — R.S. Sharma — NCERT Old
    → priority_rank: 1, subject: Ancient India, exams: UPSC_IAS
24. "Indian Art & Culture" — Nitin Singhania — McGraw Hill
    → priority_rank: 1, subject: Art & Culture, exams: UPSC_IAS, all State PSC
    → usage_tip: "Only dedicated Art & Culture book for UPSC. Must read."
25. "World History" — Jain & Mathur — New Age International
    → priority_rank: 1, subject: World History, exams: UPSC_IAS

GEOGRAPHY BOOKS (UPSC):
26. "Certificate Physical & Human Geography" — GC Leong — Oxford
    → priority_rank: 1, subject: World Geography, exams: UPSC_IAS, all State PSC
    → usage_tip: "Bible of Geography. Read fully before anything else."
27. "Indian Geography" — Majid Husain — McGraw Hill
    → priority_rank: 1, subject: Indian Geography, exams: UPSC_IAS
28. "Geography of India" — Majid Husain — McGraw Hill
    → priority_rank: 1, subject: Indian Geography, exams: UPSC_IAS, GPSC, MPSC

POLITY BOOKS (UPSC):
29. "Indian Polity" — M. Laxmikanth — McGraw Hill
    → priority_rank: 1, subject: Indian Polity, exams: UPSC_IAS, all State PSC
    → usage_tip: "THE Bible of Indian Polity. Read at least twice."
30. "Introduction to Constitution of India" — DD Basu — LexisNexis
    → priority_rank: 2, subject: Indian Polity, exams: UPSC_IAS
31. "Our Parliament" — Subhash Kashyap — NBT
    → priority_rank: 2, subject: Parliamentary System, exams: UPSC_IAS

ECONOMY BOOKS (UPSC):
32. "Indian Economy" — Ramesh Singh — McGraw Hill
    → priority_rank: 1, subject: Indian Economy, exams: UPSC_IAS, all State PSC
    → usage_tip: "Most comprehensive economy book for UPSC."
33. "Indian Economy" — Sanjiv Verma — Unique Publications
    → priority_rank: 2, subject: Indian Economy, exams: UPSC_IAS, GPSC

ENVIRONMENT BOOKS (UPSC):
34. "Environment" — Shankar IAS Academy — Shankar IAS
    → priority_rank: 1, subject: Environment, exams: UPSC_IAS, all State PSC
    → usage_tip: "Most popular environment book. Covers everything for UPSC."

SCIENCE & TECH (UPSC):
35. "Science & Technology" — Ravi Agrahari — McGraw Hill
    → priority_rank: 1, subject: Science & Technology, exams: UPSC_IAS

ETHICS (UPSC):
36. "Lexicon for Ethics" — Chronicle Publications
    → priority_rank: 1, subject: Ethics, exams: UPSC_IAS
37. "Ethics in Governance" — ARC Report
    → priority_rank: 2, subject: Ethics, exams: UPSC_IAS

REASONING BOOKS:
38. "A Modern Approach to Verbal & Non-Verbal Reasoning" — RS Aggarwal — S.Chand
    → priority_rank: 1, exams: SSC_CGL, SBI_PO, IBPS_PO, NDA, CDS
    → usage_tip: "Standard reasoning book. Cover fully."
39. "Analytical Reasoning" — MK Pandey — BSC Publishing
    → priority_rank: 2, exams: SBI_PO, IBPS_PO

ENGLISH BOOKS:
40. "High School English Grammar & Composition" — Wren & Martin — S.Chand
    → priority_rank: 1, exams: SSC_CGL, SBI_PO, SCHOOL_CBSE
    → usage_tip: "Standard English grammar reference. Keep handy."
41. "Objective General English" — SP Bakshi — Arihant
    → priority_rank: 1, exams: SSC_CGL, SBI_PO, IBPS_PO, UPSC_IAS
    → usage_tip: "Best for competitive exam English preparation."

GENERAL AWARENESS:
42. "Lucent's General Knowledge" — Lucent — Lucent Publications
    → priority_rank: 1, exams: SSC_CGL, SSC_CHSL, SBI_PO, NDA
    → usage_tip: "Most popular GK book. Must for any competitive exam."

COMPUTER SCIENCE (School):
43. "Computer Science with Python" — Sumita Arora — Dhanpat Rai
    → priority_rank: 1, exams: SCHOOL_CBSE

DEFENCE BOOKS:
44. "Pathfinder NDA & NA Entrance Examination" — Pathfinder — Arihant
    → priority_rank: 1, exams: NDA
45. "CDS Pathfinder" — Pathfinder — Arihant
    → priority_rank: 1, exams: CDS

STATE PSC SPECIFIC:
46. "GPSC Exam Guide" — Unique Publications
    → priority_rank: 1, exams: GPSC
47. "MPSC Rajyaseva Guide" — Target Publications
    → priority_rank: 1, exams: MPSC
48. "TNPSC Group Exam Guide" — Sura Books
    → priority_rank: 1, exams: TNPSC

═══════════════════════════════════════════════════
STEP 3: API ROUTES
═══════════════════════════════════════════════════
Add to server/src/features/library/library.routes.js:

GET /api/library/exams                        → all exam categories grouped by type
GET /api/library/exams/:examCode              → single exam details
GET /api/library/exams/:examCode/subjects     → all subjects for that exam
GET /api/library/exams/:examCode/books        → all books for that exam (with priority)
GET /api/library/publishers                   → all publishers
GET /api/library/publishers/:id/books         → all books by publisher
GET /api/library/subjects/:subjectId/books    → best books for competitive subject
GET /api/library/books/recommend              → smart book recommendation
  Query params: ?examCode=UPSC_IAS&subject=History&subCategory=Modern&classLevel=beginner

Add to library.service.js — all DB queries for above routes.

GET /api/library/books/recommend logic:
  1. Accept examCode + subject + subCategory + classLevel
  2. Query competitive_books joined with book_exam_links
  3. Filter by exam + subject
  4. Order by priority_rank ASC
  5. Return books with: title, author, publisher, 
     usage_tip, priority_rank, affiliate_link, google_books_preview_url

═══════════════════════════════════════════════════
STEP 4: UPDATE AI PROMPT BUILDER
═══════════════════════════════════════════════════
Update server/src/services/ai-prompt-builder.service.js

Add dynamic book reference injection:
1. When building prompt, call 
   getRecommendedBooks(examCode, subject, subCategory) from library.service.js
2. Inject into SECTION 4 of prompt dynamically from DB
   (not from static config — 100% DB driven)
3. Format as:
   "Recommended books for this topic:
    1. [Book Title] by [Author] — [usage_tip]
    2. ..."

═══════════════════════════════════════════════════
IMPORTANT NOTES:
═══════════════════════════════════════════════════
- All seed files: INSERT IGNORE (idempotent, safe to re-run)
- Follow existing pool/connection pattern from database/connection.js
- Follow existing API response format: { success: true, data: ... }
- Add all new routes to src/routes/index.js under /library
- Migrations numbered 088-093 in phase-session2 folder
- Run order: publishers → exam_categories → competitive_subjects 
  → competitive_books → book_exam_links
- Seed order: publishers.seed.js → exam_categories.seed.js 
  → competitive_subjects.seed.js → competitive_books.seed.js
- console.log('[SEED]') prefix on all seed operations for tracking

Execute all steps completely. Start with Step 1 migrations.