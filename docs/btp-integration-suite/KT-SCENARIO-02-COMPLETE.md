# KT Document — Scenario 02: Syllabrix Career Profile → SAP SuccessFactors
## SAP BTP Cloud Integration | REST-to-REST Mapping + Skill Gap Intelligence | Complete Baby-Step SOP
### Version 2.0 | April 2026

---

# PART 1 — WHAT ARE WE BUILDING AND WHY

---

## 1.1 The Business Problem

A professional learner completes their career onboarding on Syllabrix — they fill in their current role, industry, experience, and career goal. They are also actively following learning paths (e.g., SAP BTP Integration Suite — 30 days).

**The problem:** HR teams use SAP SuccessFactors to manage talent pipelines. The learner's data — including their real-time learning progress and skill gaps — is stuck in Syllabrix and never reaches SuccessFactors automatically.

**The solution we are building:** Every hour, CPI:
1. Fetches the learner's **career profile** from Syllabrix
2. Fetches their **active learning paths** and progress
3. Fetches available **job postings** from Syllabrix
4. **Calculates skill gaps** between the learner's current skills and job requirements
5. **Calculates a job match score** for each open position
6. **Transforms and syncs** all of this to SuccessFactors as a rich candidate record

---

## 1.2 The Business Value (What HR Gets)

```
WITHOUT INTEGRATION                    WITH INTEGRATION
───────────────────                    ────────────────
HR manually copies candidate data  →   Auto-synced every hour
Static resume at application time  →   Live learning progress visible
HR doesn't know if upskilling      →   Real-time skill development tracked
Manual job matching                →   Automated fit score per job posting
Data in two separate silos         →   Single connected talent pipeline
No readiness prediction            →   "Candidate will be job-ready in 30 days"
```

---

## 1.3 Real Enterprise Story

When a company posts a job for **"SAP Integration Consultant"**, HR can see in SuccessFactors:

```
Candidate: Adarsh Kumar Singh
Current Role: SAP BTP Consultant
Experience: 3 years

Active Learning:
  ✓ SAP BTP Integration Suite — 60% complete (18/30 days)
  ✓ SAP BTP Administration — 0% (just started)

Skill Gap Analysis:
  Job requires:  SAP BTP, CPI, REST APIs, Groovy, OData
  Candidate has: SAP BTP ✓, REST APIs ✓
  In progress:   CPI (60%), Groovy (in progress)
  Missing:       OData (not started)
  Gap Score:     20% (only 1 skill missing)

Job Match Score: 80% → "Strong Candidate"
Est. Ready Date: 2026-05-20

Recommendation: Recommend for interview — actively upskilling
```

This is a **live, auto-updating record** — every hour CPI refreshes it.

---

## 1.4 Trial Adaptation

On a BTP Trial, you don't have a SuccessFactors instance. We simulate it using **httpbin.org/post** — a free public mock API that accepts any POST and echoes it back, proving your payload is correct.

```
TRIAL:      CPI → httpbin.org/post        ← what we build
PRODUCTION: CPI → SuccessFactors OData    ← same iFlow, different URL + auth
```

---

## 1.5 API Base URL

```
Base URL: https://syllabrix-api.onrender.com

Endpoints used:
  POST /api/auth/login          ← get JWT token
  GET  /api/career/profile      ← career profile data
  GET  /api/career/learning     ← learning paths + progress
  GET  /api/career/jobs         ← job postings for matching
```

> **Render Free Tier Warning:** The Render free instance spins down after inactivity.
> The first CPI request after idle may take 50+ seconds and timeout.
> **Fix:** Set HTTP Adapter timeout to `90000` ms (90 seconds) instead of default 60000.

---

# PART 2 — CONCEPTS YOU MUST UNDERSTAND

---

## 2.1 What is REST-to-REST Integration?

Both Syllabrix and SuccessFactors are REST APIs but speak different "languages" (different field names, formats, structures). CPI sits in the middle as the translator:

```
Syllabrix API              CPI (Translator)             SuccessFactors
─────────────              ────────────────             ──────────────
current_role          →    field mapping           →    currentTitle
experience_years      →    type conversion         →    yearsOfExperience
salary_expectation    →    string cleanup          →    salaryExpectation
(multiple endpoints)  →    data aggregation        →    single candidate record
(raw data)            →    gap calculation         →    skillGapAnalysis object
```

---

## 2.2 What is OData?

OData (Open Data Protocol) is a standardized REST API protocol used by SAP.

| Feature | Regular REST | OData |
|---|---|---|
| URL structure | Custom | Standardized (`/EntitySet(key)`) |
| Filtering | Custom params | `$filter`, `$select`, `$top` |
| Format | JSON/XML (free) | JSON or AtomPub XML |
| Metadata | None standard | `/$metadata` endpoint |
| SAP usage | Non-SAP backends | S/4HANA, SuccessFactors, BTP |

---

## 2.3 What is Skill Gap Analysis?

```
Job requires these skills:    [SAP BTP, CPI, REST APIs, Groovy, OData]
Candidate confirmed skills:   [SAP BTP, REST APIs]
Candidate learning now:       [CPI (60%), Groovy (in progress)]
Candidate not started:        [OData]

Gap Calculation:
  Total required skills = 5
  Confirmed = 2  → 40%
  In progress = 2 → 40% partial credit (counted as 50% each = 20%)
  Missing = 1    → 20% gap

  Readiness Score = 40% + 20% = 60% base
  Adjusted with market fit (78%) = ~72% overall match
```

---

## 2.4 The Full iFlow Architecture

```
┌────────────────────────────────────────────────────────────────────────────────┐
│                              INTEGRATION PROCESS                               │
│                                                                                │
│  [Timer]→[CM1]→[RR1]→[Groovy1]→[RR2]→[Groovy2]→[RR3]→[Groovy3]→[CM2]→[Send]→[End]│
│                  |              |              |                    |          │
└──────────────────┼──────────────┼──────────────┼────────────────────┼──────────┘
                   |              |              |                    |
            [HTTP Recv 1]  (save to prop)  (save to prop)     [HTTP Recv 2]
            GET /profile   body overwritten body overwritten   POST httpbin
                           by next call    by next call        (simulate SF)
```

**Steps:**
| Step | Name | What It Does |
|---|---|---|
| Timer | Start | Fires every hour |
| CM1 | Content Modifier 1 | Sets Authorization Bearer header |
| RR1 | Request Reply 1 | GET /career/profile from Syllabrix |
| Groovy1 | Script 1 | Saves profile JSON to Exchange Property |
| RR2 | Request Reply 2 | GET /career/learning from Syllabrix |
| Groovy2 | Script 2 | Saves learning JSON to Exchange Property |
| RR3 | Request Reply 3 | GET /career/jobs from Syllabrix |
| Groovy3 | Script 3 | Combines all 3 + calculates gaps + builds SF payload |
| CM2 | Content Modifier 2 | Sets Content-Type: application/json |
| Send | Send Step | POSTs final payload to httpbin (simulates SF) |
| End | End Event | Flow completes |

**THREE HTTP Receivers:**
- Receiver 1 → Request Reply 1 → GET /career/profile
- Receiver 2 → Request Reply 2 → GET /career/learning
- Receiver 3 → Request Reply 3 → GET /career/jobs
- Receiver 4 → Send → POST httpbin.org/post

---

## 2.5 Why Do We Need Exchange Properties?

When Request Reply 1 gets the profile response, that response is in the **message body**.
When Request Reply 2 then runs, it **overwrites** the body with the learning response.
The profile data is now GONE from the body.

**Solution:** After each Request Reply, use a Groovy script to save the body to an **Exchange Property** — a variable that survives the entire flow.

```
After RR1: property["profileData"] = message body (profile JSON)
After RR2: property["learningData"] = message body (learning JSON)
After RR3: body = jobs JSON
Groovy3:   reads all three → combines → builds final payload
```

---

# PART 3 — SOURCE AND TARGET DATA

---

## 3.1 Syllabrix Profile Response
```json
{
  "success": true,
  "data": {
    "current_role": "SAP BTP Consultant",
    "experience_years": 3,
    "industry": "Technology",
    "career_goal": "Senior Architect",
    "salary_expectation": "₹15-20 LPA",
    "market_fit_score": 78,
    "city": "Mundra",
    "state": "Jharkhand",
    "country": "India"
  }
}
```

## 3.2 Syllabrix Learning Response
```json
{
  "success": true,
  "data": [
    {
      "skill_name": "SAP BTP Integration Suite",
      "status": "in_progress",
      "total_days": 30,
      "completed_days": [],
      "difficulty": "intermediate"
    }
  ]
}
```

## 3.3 Target: SuccessFactors Candidate Payload
```json
{
  "currentTitle": "SAP BTP Consultant",
  "yearsOfExperience": 3,
  "industry": "Technology",
  "targetRole": "Senior Architect",
  "salaryExpectation": "15-20",
  "location": "Mundra, Jharkhand, India",
  "marketFitScore": 78,

  "learningProgress": {
    "activePaths": 1,
    "completedPaths": 0,
    "currentlyLearning": "SAP BTP Integration Suite",
    "overallProgressPct": 20
  },

  "skillGapAnalysis": {
    "confirmedSkills": ["SAP BTP", "REST APIs"],
    "inProgressSkills": ["CPI", "SAP BTP Integration Suite"],
    "missingSkills": [],
    "readinessScore": 80,
    "gapScore": 20
  },

  "jobMatching": {
    "totalJobsAnalyzed": 3,
    "bestMatchTitle": "SAP Integration Consultant",
    "bestMatchScore": 80,
    "recommendation": "Strong Candidate - actively upskilling"
  },

  "source": "Syllabrix",
  "syncedAt": "2026-04-19T10:30:00"
}
```

---

# PART 4 — BABY-STEP BUILD GUIDE

---

## PRE-REQUISITE — Get a Fresh JWT Token

Render free tier spins down — wake it up first:

**Step 1:** Open Postman → GET `https://syllabrix-api.onrender.com/api/career/profile`
Wait for it to respond (may take 50 seconds first time — this wakes the server)

**Step 2:** Get JWT token:
```
POST https://syllabrix-api.onrender.com/api/auth/login
Body (JSON):
{
  "email": "123anita2kumari@gmail.com",
  "password": "123@Adarsh"
}
```
Copy the `token` → save in Notepad → keep it ready.

---

## STEP 1 — Create the iFlow

1. Design → Integrations and APIs → **Syllabrix Integrations** package
2. Click **Add** → **Integration Flow**
3. Fill in:
   ```
   Name:        S02 - Career Profile Sync to SuccessFactors
   Description: Polls Syllabrix profile, learning, jobs — calculates skill gaps — syncs to SF
   ```
4. Click **OK** → open the iFlow designer
5. Click **Edit**

---

## STEP 2 — Replace Start Event with Timer

1. Click default **Start** event → **Delete**
2. Search "Timer" → drag **Timer Start Event** onto canvas
3. Click Timer → **Scheduler** tab → **Basic**:
   ```
   Enter As: Simple Schedule
   Repeat:   Minutely
   Every:    5
   ```
   *(5 minutes for testing — change to Hourly in production)*

---

## STEP 3 — Add Content Modifier 1 (Authorization Header)

1. Drag **Content Modifier** → connect Timer → Content Modifier 1
2. Click it → **Message Header** tab → **Add**:
   ```
   Action:       Create
   Name:         Authorization
   Source Type:  Constant
   Source Value: Bearer eyJ...YOUR_FRESH_JWT_TOKEN_HERE...
   ```
3. Click **Save**

---

## STEP 4 — Add Request Reply 1 (GET Career Profile)

1. Drag **Request Reply** → connect Content Modifier 1 → Request Reply 1
2. Drag **Receiver** from its right edge → Adapter Type: **HTTP**
3. **Connection tab:**
   ```
   Address:        https://syllabrix-api.onrender.com/api/career/profile
   Method:         GET
   Proxy Type:     Internet
   Authentication: None
   Timeout:        90000
   ```
4. **Header Details:**
   ```
   Request Headers:  Authorization
   Response Headers: *
   ```
5. Click **Save**

> **Why 90000 timeout?** Render free tier may take 50+ seconds to wake up on first request.

---

## STEP 5 — Add Groovy Script 1 (Save Profile to Property)

1. Drag **Script (Groovy)** → connect Request Reply 1 → Groovy Script 1
2. Click it → Processing tab → Select → Create → name: `SaveProfile.groovy`
3. **Ctrl+A** → Delete → paste:

```groovy
def processData(def message) {
    // Save profile response body to property before next HTTP call overwrites it
    def body = message.getBody(String.class)
    message.setProperty("profileData", body)
    return message
}
```

4. Click **Apply**

---

## STEP 6 — Add Request Reply 2 (GET Learning Paths)

1. Drag **Request Reply** → connect Groovy Script 1 → Request Reply 2
2. Drag **Receiver** → Adapter Type: **HTTP**
3. **Connection tab:**
   ```
   Address:        https://syllabrix-api.onrender.com/api/career/learning
   Method:         GET
   Proxy Type:     Internet
   Authentication: None
   Timeout:        90000
   ```
4. **Header Details:**
   ```
   Request Headers:  Authorization
   Response Headers: *
   ```
5. Click **Save**

---

## STEP 7 — Add Groovy Script 2 (Save Learning to Property)

1. Drag **Script (Groovy)** → connect Request Reply 2 → Groovy Script 2
2. Click it → Select → Create → name: `SaveLearning.groovy`
3. **Ctrl+A** → Delete → paste:

```groovy
def processData(def message) {
    // Save learning response body to property before next HTTP call overwrites it
    def body = message.getBody(String.class)
    message.setProperty("learningData", body)
    return message
}
```

4. Click **Apply**

---

## STEP 8 — Add Request Reply 3 (GET Jobs)

1. Drag **Request Reply** → connect Groovy Script 2 → Request Reply 3
2. Drag **Receiver** → Adapter Type: **HTTP**
3. **Connection tab:**
   ```
   Address:        https://syllabrix-api.onrender.com/api/career/jobs
   Method:         GET
   Proxy Type:     Internet
   Authentication: None
   Timeout:        90000
   ```
4. **Header Details:**
   ```
   Request Headers:  Authorization
   Response Headers: *
   ```
5. Click **Save**

---

## STEP 9 — Add Groovy Script 3 (Main: Combine + Calculate + Map)

This is the main transformation script — combines all 3 API responses, calculates skill gaps and job match scores, and builds the SuccessFactors payload.

1. Drag **Script (Groovy)** → connect Request Reply 3 → Groovy Script 3
2. Click it → Select → Create → name: `BuildSFPayload.groovy`
3. **Ctrl+A** → Delete → paste:

```groovy
def processData(def message) {
    def slurper = new groovy.json.JsonSlurper()
    
    // Read all three saved responses
    def profileRaw  = message.getProperty("profileData") ?: "{}"
    def learningRaw = message.getProperty("learningData") ?: "{}"
    def jobsRaw     = message.getBody(String.class) ?: "{}"
    
    def profileJson  = slurper.parseText(profileRaw)
    def learningJson = slurper.parseText(learningRaw)
    def jobsJson     = slurper.parseText(jobsRaw)
    
    def profile  = profileJson?.data ?: [:]
    def paths    = learningJson?.data ?: []
    def jobs     = jobsJson?.data?.jobs ?: jobsJson?.data ?: []
    
    // ── 1. PROFILE FIELDS ──────────────────────────────────────
    def rawSalary = (profile.salary_expectation ?: "")
        .replace("₹", "").replace(" LPA", "").replace("LPA", "").trim()
    
    def locationParts = []
    if (profile.city)    locationParts << profile.city
    if (profile.state)   locationParts << profile.state
    if (profile.country) locationParts << profile.country
    def location = locationParts.join(", ")
    
    // ── 2. LEARNING PROGRESS ───────────────────────────────────
    def activePaths    = paths.findAll { it.status == 'in_progress' }.size()
    def completedPaths = paths.findAll { it.status == 'completed' }.size()
    
    def currentlyLearning = paths.find { it.status == 'in_progress' }?.skill_name ?: "None"
    
    def totalDays     = paths.sum { it.total_days ?: 0 } ?: 0
    def completedDays = paths.sum { path ->
        def cd = path.completed_days
        if (cd instanceof List) return cd.size()
        if (cd instanceof String) {
            try { return new groovy.json.JsonSlurper().parseText(cd).size() }
            catch (Exception e) { return 0 }
        }
        return 0
    } ?: 0
    
    def overallProgressPct = totalDays > 0 ?
        Math.round((completedDays / totalDays) * 100) : 0
    
    // Skills in progress = learning path names
    def inProgressSkills = paths
        .findAll { it.status == 'in_progress' }
        .collect { it.skill_name ?: '' }
        .findAll { it }
    
    def confirmedSkills = paths
        .findAll { it.status == 'completed' }
        .collect { it.skill_name ?: '' }
        .findAll { it }
    
    // ── 3. SKILL GAP ANALYSIS ──────────────────────────────────
    def marketFit   = profile.market_fit_score ?: 0
    def gapScore    = Math.max(0, 100 - marketFit)
    def readiness   = marketFit + (overallProgressPct * 0.2).toInteger()
    readiness       = Math.min(100, readiness)
    
    // Estimate ready date based on remaining days
    def remainingDays = totalDays - completedDays
    def cal = Calendar.getInstance()
    cal.add(Calendar.DAY_OF_YEAR, remainingDays)
    def estimatedReadyDate = cal.time.format("yyyy-MM-dd")
    
    // ── 4. JOB MATCHING ────────────────────────────────────────
    def bestMatchTitle = "No jobs available"
    def bestMatchScore = 0
    def totalJobsAnalyzed = jobs.size()
    
    if (jobs) {
        // Simple matching: compare job title keywords with learning path names
        jobs.each { job ->
            def jobTitle = (job.title ?: job.job_title ?: "").toLowerCase()
            def matchScore = 0
            
            // Base score from market fit
            matchScore += (marketFit * 0.6).toInteger()
            
            // Bonus for learning paths matching job keywords
            inProgressSkills.each { skill ->
                if (jobTitle.contains(skill.toLowerCase().split(" ")[0])) {
                    matchScore += 10
                }
            }
            confirmedSkills.each { skill ->
                matchScore += 5
            }
            
            matchScore = Math.min(100, matchScore)
            
            if (matchScore > bestMatchScore) {
                bestMatchScore = matchScore
                bestMatchTitle = job.title ?: job.job_title ?: "Unknown Role"
            }
        }
    }
    
    def recommendation = bestMatchScore >= 80 ? "Strong Candidate - recommend interview" :
                         bestMatchScore >= 60 ? "Good Candidate - actively upskilling" :
                         bestMatchScore >= 40 ? "Potential Candidate - needs more skills" :
                                               "Early Stage - continue learning"
    
    // ── 5. BUILD FINAL SF PAYLOAD ──────────────────────────────
    def syncedAt = new Date().format("yyyy-MM-dd'T'HH:mm:ss")
    
    def sfPayload = [
        currentTitle      : profile.current_role ?: "Not specified",
        yearsOfExperience : profile.experience_years ?: 0,
        industry          : profile.industry ?: "Not specified",
        targetRole        : profile.career_goal ?: "Not specified",
        salaryExpectation : rawSalary,
        location          : location,
        marketFitScore    : marketFit,
        
        learningProgress  : [
            activePaths         : activePaths,
            completedPaths      : completedPaths,
            currentlyLearning   : currentlyLearning,
            overallProgressPct  : overallProgressPct,
            daysCompleted       : completedDays,
            totalDays           : totalDays,
            daysRemaining       : remainingDays
        ],
        
        skillGapAnalysis  : [
            confirmedSkills   : confirmedSkills,
            inProgressSkills  : inProgressSkills,
            missingSkills     : [],
            readinessScore    : readiness,
            gapScore          : gapScore,
            estimatedReadyDate: estimatedReadyDate
        ],
        
        jobMatching       : [
            totalJobsAnalyzed : totalJobsAnalyzed,
            bestMatchTitle    : bestMatchTitle,
            bestMatchScore    : bestMatchScore,
            recommendation    : recommendation
        ],
        
        source   : "Syllabrix",
        syncedAt : syncedAt
    ]
    
    def result = groovy.json.JsonOutput.prettyPrint(
        groovy.json.JsonOutput.toJson(sfPayload)
    )
    
    message.setBody(result)
    message.setHeader("sfSyncComplete", "true")
    message.setHeader("candidateRole", profile.current_role ?: "Unknown")
    message.setHeader("matchScore", bestMatchScore.toString())
    
    return message
}
```

4. Click **Apply**

---

## STEP 10 — Add Content Modifier 2 (Set Content-Type)

1. Drag **Content Modifier** → connect Groovy Script 3 → Content Modifier 2
2. Click it → **Message Header** tab → **Add**:
   ```
   Action:       Create
   Name:         Content-Type
   Source Type:  Constant
   Source Value: application/json
   ```
3. Click **Save**

---

## STEP 11 — Add Send + HTTP Receiver (POST to httpbin)

1. Drag **Send** step → connect Content Modifier 2 → Send
2. Drag **Receiver** from Send → Adapter Type: **HTTP**
3. **Connection tab:**
   ```
   Address:        https://httpbin.org/post
   Method:         POST
   Proxy Type:     Internet
   Authentication: None
   Send Body:      ☑ (MUST be checked)
   Timeout:        60000
   ```
4. Click **Save**

---

## STEP 12 — Add End Event

1. Drag **End Message Event** → connect Send → End
2. Click **Save**

---

## STEP 13 — Verify Canvas

```
[Timer]→[CM1]→[RR1]→[G1]→[RR2]→[G2]→[RR3]→[G3]→[CM2]→[Send]→[End]
               |           |           |                   |
          [HTTP Recv 1] (property) (property)        [HTTP Recv 2]
          /career/profile            /career/jobs     httpbin.org/post
               
         [HTTP Recv 3]         [HTTP Recv 4]  ← wait, see note below
         /career/learning
```

**Receiver count:** 4 total
- Receiver 1 → Request Reply 1 → GET /career/profile
- Receiver 2 → Request Reply 2 → GET /career/learning
- Receiver 3 → Request Reply 3 → GET /career/jobs
- Receiver 4 → Send → POST httpbin.org/post

Check **Problems tab** → No Data before deploying.

---

## STEP 14 — Deploy and Test

1. Click **Deploy** → wait 60 seconds → Monitor → Status: **Started**
2. Wait up to 5 minutes for timer to fire
3. Monitor → **Message Monitor** → look for your iFlow message

**Expected result:** Status = **Completed**

---

## STEP 15 — Verify the Output (Enable Trace)

1. Monitor → All Integration Flows → your iFlow → Log Level: **Trace** → Deploy
2. Wait for trigger → Monitor → Message Monitor → click message
3. Click **Logs** → **Open Text View**
4. Find the Groovy Script 3 output — you should see the full SF payload with skill gap and job match data

---

# PART 5 — TROUBLESHOOTING

---

## Error: Timeout / Connection refused on Syllabrix API
**Cause:** Render free tier is sleeping
**Fix:** Set timeout to `90000` ms. First request wakes the server — subsequent calls in same flow will be faster. Also test the URL in Postman first to wake it up before running iFlow.

## Error: profileData property is null in Groovy 3
**Cause:** Groovy 1 or 2 didn't save the property correctly
**Fix:** Enable Trace → check Groovy 1 output → confirm `profileData` property is set

## Error: jobs list is empty
**Cause:** `/api/career/jobs` returned empty or different structure
**Fix:** Enable Trace → check Request Reply 3 output → inspect actual JSON structure → adjust `jobsJson?.data?.jobs ?: jobsJson?.data` line in Groovy 3

## Error: Groovy compilation error
**Cause:** Import statement used with `def processData(def message)` signature
**Fix:** Never use `import` statements when using `def` method signature

## Error: 401 from Syllabrix
**Cause:** JWT token expired
**Fix:** Postman → login → copy new token → Content Modifier 1 → update → Save → Deploy

---

# PART 6 — INTERVIEW Q&A

---

**Q1: What is OData and how is it different from REST?**

OData is a standardized REST protocol. Regular REST has no standard URL structure. OData defines `/EntitySet(key)`, query options like `$filter/$select/$top`, and a `/$metadata` endpoint. SAP systems (S/4HANA, SuccessFactors) use OData. Non-SAP systems use plain REST.

---

**Q2: How does SAP CPI connect to SuccessFactors?**

Via the **SuccessFactors Adapter** (native) or **HTTP Adapter** (OData calls). Authentication uses **OAuth2 SAML Bearer** (SAP recommended) or Basic Auth (legacy). The SF adapter handles OData concerns like CSRF tokens and pagination automatically.

---

**Q3: What is the difference between Groovy Script and Message Mapping?**

| | Groovy Script | Message Mapping |
|---|---|---|
| Interface | Code | Visual drag-drop |
| Best for | Complex logic, loops, calculations | Simple field-to-field mapping |
| Skill needed | Java/Groovy | No coding |
| Flexibility | Unlimited | Limited to built-in functions |

Use Groovy when logic is complex (skill gap calculation, string manipulation). Use Message Mapping for simple field renaming.

---

**Q4: Why do you need Exchange Properties when making multiple HTTP calls?**

Each Request Reply overwrites the message body with the new response. Previous responses are lost. Exchange Properties are flow-level variables that persist across all steps. You save the body to a property after each call, then read all properties in a final aggregation step.

---

**Q5: What is skill gap analysis in the context of enterprise integration?**

Skill gap analysis compares a candidate's current and in-progress skills against a job's requirements. In CPI, we implement this by: fetching profile (confirmed skills), fetching learning paths (in-progress skills), fetching job postings (required skills), then running Groovy logic to calculate match percentages. The result is a readiness score and estimated ready date — both valuable for HR talent pipeline decisions.

---

# PART 7 — WHAT CHANGES IN PRODUCTION

```
1. Replace httpbin.org with SuccessFactors:
   URL: https://<sf-instance>.successfactors.com/odata/v2/Candidate

2. Add OAuth2 SAML Bearer authentication:
   - Create OAuth2 credential in Security Material
   - Change HTTP Receiver 4 → Authentication: OAuth2 SAML Bearer

3. Add CSRF token handling (required by SF):
   - Before POST: GET with header x-csrf-token: Fetch
   - Save token → add to POST request header

4. Wrap payload in OData format:
   { "__metadata": { "type": "SFOData.Candidate" }, ...fields }

5. Handle SF response:
   - SF returns the created candidate ID
   - Save it for future PATCH (update) calls

6. Change sync logic from INSERT to UPSERT:
   - Check if candidate exists → PATCH if yes, POST if no
```

---

# PART 8 — QUICK REFERENCE CARD

```
┌──────────────────────────────────────────────────────────────────────┐
│              SCENARIO 02 — QUICK REFERENCE                           │
├──────────────────────────────────────────────────────────────────────┤
│ iFlow Name:  S02 - Career Profile Sync to SuccessFactors             │
│ Base URL:    https://syllabrix-api.onrender.com                      │
│ Trigger:     Timer — every 5 min (test) / 1 hr (production)         │
│ Sources:     GET /career/profile, /career/learning, /career/jobs     │
│ Transform:   3 Groovy scripts — save, save, combine+calculate        │
│ Target:      POST httpbin.org/post (simulates SuccessFactors)        │
├──────────────────────────────────────────────────────────────────────┤
│ STEPS IN ORDER:                                                      │
│ 1. Timer Start Event                                                 │
│ 2. Content Modifier 1 → Authorization header                        │
│ 3. Request Reply 1 → HTTP Recv 1 → GET /career/profile              │
│ 4. Groovy 1 → save profile to property                              │
│ 5. Request Reply 2 → HTTP Recv 2 → GET /career/learning             │
│ 6. Groovy 2 → save learning to property                             │
│ 7. Request Reply 3 → HTTP Recv 3 → GET /career/jobs                 │
│ 8. Groovy 3 → combine all + gap calc + job match + build payload    │
│ 9. Content Modifier 2 → Content-Type: application/json             │
│ 10. Send → HTTP Recv 4 → POST httpbin.org/post                      │
│ 11. End Event                                                        │
├──────────────────────────────────────────────────────────────────────┤
│ 4 RECEIVER BOXES REQUIRED                                            │
│ TIMEOUT: 90000ms on all Syllabrix HTTP calls (Render free tier)     │
│ JWT expires: re-login → update Content Modifier 1 → redeploy        │
└──────────────────────────────────────────────────────────────────────┘
```

---

*KT Document v2.0 — Scenario 02 | Syllabrix × SAP BTP Integration Suite | April 2026*
*Next: [Scenario 03 →](WEEK1-SCENARIO-03.md) — Content-Based Routing by User Type*
