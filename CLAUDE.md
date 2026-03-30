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

Extend the AI Library database with a complete 
Indian University + Higher Education layer.

═══════════════════════════════════════════════
MIGRATIONS (continue from 094)
═══════════════════════════════════════════════

── 094_create_universities.sql ──
CREATE TABLE universities (
  id                INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name              VARCHAR(300) NOT NULL,
  short_name        VARCHAR(50),              -- 'IIT Bombay', 'AIIMS'
  type              ENUM('central','state','deemed','private','iit',
                         'nit','iim','aiims','autonomous') NOT NULL,
  established_year  YEAR,
  location_city     VARCHAR(100),
  location_state    VARCHAR(100),
  country           VARCHAR(50) DEFAULT 'India',
  official_website  VARCHAR(300),
  naac_grade        ENUM('A++','A+','A','B++','B+','B','C','NA') DEFAULT 'NA',
  nirf_rank         SMALLINT UNSIGNED NULL,    -- NIRF ranking
  is_active         TINYINT(1) DEFAULT 1,
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

── 095_create_course_categories.sql ──
CREATE TABLE course_categories (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,   -- 'Engineering', 'Medical', 'Commerce'
  type        ENUM('technical','medical','science','commerce',
                   'arts','law','education','design',
                   'agriculture','management','other') NOT NULL,
  is_active   TINYINT(1) DEFAULT 1
);

── 096_create_courses.sql ──
CREATE TABLE courses (
  id                   INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  course_category_id   INT UNSIGNED NOT NULL,
  name                 VARCHAR(200) NOT NULL,  -- 'Bachelor of Technology'
  short_name           VARCHAR(50),            -- 'B.Tech'
  level                ENUM('certificate','diploma','bachelor',
                            'master','doctorate','integrated') NOT NULL,
  duration_years       TINYINT UNSIGNED,        -- 4 for B.Tech, 2 for M.Tech
  specialization       VARCHAR(200),            -- 'Computer Science', 'Mechanical'
  is_active            TINYINT(1) DEFAULT 1,
  FOREIGN KEY (course_category_id) REFERENCES course_categories(id)
);

── 097_create_university_courses.sql ──
-- Which universities offer which courses
CREATE TABLE university_courses (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  university_id  INT UNSIGNED NOT NULL,
  course_id      INT UNSIGNED NOT NULL,
  intake         SMALLINT UNSIGNED,     -- number of seats
  is_active      TINYINT(1) DEFAULT 1,
  FOREIGN KEY (university_id) REFERENCES universities(id),
  FOREIGN KEY (course_id) REFERENCES courses(id),
  UNIQUE KEY (university_id, course_id)
);

── 098_create_university_subjects.sql ──
-- Semester-wise subjects for each course
CREATE TABLE university_subjects (
  id                    INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  course_id             INT UNSIGNED NOT NULL,
  university_id         INT UNSIGNED NULL,     -- NULL = common across universities
  name                  VARCHAR(200) NOT NULL, -- 'Engineering Mathematics I'
  subject_code          VARCHAR(50),           -- 'MA101'
  semester              TINYINT UNSIGNED,      -- 1-8 for B.Tech
  year                  TINYINT UNSIGNED,      -- 1-4
  subject_type          ENUM('core','elective','lab','project',
                             'internship','audit') DEFAULT 'core',
  credits               TINYINT UNSIGNED,      -- credit hours
  is_common_across_uni  TINYINT(1) DEFAULT 0,  -- same across all universities
  syllabus_body         VARCHAR(100),          -- 'GTU', 'Mumbai University', 'VTU'
  is_active             TINYINT(1) DEFAULT 1,
  FOREIGN KEY (course_id) REFERENCES courses(id),
  FOREIGN KEY (university_id) REFERENCES universities(id)
);

── 099_create_university_books.sql ──
CREATE TABLE university_books (
  id                     INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  publisher_id           INT UNSIGNED NULL,
  university_subject_id  INT UNSIGNED NULL,   -- NULL = multi-subject reference
  title                  VARCHAR(500) NOT NULL,
  author                 VARCHAR(300),
  edition                VARCHAR(50),
  publication_year       YEAR,
  isbn                   VARCHAR(20),
  book_type              ENUM('textbook','reference','lab_manual',
                              'question_bank','notes') DEFAULT 'textbook',
  is_prescribed          TINYINT(1) DEFAULT 0, -- officially prescribed by university
  is_copyrighted         TINYINT(1) DEFAULT 1,
  is_available_free      TINYINT(1) DEFAULT 0,
  google_books_id        VARCHAR(100),
  open_library_id        VARCHAR(100),
  amazon_affiliate_url   VARCHAR(500),
  flipkart_affiliate_url VARCHAR(500),
  google_books_preview_url VARCHAR(300),
  cover_image_url        VARCHAR(300),
  priority_rank          TINYINT UNSIGNED DEFAULT 1,
  usage_tip              TEXT,
  is_active              TINYINT(1) DEFAULT 1,
  created_at             TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (publisher_id) REFERENCES publishers(id),
  FOREIGN KEY (university_subject_id) REFERENCES university_subjects(id)
);

── 100_create_university_book_links.sql ──
-- One book can serve multiple subjects/courses
CREATE TABLE university_book_subject_links (
  id                    INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  university_book_id    INT UNSIGNED NOT NULL,
  university_subject_id INT UNSIGNED NOT NULL,
  relevance             ENUM('primary','reference','supplementary') DEFAULT 'primary',
  FOREIGN KEY (university_book_id) REFERENCES university_books(id),
  FOREIGN KEY (university_subject_id) REFERENCES university_subjects(id),
  UNIQUE KEY (university_book_id, university_subject_id)
);

═══════════════════════════════════════════════
SEEDS
═══════════════════════════════════════════════

── universities.seed.js ──
Seed top 100 Indian universities:

IITs (23): IIT Bombay, Delhi, Madras, Kanpur, 
Kharagpur, Roorkee, Guwahati, Hyderabad, 
BHU, Indore, Mandi, Patna, Jodhpur, Gandhinagar,
Bhubaneswar, Ropar, Tirupati, Dhanbad (ISM),
Palakkad, Varanasi, Jammu, Dharwad, Bhilai

NITs (31): NIT Trichy, Warangal, Surathkal, Calicut,
Allahabad, Rourkela, Jaipur, Surat, Kurukshetra,
Durgapur, Silchar, Hamirpur, and all remaining NITs

AIIMS (8): AIIMS Delhi, Jodhpur, Bhopal, Patna,
Raipur, Rishikesh, Bhubaneswar, Nagpur

Central Universities (20): Delhi University, JNU,
BHU, Hyderabad University, Jadavpur, Pune,
Jamia Millia, AMU, TISS, EFLU

IIMs (21): IIM Ahmedabad, Bangalore, Calcutta,
Lucknow, Kozhikode, Indore, Shillong, Rohtak,
Ranchi, Raipur, Kashipur, Trichy, Udaipur,
Bodhgaya, Amritsar, Nagpur, Sambalpur,
Visakhapatnam, Jammu, Mumbai, Sirmaur

Top Deemed/Private: 
BITS Pilani/Goa/Hyderabad, VIT Vellore/Chennai,
Manipal, SRM, Amity, Symbiosis, Christ University,
Lovely Professional, Chandigarh University,
NMIMS, FLAME, Ashoka University, OP Jindal,
Shiv Nadar, Azim Premji, CEPT Ahmedabad,
NID Ahmedabad, NIFT Delhi, MICA Ahmedabad

State Universities: Mumbai University, Pune University,
Gujarat University, Anna University, Osmania,
Rajasthan University, Lucknow University,
Calcutta University, Madras University,
Bangalore University, Kerala University,
Mysore University, Vikram University

── course_categories.seed.js ──
Seed all course categories:
Engineering, Medical, Dental, Nursing, Pharmacy,
Ayurveda, Homeopathy, Science, Commerce, Arts,
Law, Education, Management, Agriculture, Design,
Architecture, Hotel Management, Media & Journalism,
Social Work, Fine Arts, Physical Education

── courses.seed.js ──
Seed all courses with level + duration:

BACHELOR:
B.Tech (4yr), B.E (4yr), B.Arch (5yr), MBBS (5.5yr),
BDS (5yr), B.Pharm (4yr), B.Sc Nursing (4yr),
BAMS (5.5yr), BHMS (5.5yr), BPT (4.5yr),
B.Sc (3yr), B.Com (3yr), BA (3yr), LLB (3yr),
BA LLB (5yr), BBA (3yr), BCA (3yr), B.Ed (2yr),
BHM (3yr), BJMC (3yr), B.Des (4yr), BFA (4yr),
BSW (3yr), B.Sc Agriculture (4yr)

MASTER:
M.Tech (2yr), M.E (2yr), M.Arch (2yr),
MD (3yr), MS Surgery (3yr), MDS (3yr),
M.Pharm (2yr), M.Sc Nursing (2yr),
M.Sc (2yr), M.Com (2yr), MA (2yr),
LLM (1yr), MBA (2yr), MCA (2yr), M.Ed (2yr),
MJMC (2yr), M.Des (2yr), MFA (2yr), MSW (2yr)

INTEGRATED:
B.Tech + M.Tech (5yr), BA + LLB (5yr),
B.Sc + M.Sc (5yr), MBBS + MD (7yr)

── university_subjects.seed.js ──
Seed semester-wise subjects for top courses:

B.TECH COMPUTER SCIENCE (8 semesters):
Sem 1: Engineering Mathematics I, Engineering Physics,
       Engineering Chemistry, Programming in C,
       Engineering Graphics, English Communication
Sem 2: Engineering Mathematics II, Data Structures,
       Digital Electronics, OOP with Java/C++,
       Environmental Science, Engineering Mechanics
Sem 3: Discrete Mathematics, Computer Organization,
       Operating Systems, Database Management,
       Software Engineering, Theory of Computation
Sem 4: Algorithm Analysis, Computer Networks,
       Microprocessors, Web Technologies,
       Probability & Statistics, Compiler Design
Sem 5: Artificial Intelligence, Machine Learning,
       Computer Graphics, System Programming,
       Information Security, Elective I
Sem 6: Big Data Analytics, Cloud Computing,
       Mobile Computing, Software Testing,
       Distributed Systems, Elective II
Sem 7: Deep Learning, Natural Language Processing,
       IoT, Project Management, Elective III, 
       Minor Project
Sem 8: Major Project, Industry Internship,
       Technical Seminar, Elective IV

B.TECH MECHANICAL ENGINEERING (8 semesters):
Sem 1-2: Same as CS (Math, Physics, Chemistry, Graphics)
Sem 3: Engineering Thermodynamics, Fluid Mechanics,
       Materials Science, Manufacturing Technology,
       Kinematics of Machines, Strength of Materials
Sem 4: Heat Transfer, Machine Design, Metrology,
       Industrial Engineering, Dynamics of Machines
Sem 5-8: Advanced Manufacturing, CAD/CAM, 
         Automobile Engineering, Robotics, 
         Finite Element Analysis, etc.

B.TECH ELECTRICAL ENGINEERING:
Sem 3+: Circuit Theory, Electrical Machines,
        Power Systems, Control Systems,
        Power Electronics, Signal Processing,
        Electromagnetic Theory, etc.

MBBS (9 semesters + internship):
Phase I (Sem 1-2): Anatomy, Physiology, Biochemistry
Phase II (Sem 3-5): Pathology, Pharmacology,
                    Microbiology, Forensic Medicine,
                    Community Medicine
Phase III Part 1 (Sem 5-6): Ophthalmology, ENT,
                              Community Medicine
Phase III Part 2 (Sem 7-9): General Medicine,
                              General Surgery, Obstetrics,
                              Gynaecology, Paediatrics,
                              Orthopaedics, Psychiatry,
                              Dermatology, Radiology

MBA (4 semesters):
Sem 1: Management Concepts, Managerial Economics,
       Accounting, Organizational Behaviour,
       Business Statistics, Business Communication
Sem 2: Marketing Management, Financial Management,
       Human Resource Management, Operations,
       Business Law, Research Methodology
Sem 3-4: Specialization electives (Finance/Marketing/HR/Operations)
         Strategic Management, Internship

B.COM (6 semesters):
Sem 1-2: Financial Accounting, Business Economics,
         Business Law, Mathematics, English
Sem 3-4: Corporate Accounting, Cost Accounting,
         Income Tax, Business Statistics
Sem 5-6: Auditing, Financial Management,
         Management Accounting, Indirect Tax

B.SC PHYSICS (6 semesters):
Sem 1-2: Mechanics, Thermodynamics, Optics
Sem 3-4: Electromagnetism, Quantum Mechanics
Sem 5-6: Nuclear Physics, Solid State Physics,
         Electronics, Statistical Mechanics

── university_books.seed.js ──
Seed prescribed + reference books per subject:

ENGINEERING MATHEMATICS:
- "Higher Engineering Mathematics" — B.S. Grewal — Khanna Publishers
  (rank 1 — "Standard for all engineering universities in India")
- "Advanced Engineering Mathematics" — Erwin Kreyszig — Wiley
  (rank 2 — "For deeper understanding, preferred in IITs")
- "Engineering Mathematics" — H.K. Dass — S.Chand

DATA STRUCTURES:
- "Data Structures and Algorithms" — Narasimha Karumanchi — CareerMonk
  (rank 1 — "Best for placements + understanding")
- "Introduction to Algorithms" — CLRS — MIT Press
  (rank 2 — "IIT standard. Dense but comprehensive")
- "Data Structures" — Reema Thareja — Oxford

OPERATING SYSTEMS:
- "Operating System Concepts" — Silberschatz (Dinosaur Book) — Wiley
  (rank 1 — "Standard OS book across all universities")
- "Modern Operating Systems" — Andrew Tanenbaum — Pearson

DBMS:
- "Database System Concepts" — Silberschatz, Korth — McGraw Hill
  (rank 1 — "Standard DBMS textbook in India")
- "Fundamentals of Database Systems" — Elmasri & Navathe — Pearson

COMPUTER NETWORKS:
- "Computer Networks" — Andrew Tanenbaum — Pearson
  (rank 1 — "Bible of networking")
- "Data Communications and Networking" — Forouzan — McGraw Hill
  (rank 2 — "Easier to understand than Tanenbaum")

MACHINE LEARNING:
- "Pattern Recognition and Machine Learning" — Bishop — Springer
- "Hands-On Machine Learning" — Aurélien Géron — O'Reilly
  (rank 1 — "Best practical ML book")
- "Introduction to Statistical Learning" — James et al. — Springer (free)

FLUID MECHANICS:
- "Fluid Mechanics" — R.K. Bansal — Laxmi Publications
  (rank 1 — "Standard for Indian engineering colleges")
- "Fluid Mechanics" — Frank White — McGraw Hill

THERMODYNAMICS:
- "Engineering Thermodynamics" — P.K. Nag — McGraw Hill
  (rank 1 — "Gold standard for Indian engineering")
- "Thermodynamics" — Cengel & Boles — McGraw Hill

ANATOMY (MBBS):
- "Gray's Anatomy" — Gray — Elsevier (rank 1)
- "BD Chaurasia Human Anatomy" — BD Chaurasia — CBS
  (rank 1 India — "Standard for Indian MBBS students")
- "Snell's Clinical Anatomy" — Snell — Wolters Kluwer

PHYSIOLOGY (MBBS):
- "Textbook of Medical Physiology" — Guyton & Hall — Elsevier
  (rank 1 — "Bible of Physiology worldwide")
- "Review of Medical Physiology" — Ganong — McGraw Hill
- "Essentials of Medical Physiology" — K. Sembulingam — Jaypee

BIOCHEMISTRY (MBBS):
- "Harper's Illustrated Biochemistry" — Harper — McGraw Hill
- "Biochemistry" — U. Satyanarayana — Books & Allied
  (rank 1 India — "Standard for Indian MBBS")

PHARMACOLOGY (MBBS):
- "Pharmacology" — KD Tripathi — Jaypee
  (rank 1 India — "Most prescribed pharmacology book")
- "Goodman & Gilman's Pharmacology" — Brunton — McGraw Hill

PATHOLOGY (MBBS):
- "Robbins Basic Pathology" — Kumar — Elsevier (rank 1)
- "Harsh Mohan Textbook of Pathology" — Harsh Mohan — Jaypee

FINANCIAL ACCOUNTING:
- "Financial Accounting" — R.L. Gupta & V.K. Gupta — S.Chand
- "Advanced Accountancy" — Maheshwari & Maheshwari — Vikas
  (rank 1 — "Standard for B.Com across India")

MARKETING MANAGEMENT:
- "Marketing Management" — Philip Kotler — Pearson
  (rank 1 — "Bible of Marketing globally")
- "Marketing Management" — Rajan Saxena — McGraw Hill

HUMAN RESOURCE MANAGEMENT:
- "Human Resource Management" — Gary Dessler — Pearson
- "Personnel Management" — C.B. Mamoria — Himalaya Publishing

FINANCIAL MANAGEMENT:
- "Financial Management" — I.M. Pandey — Vikas Publishing
  (rank 1 — "Standard for MBA Finance India")
- "Principles of Corporate Finance" — Brealey & Myers — McGraw Hill

MICROECONOMICS:
- "Microeconomics" — Pindyck & Rubinfeld — Pearson
- "Indian Economy" — Mishra & Puri — Himalaya

═══════════════════════════════════════════════
API ROUTES
═══════════════════════════════════════════════
Add to library.routes.js:

GET /api/library/universities                    → all universities (grouped by type)
GET /api/library/universities/:id                → single university
GET /api/library/universities/:id/courses        → courses offered
GET /api/library/course-categories               → all course categories
GET /api/library/courses                         → all courses (filter by ?level=bachelor)
GET /api/library/courses/:id/subjects            → semester-wise subjects
GET /api/library/courses/:id/subjects?semester=3 → specific semester
GET /api/library/university-subjects/:id/books   → prescribed books
GET /api/library/university-books/recommend      
  → ?courseId=&subjectName=&university=&semester=

═══════════════════════════════════════════════
UPDATE AI PROMPT BUILDER
═══════════════════════════════════════════════
Add university mode to ai-prompt-builder.service.js:

When context has university + course + semester:
Role: "You are a senior professor at [university] 
      teaching [subject] for [course] Semester [X]"
Depth: University level — technical, detailed
Books: Prescribed textbooks for that subject
Style: Match university exam pattern
       (IIT style vs regular university style differ)

Add to JSON response:
"university_exam_tip": "How this topic appears in [uni] exams",
"textbook_reference": "Chapter X of [Prescribed Book]",
"viva_questions": ["Q1", "Q2", "Q3"]

## University Layer (Next Build)
Tables: universities, course_categories, courses, 
        university_courses, university_subjects,
        university_books, university_book_subject_links
Migrations: 094-100
Seeds run order: universities → course_categories → 
                 courses → university_courses → 
                 university_subjects → university_books
Priority universities to seed first:
  IITs (23), NITs (31), AIIMS (8), top private (VIT, BITS, Manipal)
Priority courses: B.Tech CS, B.Tech Mech, MBBS, MBA, B.Com, B.Sc
