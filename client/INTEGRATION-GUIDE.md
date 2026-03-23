# SYLLABRIX FRONTEND OVERHAUL — Integration Guide

## Files Created

```
syllabrix-frontend/
├── globals.css                              → Replace: client/src/app/globals.css
├── tailwind.config.js                       → Replace: client/tailwind.config.js
├── app/
│   ├── page.jsx                             → Replace: client/src/app/page.jsx (Landing Page)
│   └── (dashboard)/
│       ├── mind-maps/
│       │   └── page.jsx                     → NEW: client/src/app/(dashboard)/mind-maps/page.jsx
│       ├── experience-lab/
│       │   └── page.jsx                     → Replace: client/src/app/(dashboard)/experience-lab/page.jsx
│       └── prepsmart/
│           └── page.jsx                     → NEW: client/src/app/(dashboard)/prepsmart/page.jsx
└── components/
    └── layout/
        └── Sidebar.jsx                      → Replace: client/src/components/layout/Sidebar.jsx
```

---

## 1. INSTALLATION STEPS

### Step 1: Copy files to your project
```bash
# From your project root D:\syllabrix-project

# Design system
cp globals.css client/src/app/globals.css
cp tailwind.config.js client/tailwind.config.js

# Landing page
cp app/page.jsx client/src/app/page.jsx

# Sidebar (restructured with AI Powered section)
cp components/layout/Sidebar.jsx client/src/components/layout/Sidebar.jsx

# Mind Maps (new page)
mkdir -p client/src/app/(dashboard)/mind-maps
cp app/(dashboard)/mind-maps/page.jsx client/src/app/(dashboard)/mind-maps/page.jsx

# Experience Lab (redesigned)
cp app/(dashboard)/experience-lab/page.jsx client/src/app/(dashboard)/experience-lab/page.jsx

# PrepSmart (new page)
mkdir -p client/src/app/(dashboard)/prepsmart
cp app/(dashboard)/prepsmart/page.jsx client/src/app/(dashboard)/prepsmart/page.jsx
```

### Step 2: Install Google Fonts
The design system uses Outfit, DM Sans, and JetBrains Mono. These are loaded via CSS @import in globals.css, so they work automatically. No npm install needed.

### Step 3: Verify Tailwind config
Make sure your `postcss.config.js` exists:
```js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

---

## 2. WHAT CHANGED AND WHY

### A. Color System (globals.css)
**Before:** Generic, boring color palette with no personality
**After:** Vibrant Indigo primary + Coral accent + Teal for AI features
- Deep Indigo (#4F46E5 → #6366F1) as primary brand color
- Warm Coral (#F97316) as accent/CTA color
- Teal (#14B8A6) exclusively for AI-powered features
- Dark navy (#0F0E2A) sidebar for premium feel
- Mesh gradient backgrounds instead of flat whites

### B. Typography
**Before:** Generic system fonts
**After:**
- **Outfit** — Bold, geometric headings (not Inter, not Roboto!)
- **DM Sans** — Clean, readable body text
- **JetBrains Mono** — Code blocks and technical content

### C. Landing Page (page.jsx)
**Before:** Minimal, doesn't showcase features, boring layout
**After:**
- Animated hero with mesh gradient background
- Feature grid with 6 cards (AI Mind Maps, Experience Lab, PrepSmart, Social, Live Classes, Safety)
- Dark-themed Experience Lab showcase section
- AI Powered section with Mind Map + PrepSmart previews
- User types cards (Student, Teacher, Parent, Institute)
- Positivity Engine showcase with reaction badges
- Animated counters, floating elements, scroll-triggered reveals
- Professional browser mockup showing the dashboard

### D. Sidebar (Sidebar.jsx)
**Before:** Flat navigation list
**After:**
- **AI Powered** collapsible section with teal glow line
- Experience Lab, PrepSmart, Mind Maps moved under "AI Powered"
- Tags on each AI item (Flagship, AI)
- User profile mini-card at bottom
- Active state with left accent bar
- Notification badge on bell

### E. Mind Map (NEW)
**Before:** Infinite expansion with no direction
**After:** 3-stage flow:
1. **Input** — User enters topic with quick suggestions
2. **Setup** — AI asks: What class? What board? What goal? (Exam, Deep Learning, Revision, Explore)
3. **Map** — Structured tree with max 3 levels of depth
   - Each node has **Expand** (go deeper) and **Notes** (get study material)
   - Context bar shows topic, class, board, goal
   - AI generates board-pattern-aware breakdowns
   - Notes panel slides in with formatted study material

### F. Experience Lab (experience-lab/page.jsx)
**Before:** Task shown with no explanation, no support
**After:**
- **Sector grid** — Choose from Technology, Design, Healthcare, etc.
- **Task detail** with 4 tabs:
  - **Step-by-Step Guide** — Clickable checklist with progress tracking
  - **Video Tutorials** — Embedded YouTube players with descriptions
  - **Study Notes** — AI-generated notes specific to the task
  - **Resources** — PDFs, tools, cheat sheets
- Full task brief explaining WHAT, WHY, and HOW
- "What You'll Learn" section
- Progress circle on the header
- Submission area with AI review

### G. PrepSmart (NEW)
**Before:** Static, boring MCQs
**After:**
- Animated topic selection with emoji cards
- **Timer** with urgency colors (green → amber → red with pulse)
- **Streak counter** with celebration confetti at 3 and 5 streaks
- Option selection with color-coded correct/wrong states
- **Visual explanation** panel after each answer with:
  - Diagram/formula visualization
  - Text explanation
  - Pro tip with memory trick
- **Results screen** with grade, score, streak, XP earned
- Adaptive difficulty badges on each question

---

## 3. POST VALIDATION ERROR FIX

The "Validation failed, please check your input" error when posting is likely a backend validation issue. Here are the most common causes:

### Check 1: Post creation endpoint validation
Open `server/src/features/posts/posts.validation.js` and verify:

```js
// The validation might be too strict. Check these fields:
const createPostValidation = [
  body('content')
    .optional()        // ← MUST be optional if allowing image/video-only posts
    .isString()
    .trim()
    .isLength({ min: 1, max: 5000 }),
  body('post_type')
    .optional()        // ← Should accept: 'text', 'photo', 'video', 'document'
    .isIn(['text', 'photo', 'video', 'document']),
  body('media_url')
    .optional()        // ← Will be set after upload, not in initial request
    .isString(),
];
```

### Check 2: Multer file field name
In your upload middleware or posts route, make sure the field name matches:

```js
// If your frontend sends: formData.append('file', selectedFile)
// Then your route must use:
upload.single('file')    // ← NOT 'media' or 'image'

// For multiple files:
upload.array('files', 10)  // ← NOT 'images' or 'media'
```

### Check 3: Content-Type header
When posting with media, the request must be `multipart/form-data`, NOT `application/json`.

```js
// Frontend API call should be:
const formData = new FormData();
formData.append('content', text);
formData.append('post_type', 'photo');
formData.append('file', selectedImage);

// Do NOT set Content-Type header — let the browser set it automatically
const res = await fetch(`${API_BASE}/posts`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    // NO Content-Type here — FormData sets it automatically with boundary
  },
  body: formData,
});
```

### Check 4: Missing required fields
In `posts.controller.js`, check if `user_id` is being pulled from `req.user`:

```js
const createPost = async (req, res) => {
  const user_id = req.user.id;  // ← Must come from auth middleware
  const { content, post_type } = req.body;
  
  // If content is empty AND no media file, reject
  if (!content && !req.file) {
    return res.status(400).json({ 
      success: false, 
      message: 'Post must have content or media' 
    });
  }
  // ... rest of creation logic
};
```

### Quick Debug Steps:
1. Open Postman
2. Create a POST request to `http://localhost:5000/api/posts`
3. Set Authorization header: `Bearer YOUR_JWT_TOKEN`
4. Body → form-data:
   - `content` (Text): "Hello from Syllabrix!"
   - `post_type` (Text): "text"
5. Send and check the response error details
6. The error message should tell you WHICH field failed validation

---

## 4. BACKEND AI ENDPOINT FOR MIND MAP

The Mind Map calls `POST /api/ai/generate`. If this endpoint doesn't exist yet, here's a quick setup:

### Create: `server/src/features/ai/ai.controller.js`
```js
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generate = async (req, res) => {
  try {
    const { prompt, responseFormat } = req.body;
    
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    res.json({ success: true, data: { response } });
  } catch (error) {
    console.error('AI generation error:', error);
    res.status(500).json({ success: false, message: 'AI generation failed' });
  }
};

module.exports = { generate };
```

### Create: `server/src/features/ai/ai.routes.js`
```js
const router = require('express').Router();
const { generate } = require('./ai.controller');
const { authenticate } = require('../../middleware/auth.middleware');

router.post('/generate', authenticate, generate);

module.exports = router;
```

### Register in master routes: `server/src/routes/index.js`
```js
const aiRoutes = require('../features/ai/ai.routes');
// ... inside the route mounting function:
router.use('/ai', aiRoutes);
```

---

## 5. NEXT STEPS

After integrating these files:
1. Fix the post validation error using the debugging steps above
2. Wire the Mind Map to the real Gemini AI endpoint
3. Wire Experience Lab to the actual backend `experience-lab` APIs
4. Replace PrepSmart sample questions with AI-generated ones from Gemini
5. Test all flows end-to-end on DEV
6. Push to QA branch for testing

---

*This overhaul transforms Syllabrix from a "homework project" look to a "modern EdTech platform" feel.*
*Every screen is designed with intention — vibrant colors, purposeful animations, and real utility.*
