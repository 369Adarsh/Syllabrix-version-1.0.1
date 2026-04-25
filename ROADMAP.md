# Syllabrix Product Roadmap
**Last updated: April 2026**

> This document is the single source of truth for what we are building, in what order, and why.
> Do not skip phases. Complete each milestone fully before moving to the next.

---

## The Vision

Syllabrix becomes the **first truly adaptive education platform in India** — one platform that completely transforms its personality, theme, content, and behavior based on who the student is.

A Class 2 child in Lucknow learning Hindi matras and a UPSC aspirant in Chennai tracking the Indian Polity syllabus should both feel like the platform was built *specifically for them*.

**Core principle:** The platform serves the student's need — not the other way around.

---

## Platform Modes (Personas)

| Mode | Who | Age/Stage |
|---|---|---|
| 🌈 Young Explorer | LKG to Class 5 | 4–10 years |
| 🔭 Curious Mind | Class 6 to 8 | 11–13 years |
| 🎯 Board Warrior | Class 9 to 10 | 14–15 years |
| ⚡ Exam Command | Class 11–12, JEE, NEET | 16–18 years |
| 🏛️ UPSC Aspirant | UPSC, PSC, SSC, Banking | 20–30 years |
| 💼 Skill Builder | College, Professional Learner | 18+ years |

---

## What Has Been Built (Phase 0 — Complete)

- [x] Authentication (sign up, login, email verification, Google OAuth)
- [x] User profiles (6 user types, complete profile flow)
- [x] Social home feed (posts, likes, comments, shares)
- [x] Connections / Groups system
- [x] Notifications (Instagram-style)
- [x] Messaging
- [x] Exam Command (JEE + NEET toggle, syllabus, video lectures, PYQ, mock tests)
- [x] AI Buddy
- [x] PrepSmart (basic — quiz hub, newsroom, current affairs, bookmarks)
- [x] Mind Maps
- [x] Newsroom
- [x] Career Explorer
- [x] Experience Lab
- [x] Leaderboard
- [x] Parent Dashboard (basic)
- [x] Sidebar cleanup (removed AI Library, AI Study Table)
- [x] Landing page redesign
- [x] Login bug fix (CORS + Render cold start)

---

## Phase 1 — Adaptive Platform Foundation
**Goal:** Make the platform aware of who the student is and respond accordingly.
**Priority:** HIGH — everything else depends on this.

### 1.1 Platform Mode Detection
- [ ] Add `platform_mode` field to user profile in database
- [ ] Auto-detect mode from: `class_level`, `target_exam`, `age_group`, `user_type`
- [ ] Detection logic:
  - class 1–5 → `young_explorer`
  - class 6–8 → `curious_mind`
  - class 9–10 → `board_warrior`
  - class 11–12 or target JEE/NEET → `exam_command`
  - target UPSC/PSC/SSC/Banking → `upsc_aspirant`
  - professional_learner / organization → `skill_builder`
- [ ] User can manually change mode in Settings → "My Learning Goal"

### 1.2 Dynamic Theme System
- [ ] Create a `ThemeContext` that provides colors per mode
- [ ] Young Explorer: yellow + orange + purple, rounded, playful
- [ ] Curious Mind: teal + cyan, energetic
- [ ] Board Warrior: green + emerald, focused
- [ ] Exam Command: blue + indigo (already exists)
- [ ] UPSC Aspirant: deep navy + saffron, dignified
- [ ] Skill Builder: slate + violet, professional
- [ ] Apply theme to: sidebar active color, header gradient, button colors, section headings

### 1.3 Mode-Specific Sidebar
- [ ] Sidebar reads `platform_mode` and renders correct nav items
- [ ] Young Explorer nav: Home, Learn & Play, Stories, My Progress, Parent Zone
- [ ] Curious Mind nav: Home, Subjects, Quiz, Career Discover, Mind Maps, Leaderboard
- [ ] Board Warrior nav: Home, Chapters, Practice Papers, Exam Countdown, My Stats
- [ ] Exam Command nav: already exists
- [ ] UPSC Aspirant nav: Daily Briefing, Syllabus Tracker, Current Affairs, Answer Writing, Mock Tests, Community
- [ ] Skill Builder nav: Dashboard, Learning Paths, Certifications, Job Radar, AI Mentor

### 1.4 Student Home Page — Daily Dashboard
- [ ] Replace social feed as the default view for student modes
- [ ] Dashboard sections (per mode — shown/hidden dynamically):
  - Today's tasks (3 recommended actions)
  - Streak + progress ring
  - Exam countdown (if target exam is set)
  - Quick access to last studied topic
  - Relevant news snippet (1 headline)
  - Leaderboard position
- [ ] Social feed moved to a secondary "Community" tab on home
- [ ] Young Explorer home: shows mascot + today's game, no feed

---

## Phase 2 — Young Explorer (LKG to Class 5)
**Goal:** Solve the foundational literacy problem — reading and writing in English, Hindi, and regional languages — through games, so children love learning instead of avoiding it.
**Priority:** HIGH — most underserved segment, highest parent demand.

### 2.1 Language & Script Setup
- [ ] During profile setup (young learner), parent selects:
  - Primary language of instruction (English / Hindi)
  - Regional language (Tamil / Telugu / Bengali / Marathi / Kannada / Gujarati / Odia / Punjabi)
- [ ] Store as `primary_language` and `regional_language` on profile
- [ ] All games respect this selection

### 2.2 The Mascot
- [ ] Design a friendly mascot character (suggested: a curious parrot named "Boli" — means "speech/language" in Hindi)
- [ ] Mascot speaks in child's selected language
- [ ] Mascot animations: happy (correct answer), encouraging (wrong answer), excited (level up)
- [ ] Mascot appears on: home screen, between games, lesson transitions
- [ ] Mascot never mocks — always positive

### 2.3 English Literacy Games
- [ ] **Sound Tap** — tap the letter that makes a given sound (phonics foundations)
- [ ] **Word Builder** — drag letters into the correct order to build a word
- [ ] **Story Race** — read a sentence before the timer runs out (reading speed)
- [ ] **Missing Word** — "The ___ sat on the mat" — fill in the blank (comprehension)
- [ ] **Word Hunt** — find hidden words in a letter grid (vocabulary)
- [ ] **Rhyme Time** — which word rhymes with "cat"? (phonemic awareness)
- [ ] **Spell It** — hear a word, tap the correct spelling from 3 options
- [ ] Difficulty levels: Starter → Reader → Explorer → Champion
- [ ] Each game tracks mastery per word/sound

### 2.4 Hindi Literacy Games
- [ ] **Matra Match** — connect the correct matra (ा ि ी ु ू े ै ो ौ) to the consonant
- [ ] **Barakhadi Builder** — complete the barakhadi row for a given consonant
- [ ] **Word Builder (Hindi)** — same as English but Devanagari script
- [ ] **Suno Aur Likho** — hear a simple Hindi word, select the correct Devanagari spelling
- [ ] **Kahani Race** — read a Hindi sentence, tap the correct picture that matches
- [ ] Special focus: matra ि vs ी (most common confusion point for kids)
- [ ] Special focus: conjunct consonants क्ष, त्र, ज्ञ (unlocked at higher levels)

### 2.5 Regional Language Games
- [ ] Same game structure as Hindi but with regional script
- [ ] Phase 2a: Tamil + Telugu (highest demand)
- [ ] Phase 2b: Bengali + Marathi + Kannada
- [ ] Phase 2c: Gujarati + Odia + Punjabi
- [ ] Each language has its own vowel/consonant matching game

### 2.6 AI Voice Reading Assessment
- [ ] Child reads a sentence aloud on mobile
- [ ] Web Speech API (supports Indian languages) listens and transcribes
- [ ] Compare transcription with expected text
- [ ] Give star rating: 1–3 stars based on accuracy
- [ ] Highlight mispronounced words gently
- [ ] Mascot gives voice feedback: "Almost! Try saying 'elephant' again"
- [ ] Track reading speed improvement over time (words per minute)

### 2.7 Letter Tracing (Writing)
- [ ] Canvas-based letter tracing on mobile/tablet
- [ ] English: A–Z uppercase and lowercase
- [ ] Hindi: क–ज्ञ with stroke order guides
- [ ] Finger-drawn strokes compared to ideal stroke path
- [ ] Score based on accuracy of strokes
- [ ] Unlocks "I can write this letter!" badge

### 2.8 Story Library
- [ ] Illustrated short stories (1–2 pages) in English + Hindi + regional language
- [ ] Stories sourced from: Panchatantra, Tenali Raman, Akbar-Birbal, regional folk tales
- [ ] Text is highlighted word by word as audio narration plays
- [ ] Child can tap any word to hear it pronounced
- [ ] "Read Myself" mode — child reads, AI listens (uses Voice Assessment from 2.6)
- [ ] Difficulty tiers: Pre-reader (pictures only) → Beginner → Intermediate → Independent
- [ ] Stories unlock as the child progresses through games

### 2.9 Progress & Rewards
- [ ] Word bank — shows every word the child has mastered (visual wall of words)
- [ ] Reading speed tracker — graph of words-per-minute over weeks
- [ ] Badges: "Letter Champion", "100 Words Club", "Hindi Hero", "Story Finisher"
- [ ] Level system: Seed → Sprout → Sapling → Tree → Banyan (5 tiers)
- [ ] Stars earned in games fill a "Star Jar" — visible on home screen

### 2.10 Parent Dashboard for Young Explorer
- [ ] Parents see:
  - Words mastered (English + Hindi + regional)
  - Reading speed this week vs last week
  - Time spent per subject
  - Which sounds/matras the child struggles with
  - "Practice this with your child tonight" — weekly recommendation
- [ ] "Read Together" mode — parent and child read a story side by side
- [ ] Weekly email report (if email notifications enabled)

---

## Phase 3 — UPSC / Government Exam Aspirant Mode
**Goal:** Make Syllabrix the most human, engaging, and organized platform for UPSC/PSC/SSC/Banking aspirants — who are currently served by boring PDFs and disconnected apps.
**Priority:** HIGH — 2–3 million aspirants in India, deeply underserved.

### 3.1 UPSC Home — Daily Briefing
- [ ] Aspirant's home page = Daily Briefing (not social feed)
- [ ] Sections:
  - Today's date + days remaining to next exam
  - Morning editorial summary (The Hindu / Indian Express highlights, AI-generated)
  - PIB highlights of yesterday
  - 3 important things that happened this week
  - Today's recommended study topic
  - Daily motivational message (real quotes from IAS toppers)

### 3.2 Syllabus Tracker
- [ ] Full UPSC Prelims syllabus loaded (GS Paper 1 + CSAT)
- [ ] Full UPSC Mains syllabus (GS 1, 2, 3, 4 + Essay + Optional)
- [ ] Aspirant marks topics as: Not Started / In Progress / Revised / Confident
- [ ] Progress ring per paper
- [ ] "At this pace, you'll complete GS1 in X days" — projection
- [ ] PSC syllabi for top states: Maharashtra, Tamil Nadu, UP, Karnataka, Rajasthan

### 3.3 Current Affairs Engine
- [ ] Daily current affairs digest (AI-curated, exam-relevant)
- [ ] Categorized by: Polity, Economy, Science & Tech, Environment, International, Sports, Awards
- [ ] Each item tagged: Prelims-relevant / Mains-relevant / Both
- [ ] Monthly current affairs PDF download
- [ ] "This Week in 5 Points" — quick weekly summary

### 3.4 Answer Writing Practice
- [ ] Daily Mains question (10-mark and 15-mark)
- [ ] Student types their answer in a structured editor
- [ ] AI evaluates: Introduction, Body, Conclusion, Word count, Coverage of key points
- [ ] AI gives score out of 10 + specific feedback ("Missing: constitutional provisions", "Good use of examples")
- [ ] Answer saved to personal answer bank
- [ ] View model answers for comparison

### 3.5 PYQ Bank (Government Exams)
- [ ] UPSC Prelims PYQs from 2010–2024 (subject-wise)
- [ ] UPSC Mains PYQs from 2013–2024
- [ ] SSC CGL, CHSL, MTS PYQs
- [ ] Banking: IBPS PO, SBI PO, Clerk PYQs
- [ ] Filter by: year, subject, paper, difficulty
- [ ] Track: attempted / correct / incorrect per question

### 3.6 Aspirant Community
- [ ] Study groups by exam type (UPSC / SSC / Banking / State PSC)
- [ ] Daily discussion thread: "Today's editorial" — discuss with other aspirants
- [ ] Doubt-clearing: post a question, get answers from seniors
- [ ] Success stories: aspirants who cleared share their journey
- [ ] No toxic comparison — community guidelines strictly enforced

### 3.7 Mock Tests
- [ ] Full UPSC Prelims mock tests (100 questions, 2 hours)
- [ ] Subject-wise tests (20–30 questions)
- [ ] Detailed analysis after each test: topic-wise, time-spent, accuracy
- [ ] Percentile ranking among all aspirants who took the same test

---

## Phase 4 — Board Warrior (Class 9 & 10)
**Goal:** Laser-focused on board exam preparation — CBSE, ICSE, and State Boards.

### 4.1 Board Exam Dashboard
- [ ] Exam countdown (days to board exam, set by student)
- [ ] Chapter-wise progress per subject (Math, Science, Social, English, Hindi)
- [ ] Today's recommended chapter based on exam timeline
- [ ] "If you study 2 chapters per day, you'll complete the syllabus in X days"

### 4.2 Chapter Progress Tracker
- [ ] All CBSE Class 9 + 10 chapters pre-loaded
- [ ] Student marks chapter as: Not Started / Reading / Practising / Done
- [ ] Important questions per chapter (CBSE pattern)
- [ ] Previous year board questions per chapter

### 4.3 Practice Papers
- [ ] CBSE sample papers (subject-wise)
- [ ] Previous year board papers (2018–2024)
- [ ] Chapter-wise worksheets
- [ ] Timed practice mode
- [ ] Auto-evaluation for MCQ sections

### 4.4 Weak Area Detector
- [ ] After each quiz/test, tag wrong answers by chapter
- [ ] Dashboard shows: "Your weakest chapters this week"
- [ ] AI recommends: "Spend 30 min on Quadratic Equations today"

---

## Phase 5 — Curious Mind (Class 6 to 8)
**Goal:** Keep the curiosity alive — make learning feel like discovery, not pressure.

### 5.1 Subject Discovery Mode
- [ ] Each subject has a "World of..." entry point
  - World of Science — experiments, phenomena, curiosities
  - World of Maths — puzzles, patterns, real-world problems
  - World of History — stories, timelines, maps
- [ ] Content is engaging — facts, not textbook paragraphs
- [ ] "Did You Know?" daily card on home page

### 5.2 Career Awareness (Age-Appropriate)
- [ ] "What could I become?" explorer — simplified career paths
- [ ] Profiles of inspiring Indians: scientists, sportspeople, artists
- [ ] Skill quizzes: "Are you more creative or analytical?"
- [ ] No pressure framing — purely exploratory

### 5.3 Competitive Learning
- [ ] Weekly subject quizzes with leaderboard
- [ ] Class-level leaderboards (CBSE Class 6, etc.)
- [ ] "Challenge a friend" — send a quiz challenge via connection

---

## Phase 6 — PrepSmart Redesign
**Goal:** Transform PrepSmart from a feature menu into a goal-driven study hub that adapts per platform mode.

### 6.1 Mode-Aware PrepSmart
- [ ] Young Explorer: shows literacy games progress, story library, no current affairs
- [ ] Board Warrior: shows board exam countdown, chapter progress, practice papers
- [ ] UPSC Aspirant: redirects to Daily Briefing (Phase 3)
- [ ] Exam Command: redirects to Exam Command tab (already built)
- [ ] Curious Mind: shows subject discovery + quiz hub

### 6.2 Redesigned Layout (for modes that use it)
- [ ] Top: personalized greeting + today's goal progress
- [ ] Middle: 3 recommended actions (not 6 generic cards)
- [ ] Bottom: recent activity + upcoming milestones
- [ ] Right panel: streak, score, leaderboard position

---

## Phase 7 — AI Buddy Personality Upgrade
**Goal:** AI Buddy stops being a generic chatbot and becomes a persona-matched study companion.

### 7.1 Mode-Specific Personality
- [ ] Young Explorer: "Hi! I'm Boli! Shall we play a word game today? 🦜"
- [ ] Curious Mind: "Hey! I found something cool about black holes. Want to know?"
- [ ] Board Warrior: "You have 42 days to boards. Want to review Trigonometry?"
- [ ] Exam Command: "Today's UPSC static GK focus: Article 356. Shall we?"
- [ ] UPSC Aspirant: "Good morning. The Hindu editorial today is about India-Maldives relations. Summary?"
- [ ] Skill Builder: "Your Python skills are at 68%. Want to tackle OOP today?"

### 7.2 Proactive Suggestions
- [ ] AI Buddy sends a "nudge" if student hasn't opened the app in 2 days
- [ ] Suggests the most important thing to do based on exam proximity
- [ ] After a quiz: "You got 60% on Organic Chemistry. Want me to explain the ones you missed?"

---

## Phase 8 — Platform Polish & Scale
**Goal:** Production-quality across all modes. Performance, accessibility, mobile-first.

- [ ] Full mobile responsiveness audit across all new pages
- [ ] Offline mode for core features (reading games, story library)
- [ ] Push notifications (exam reminders, streak alerts, new content)
- [ ] Multilingual UI strings (Hindi interface option for the entire platform)
- [ ] Accessibility: font size control, high contrast mode, screen reader support
- [ ] Performance: lazy loading, image optimization, API caching
- [ ] Analytics dashboard (admin) — track usage per mode, engagement per game

---

## Build Rules

1. **Complete one phase before starting the next.** Partial features create confusion.
2. **Mobile first.** Every new page must work on a 375px phone before moving on.
3. **No dead links.** If a nav item is added, its page must exist and work.
4. **Test with real users.** After each phase, get feedback from at least 2–3 real students in that category before proceeding.
5. **Database migrations first.** Any new field/table must be added to the DB before frontend work begins.
6. **Keep it simple.** A feature that works simply is better than a complex feature that half-works.

---

## Current Status

| Phase | Status |
|---|---|
| Phase 0 — Foundation | ✅ Complete |
| Phase 1 — Adaptive Platform Foundation | 🔲 Not started |
| Phase 2 — Young Explorer (Literacy) | 🔲 Not started |
| Phase 3 — UPSC Aspirant | 🔲 Not started |
| Phase 4 — Board Warrior | 🔲 Not started |
| Phase 5 — Curious Mind | 🔲 Not started |
| Phase 6 — PrepSmart Redesign | 🔲 Not started |
| Phase 7 — AI Buddy Upgrade | 🔲 Not started |
| Phase 8 — Polish & Scale | 🔲 Not started |

---

*Update this document every time a milestone is completed.*
