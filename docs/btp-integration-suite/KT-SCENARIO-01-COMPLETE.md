# KT Document — Scenario 01: Learning Progress Email Digest
## SAP BTP Cloud Integration | Syllabrix Case Study | Complete Baby-Step SOP
### Version 1.0 | April 2026

---

# PART 1 — WHAT ARE WE BUILDING AND WHY

---

## 1.1 The Business Problem (Plain English)

You are a professional learner on **Syllabrix** — an EdTech platform where you follow skill-based learning paths (e.g., "SAP BTP Integration Suite — 30 days").

**The problem:** You open the app only when you remember to. Nobody is reminding you or your manager about your learning progress. Days pass without updates.

**The solution we are building:** An automated system that:
- Runs every 2 hours on its own (no human trigger needed)
- Calls the Syllabrix API and fetches your current learning paths
- Builds a beautiful HTML email showing your progress
- Sends it directly to your Gmail inbox

This is a **scheduled integration** — no button clicks, no manual exports. It just runs.

---

## 1.2 Why SAP BTP Integration Suite?

SAP BTP (Business Technology Platform) Integration Suite is an enterprise-grade middleware platform used in companies worldwide to connect different systems. It is the industry standard for:

- Connecting SAP systems (ECC, S/4HANA, SuccessFactors) with non-SAP systems (REST APIs, SFTP, SOAP)
- Scheduling automated data flows
- Transforming data between formats (JSON, XML, EDIFACT, CSV)
- Securing credentials and managing API tokens centrally

**In this scenario**, we are using it to connect:
```
Syllabrix REST API  →  CPI (Cloud Integration)  →  Gmail SMTP
```

Even though Syllabrix is a small app, the pattern we use here is identical to what large enterprises use to send HR digest emails, sync learning records to SuccessFactors, or push training completions to SAP LMS.

---

## 1.3 Business Impact

| Stakeholder | Impact |
|---|---|
| Learner (You) | Automatic progress reminders without opening the app |
| Manager/HR | Visibility into team learning without manual reporting |
| Enterprise | Proof that CPI can orchestrate EdTech + Communication systems |
| Interview | Demonstrates Timer, HTTP Adapter, Groovy, Mail Adapter — 4 core CPI skills |

---

## 1.4 How This Translates to Real Enterprise Scenarios

This exact pattern is used in real companies for:

| Industry | Real Use Case | Same Pattern |
|---|---|---|
| HR Tech | Email weekly timesheet summary from SuccessFactors | Timer + HTTP + Mail |
| Retail | Send daily sales report from SAP S/4HANA to managers | Timer + RFC + Mail |
| EdTech | Notify LMS admin of course completion rates | Timer + REST + Mail |
| Finance | Morning FX rate email pulled from market API | Timer + HTTP + Mail |
| Healthcare | Daily patient appointment reminder digest | Timer + JDBC + Mail |

Once you know this pattern, you can build all of them.

---

# PART 2 — CONCEPTS YOU MUST UNDERSTAND BEFORE BUILDING

---

## 2.1 What is an iFlow?

An **iFlow (Integration Flow)** is a visual pipeline you build in SAP Cloud Integration. Think of it like a flowchart where each box is a processing step and arrows show where data moves.

```
[Start]  →  [Get Data]  →  [Transform Data]  →  [Send Data]  →  [End]
```

Each box is called a **step**. Steps can be:
- **Adapters** — connect to external systems (HTTP, Mail, SFTP, SOAP)
- **Transformers** — change the data (Groovy Script, XSLT, Message Mapping)
- **Routing** — decide which path to take (Router, Filter)
- **Control** — manage the flow (Splitter, Aggregator, Content Modifier)

---

## 2.2 Key Components Used in Scenario 01

### Timer Start Event
- Replaces the normal "wait for a message" start
- Fires the iFlow automatically on a schedule
- You set: every N hours / minutes / cron expression
- **No inbound message needed — it creates its own**

### Content Modifier
- Used to set/read headers, properties, or the message body
- In our case: sets the `Authorization: Bearer <token>` header
- Headers flow with the message to the next step

### Request Reply
- Makes an outbound HTTP call to an external system
- Sends the request AND waits for the response
- The response becomes the new message body for the next step
- **Needs its own dedicated Receiver shape** with the HTTP adapter configured

### Groovy Script
- Write custom Java/Groovy code inside the iFlow
- Used when standard steps can't do what you need
- In our case: parses the Syllabrix JSON response and builds an HTML email

### Send Step
- Makes a one-way outbound call (fire and forget)
- Used for sending the email — we don't need a response back
- **Needs its own dedicated Receiver shape** with the Mail adapter

### Receiver Shape
- The external system that a step connects to
- Each Request Reply and Send step needs ONE Receiver
- The Receiver is where you configure the adapter (HTTP, Mail, SFTP, etc.)

---

## 2.3 The Flow Architecture (Full Picture)

```
┌─────────────────────────────────────────────────────────────────┐
│                     INTEGRATION PROCESS BOX                      │
│                                                                   │
│  [Timer]→[Content Modifier]→[Request Reply]→[Groovy]→[Send]     │
│                                   │                    │         │
└───────────────────────────────────┼────────────────────┼─────────┘
                                    │                    │
                            [HTTP Receiver]      [Mail Receiver]
                         (Syllabrix API call)   (Gmail SMTP send)
```

**Key Rule:** The `Sender` box on the LEFT is NEVER connected for Timer-based iFlows. It stays empty. Only `Receiver` boxes on the RIGHT are used.

**Key Rule:** You need TWO separate Receiver boxes:
1. One for Request Reply → connected to HTTP adapter (Syllabrix)
2. One for Send → connected to Mail adapter (Gmail)

---

## 2.4 What is Security Material?

Security Material is CPI's secure vault for storing credentials. You NEVER hardcode passwords or tokens directly in an iFlow step.

Types used in this scenario:
- **User Credentials** — stores username + password (used for Gmail SMTP)

The `Authorization: Bearer <token>` for Syllabrix is handled via the Content Modifier (not Security Material) in this scenario. Scenario 11 will move it to a proper OAuth2 artifact.

---

# PART 3 — PRE-REQUISITES CHECKLIST

Complete ALL of these before touching the iFlow designer.

---

## 3.1 Get Your Syllabrix JWT Token

**Step 1:** Open Postman (or use curl)

**Step 2:** Create a POST request:
```
URL:    https://syllabrix-api.onrender.com/api/auth/login
Method: POST
Body:   raw → JSON
```
```json
{
  "email": "your@email.com",
  "password": "yourpassword"
}
```

**Step 3:** Hit Send → you should get `200 OK` with a response like:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo..."
  }
}
```

**Step 4:** Copy the full token value (the long `eyJ...` string)

**Step 5:** Paste it somewhere safe (Notepad) — you'll need it in Step 4 of the iFlow

> **Important:** This token expires after some days. If you get `401 Unauthorized` later, repeat this step to get a fresh token.

---

## 3.2 Get Gmail App Password

**Step 1:** Go to [myaccount.google.com](https://myaccount.google.com)

**Step 2:** Click **Security** in the left sidebar

**Step 3:** Under "How you sign in to Google", click **2-Step Verification** → enable it if not already done

**Step 4:** Search for **"App passwords"** in the search bar at top → click it

**Step 5:** Under "App name" type: `SAP CPI` → click **Create**

**Step 6:** Google shows a 16-character password like: `abcd efgh ijkl mnop`

**Step 7:** Copy it and **remove all spaces**: `abcdefghijklmnop`

**Step 8:** Save this in Notepad — you'll use it in Step 7 of the iFlow

---

## 3.3 Access Integration Suite

**Step 1:** Go to [account.hanatrial.ondemand.com](https://account.hanatrial.ondemand.com)

**Step 2:** Log in → click your **Subaccount**

**Step 3:** Left sidebar → **Services** → **Instances and Subscriptions**

**Step 4:** Find **Integration Suite** → click **Go to Application**

**Step 5:** On the Integration Suite home → click **"Build Integration Scenarios"** tile

**Step 6:** You are now in **Cloud Integration (CPI)** — this is the iFlow designer

> **If the tile is greyed out:** Go to BTP Cockpit → Security → Users → your user → Assign Role Collections: `PI_Administrator`, `PI_Integration_Developer`, `PI_Business_Expert`

---

# PART 4 — BABY-STEP BUILD GUIDE

---

## STEP 1 — Create a Package

A Package is a folder that holds your iFlows. Create it once, use for all 15 scenarios.

1. In Cloud Integration → click **Design** in the left sidebar
2. Click **Create** button (top right area)
3. Select **Package**
4. Fill in the form:
   ```
   Name:              Syllabrix Integrations
   Short Description: Real-world integration scenarios with Syllabrix EdTech API
   Version:           1.0.0
   ```
5. Click **Save**
6. Click on the package name to open it

✅ **Checkpoint:** You should see an empty package with an "Add" button

---

## STEP 2 — Create the iFlow

1. Inside the package → click **Add** button
2. Select **Integration Flow**
3. Fill in:
   ```
   Name:        S01 - Learning Progress Email Digest
   Description: Polls Syllabrix learning paths and sends email summary every 2 hours
   ```
4. Click **OK**
5. Click the iFlow name to open the visual designer canvas

✅ **Checkpoint:** You see a canvas with a default "Start Message" event and an "Integration Process" box

---

## STEP 3 — Replace Start Event with Timer

The default start waits for an inbound HTTP call. We need it to fire on a schedule instead.

1. Click the **Start Message** event (circle icon on the canvas)
2. Press **Delete** key — it disappears
3. Look at the **top toolbar** — find the icons. Hover over each to find the **Timer** icon (looks like a clock). Alternatively use the search bar: type "Timer"
4. Drag the **Timer Start Event** onto the canvas inside the Integration Process box, on the left side
5. Double-click the Timer → bottom panel shows its properties → click **Processing** tab
6. Set:
   ```
   Scheduler:  Time Interval
   Every:      2
   Unit:       Hour(s)
   Run Once:   ☐ (UNCHECKED — we want it to repeat)
   ```
7. Click somewhere else on the canvas to deselect

✅ **Checkpoint:** Canvas shows a clock icon labeled "Start Timer 1" inside the Integration Process box

---

## STEP 4 — Add Content Modifier (Inject JWT Token)

This step sets the Authorization header before the HTTP call is made.

1. From the top toolbar, find **Content Modifier** (envelope/pencil icon) — or search "Content Modifier"
2. Drag it onto the canvas, to the right of the Timer, inside the Integration Process box
3. Draw an arrow: hover over the Timer until a blue dot appears → drag from that dot to the Content Modifier
4. Click the **Content Modifier** step
5. In the bottom panel → click **Message Header** tab
6. Click **Add** button
7. Fill in the row:
   ```
   Action:       Create
   Name:         Authorization
   Source Type:  Constant
   Source Value: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...YOUR_FULL_TOKEN_HERE
   ```
   > Make sure the value starts with `Bearer ` (capital B, one space, then the token)
8. Click **Save**

✅ **Checkpoint:** Content Modifier shows one row in Message Header tab with Name=Authorization

---

## STEP 5 — Add Request Reply (Call Syllabrix API)

This step makes the actual HTTP GET call to fetch your learning paths.

**Part A — Add the step:**
1. From toolbar/search → find **Request Reply**
2. Drag it onto the canvas, to the right of the Content Modifier, inside the Integration Process box
3. Draw arrow: Content Modifier → Request Reply

**Part B — Add and configure a Receiver for the HTTP call:**
1. On the right edge of the **Request Reply** block, hover until you see a small arrow/connector icon
2. Drag it outward → this creates a **Receiver** shape outside the Integration Process box
3. Click the **Receiver** shape
4. In the bottom panel → **Adapter Type** → select **HTTP**
5. Click the **Connection** tab in the bottom panel
6. Fill in:
   ```
   Address (URL): https://syllabrix-api.onrender.com/api/career/learning
   Query:         (leave empty)
   Proxy Type:    Internet
   Method:        GET
   Send Body:     ☐ (unchecked)
   Authentication: None
   ```
7. Scroll down to **Header Details** section:
   ```
   Request Headers: Authorization
   Response Headers: *
   ```
8. Click **Save**

✅ **Checkpoint:** Canvas shows Timer → Content Modifier → Request Reply ---HTTP---> [Receiver box]. No red error on Request Reply.

---

## STEP 6 — Add Groovy Script (Build Email HTML)

This step reads the Syllabrix API response and converts it into a formatted HTML email.

**Part A — Add the step:**
1. From toolbar/search → find **Script** or **Groovy Script**
2. Drag it onto the canvas, to the right of Request Reply, still inside the Integration Process box
3. Draw arrow: Request Reply → Groovy Script

**Part B — Write the script:**
1. Click the Groovy Script step
2. Bottom panel → **Processing** tab → Script Language: **Groovy**
3. Click **Select** → then click **Create**
4. Name the file: `BuildEmailBody.groovy`
5. The script editor opens with a default template
6. Press **Ctrl+A** to select all existing code → Delete it
7. Paste this entire script:

```groovy
import com.sap.gateway.ip.core.customdev.util.Message
import groovy.json.JsonSlurper

def Message processData(Message message) {
    def body = message.getBody(String.class)
    
    def json
    try {
        json = new JsonSlurper().parseText(body)
    } catch (Exception e) {
        message.setBody("<p>Error parsing Syllabrix response: ${e.message}</p>")
        return message
    }
    
    def paths = json?.data ?: []
    def today = new Date().format("dd MMM yyyy, hh:mm a")
    
    def sb = new StringBuilder()
    sb.append("""<html>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; color: #333;">
  <div style="background: #6C47FF; padding: 24px; border-radius: 12px 12px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 20px;">Syllabrix Learning Progress</h1>
    <p style="color: #d4c8ff; margin: 6px 0 0 0; font-size: 13px;">${today}</p>
  </div>
  <div style="background: #f9f9fb; padding: 24px; border-radius: 0 0 12px 12px;">""")
    
    if (!paths) {
        sb.append("<p style='color:#888;'>No learning paths found. Visit Syllabrix to generate one!</p>")
    } else {
        paths.each { path ->
            def completedDays = 0
            try {
                def completed = path.completed_days
                if (completed instanceof String) {
                    completedDays = new JsonSlurper().parseText(completed).size()
                } else if (completed instanceof List) {
                    completedDays = completed.size()
                }
            } catch (Exception ignored) {}
            
            def totalDays = path.total_days ?: 0
            def pct = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0
            def statusColor = path.status == 'completed' ? '#22c55e' :
                              path.status == 'in_progress' ? '#6C47FF' : '#94a3b8'
            def statusLabel = path.status?.replace('_', ' ')?.capitalize() ?: 'Not started'
            
            sb.append("""
    <div style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; margin-bottom: 12px;">
      <div style="display: flex; justify-content: space-between;">
        <h3 style="margin: 0; font-size: 15px;">${path.skill_name ?: 'Unnamed Path'}</h3>
        <span style="color: ${statusColor}; font-size: 11px; font-weight: bold;">${statusLabel}</span>
      </div>
      <p style="margin: 6px 0; color: #6b7280; font-size: 12px;">${path.difficulty ?: ''} - ${totalDays} days total</p>
      <p style="margin: 4px 0 0 0; color: #6b7280; font-size: 11px;">${completedDays}/${totalDays} days completed (${pct}%)</p>
    </div>""")
        }
    }
    
    sb.append("""
    <div style="text-align: center; margin-top: 20px;">
      <a href="https://syllabrix.com/career/learning"
         style="background: #6C47FF; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-size: 14px;">
        Continue Learning
      </a>
    </div>
  </div>
</body>
</html>""")
    
    message.setBody(sb.toString())
    message.setHeader("emailSubject", "Syllabrix Progress Report - ${today}")
    return message
}
```

8. If a warning popup says "Incompatibilities" → click **OK** (it is just a warning, not an error)
9. Click **Apply** (top right of script editor)

✅ **Checkpoint:** Script editor closes, Groovy Script step no longer says "No resource assigned"

---

## STEP 7 — Add Send Step + Mail Receiver

This step sends the HTML email via Gmail SMTP.

**Part A — Add the Send step:**
1. From toolbar/search → find **Send** (not Request Reply — Send is one-way)
2. Drag it onto the canvas, to the right of Groovy Script, inside the Integration Process box
3. Draw arrow: Groovy Script → Send

**Part B — Add and configure a Mail Receiver:**
1. On the right edge of the **Send** block, hover → drag outward to create a **second Receiver** shape
2. Click this new Receiver shape
3. Bottom panel → **Adapter Type** → select **Mail**
4. Click **Connection** tab:
   ```
   Address:         smtp.gmail.com:587
   Protection:      STARTTLS
   Authentication:  Plain User/Password
   Credential Name: GmailCredentials
   ```
5. Click **Processing** tab:
   ```
   From:         your@gmail.com
   To:           your@gmail.com
   Subject:      ${header.emailSubject}
   Content Type: text/html
   Body:         ${in.body}
   ```
6. Click **Save**

✅ **Checkpoint:** Canvas now has TWO Receiver boxes — one for HTTP (Syllabrix) and one for Mail (Gmail). No red errors anywhere.

---

## STEP 8 — Create Gmail Security Material (GmailCredentials)

Before deploying, create the credential in CPI's secure vault.

1. Click **Monitor** in the left sidebar
2. Click **Manage Security** section → click **Security Material**
3. Click **Add** → select **User Credentials**
4. Fill in:
   ```
   Name:        GmailCredentials
   Description: Gmail SMTP App Password for Syllabrix email digest
   User:        your@gmail.com
   Password:    abcdefghijklmnop   ← your 16-char App Password with NO spaces
   ```
5. Click **Deploy**
6. Wait a few seconds → Status shows **OK**

✅ **Checkpoint:** GmailCredentials appears in the list with Status = OK

---

## STEP 9 — Deploy the iFlow

1. Go back to Design → your iFlow → click **Edit** if not in edit mode
2. Click **Deploy** button (top right, cloud/upload icon)
3. A confirmation dialog appears → click **Yes / Deploy**
4. Wait 30–60 seconds
5. Check: Monitor → **All Integration Flows** → find `S01 - Learning Progress...`
6. Status should show: **Started** (green)

✅ **Checkpoint:** iFlow status = Started in Monitor

---

## STEP 10 — Test Without Waiting 2 Hours

**Method — Change Timer to Run Once:**
1. Go back to your iFlow → click **Edit**
2. Click the **Timer** step
3. Bottom panel → Processing tab → check **Run Once** ☑
4. Click **Deploy**
5. Wait 60 seconds
6. Check your Gmail inbox — you should receive the HTML email
7. **After testing:** go back → uncheck Run Once → redeploy to restore 2-hour schedule

**If no email arrives — Debug with Message Trace:**
1. Monitor → All Integration Flows → click your iFlow
2. Click **Edit** → set Log Level to **Trace** → Deploy
3. Monitor → **Message Monitor** → find your message
4. Click the message → see each step's payload
5. Look for which step has the error

---

# PART 5 — COMPLETE CANVAS DIAGRAM (FINAL STATE)

```
                    ┌──────────────────────────────────────────────────────────────────────┐
                    │                        INTEGRATION PROCESS                            │
                    │                                                                        │
[Sender]            │  [Timer] → [Content  ] → [Request] → [Groovy ] → [Send ]            │
(NOT                │           [Modifier  ]   [Reply 1]   [Script ]   [Step ]            │
 connected)         │           (Auth header)              (Build HTML) (Email)            │
                    │                               │                      │               │
                    └───────────────────────────────┼──────────────────────┼───────────────┘
                                                    │                      │
                                            [Receiver 1]          [Receiver 2]
                                            HTTP Adapter           Mail Adapter
                                            Syllabrix API          Gmail SMTP
                                            GET /career/learning   smtp.gmail.com:587
```

---

# PART 6 — TROUBLESHOOTING GUIDE

---

## Error: 401 Unauthorized from Syllabrix API

**Cause:** JWT token expired
**Fix:**
1. Postman → POST to `/api/auth/login` → copy new token
2. iFlow → Edit → Content Modifier → update Source Value to `Bearer <new_token>`
3. Save → Deploy

---

## Error: SMTP Authentication Failed

**Cause:** Wrong Gmail App Password, or spaces left in
**Fix:**
1. Go to myaccount.google.com → App Passwords → delete old → create new
2. Monitor → Security Material → GmailCredentials → Edit → update password
3. Redeploy iFlow

---

## Error: Request Reply has red cross / no outgoing sequence flow

**Cause:** Request Reply step has no arrow going to the next step
**Fix:** Draw arrow from Request Reply → next step (Groovy Script)

---

## Error: Connection refused on port 587

**Cause:** STARTTLS port blocked on the network
**Fix:** In Mail Adapter → try port **465** with Protection = **SSL**

---

## Error: No email received but iFlow shows Completed

**Cause:** Script returned empty body, or email went to spam
**Fix:**
1. Enable Trace → check the Groovy Script output step payload
2. Check Gmail Spam folder
3. Verify `emailSubject` header is being set in the script

---

## Error: JsonException in Groovy Script

**Cause:** Syllabrix API returned an error instead of JSON
**Fix:**
1. Enable Trace → check what the HTTP step actually received
2. Test the URL directly in Postman to see what it returns
3. If 401 → JWT expired; if 500 → backend issue

---

## iFlow status = Starting (stuck)

**Cause:** CPI runtime taking time or error during initialization
**Fix:** Wait 2 minutes. If still stuck → Undeploy → Deploy again

---

# PART 7 — INTERVIEW Q&A (5 QUESTIONS FOR THIS SCENARIO)

---

**Q1: What is a Timer Start Event in SAP Cloud Integration?**

A Timer Start Event triggers an iFlow on a predefined schedule without requiring any inbound message. Unlike a Message Start Event (which waits for an HTTP POST or SFTP file), a Timer fires autonomously based on a time interval or cron expression. It is used for batch jobs, scheduled reports, polling scenarios, and any use case where the process must run periodically without human initiation.

---

**Q2: Why do you use a Content Modifier before an HTTP call?**

The HTTP Receiver Adapter's "Request Headers" field only accepts header names to pass through — it cannot set new header values. To inject a custom header like `Authorization: Bearer <token>`, you need a Content Modifier step placed before the Request Reply. The Content Modifier creates the header with the value set as a Constant, which is then automatically included when the HTTP call is made.

---

**Q3: What is the difference between Request Reply and Send in CPI?**

| | Request Reply | Send |
|---|---|---|
| Direction | Bi-directional | One-way |
| Waits for response | Yes | No |
| Response becomes payload | Yes | No |
| Use case | REST GET/POST where you need the response | Fire-and-forget (email, event publish) |

In Scenario 01: Request Reply is used for the Syllabrix API call (we need the JSON response). Send is used for the Gmail email (we don't care about SMTP's response).

---

**Q4: How do you store credentials securely in SAP Cloud Integration?**

Use **Security Material** (Monitor → Manage Security → Security Material). Never hardcode credentials in iFlow steps. Types:
- **User Credentials** — username + password (used for SMTP, SFTP, Basic Auth)
- **OAuth2 Client Credentials** — client_id + secret for OAuth flows
- **Secure Parameter** — single value like an API key
- **PGP Keys / Keystore** — for encryption and certificate-based auth

The credential is referenced by name (e.g., `GmailCredentials`) in the adapter config. The actual value is never visible in the iFlow.

---

**Q5: What is Message Trace and when do you use it?**

Message Trace is the highest log level in CPI. When enabled, it captures the exact message payload (body + headers) at every single step of the iFlow. Use it during development and debugging to see what data looks like at each stage.

Steps to use:
1. Monitor → All Integration Flows → your iFlow → set Log Level = Trace → Deploy
2. Trigger the iFlow
3. Monitor → Message Monitor → click your message → inspect each step

**Always set Log Level back to Error in production.** Trace stores large amounts of data and can slow processing and fill storage quickly.

---

# PART 8 — IF THIS SCENARIO COMES IN A FUTURE PROJECT

---

## Pattern Recognition

When a client says any of the following, think **Scenario 01 pattern**:
- "We need a scheduled email report"
- "Every X hours, fetch data from API Y and email it to Z"
- "Automate the morning digest"
- "Pull data from system A on a schedule and notify stakeholders"

---

## Reusable Checklist for Any Timer + HTTP + Mail iFlow

```
PRE-BUILD:
□ Get auth token/credentials for the source API
□ Get SMTP credentials for the mail server
□ Create Security Material entries
□ Test the API endpoint manually in Postman

BUILD:
□ Timer Start Event (set interval)
□ Content Modifier (set auth headers)
□ Request Reply + HTTP Receiver (call source API)
□ Groovy/XSLT step (transform response to email format)
□ Send step + Mail Receiver (send email)

CONFIGURE:
□ HTTP Receiver: URL, Method, Authentication
□ Mail Receiver: SMTP host:port, STARTTLS, Credential Name
□ Mail Processing: From, To, Subject (use header), Content-Type: text/html

TEST:
□ Enable Run Once on Timer → Deploy → check inbox
□ If failed: enable Trace → inspect each step
□ Disable Run Once → redeploy for production schedule

PRODUCTION:
□ Log Level = Error
□ JWT refresh strategy documented (when does it expire?)
□ Undeploy when not needed (trial has 2-iFlow limit)
```

---

## Adapting for Different Mail Servers

| Server | SMTP Address | Port | Protection |
|---|---|---|---|
| Gmail | smtp.gmail.com | 587 | STARTTLS |
| Gmail (alt) | smtp.gmail.com | 465 | SSL |
| Outlook/Office365 | smtp.office365.com | 587 | STARTTLS |
| SendGrid | smtp.sendgrid.net | 587 | STARTTLS |
| SAP BTP Mail | configured in BTP cockpit | varies | varies |

---

## Adapting for Different Source APIs

Just change:
1. The URL in the HTTP Receiver adapter
2. The auth mechanism in Content Modifier
3. The Groovy script to parse the new API's response format

Everything else (Timer, Send, Mail adapter) stays the same.

---

# PART 9 — QUICK REFERENCE CARD

```
┌──────────────────────────────────────────────────────────────┐
│           SCENARIO 01 — QUICK REFERENCE                      │
├──────────────────────────────────────────────────────────────┤
│ iFlow Name:   S01 - Learning Progress Email Digest           │
│ Package:      Syllabrix Integrations                         │
│ Trigger:      Timer — every 2 hours                          │
│ Source API:   https://syllabrix-version-101-production       │
│               .up.railway.app/api/career/learning            │
│ Auth:         Bearer JWT (set via Content Modifier)          │
│ Transform:    Groovy Script → HTML email body                │
│ Destination:  Gmail SMTP → smtp.gmail.com:587                │
│ Credential:   GmailCredentials (Security Material)           │
├──────────────────────────────────────────────────────────────┤
│ STEPS IN ORDER:                                              │
│ 1. Timer Start Event                                         │
│ 2. Content Modifier (set Authorization header)               │
│ 3. Request Reply → HTTP Receiver (GET Syllabrix API)         │
│ 4. Groovy Script (parse JSON, build HTML)                    │
│ 5. Send → Mail Receiver (send via Gmail SMTP)                │
├──────────────────────────────────────────────────────────────┤
│ TWO RECEIVER BOXES REQUIRED:                                 │
│   Receiver 1 → Request Reply → HTTP adapter                  │
│   Receiver 2 → Send step → Mail adapter                      │
├──────────────────────────────────────────────────────────────┤
│ JWT EXPIRES? → Postman → login → copy token →                │
│   Content Modifier → update Source Value → Save → Deploy     │
├──────────────────────────────────────────────────────────────┤
│ TEST WITHOUT WAITING: Timer → Run Once ☑ → Deploy →         │
│   check inbox → Run Once ☐ → Deploy again                   │
└──────────────────────────────────────────────────────────────┘
```

---

*KT Document — Scenario 01 | Syllabrix × SAP BTP Integration Suite | April 2026*
*Next: [Scenario 02 →](WEEK1-SCENARIO-02.md) — Syllabrix Career Profile → SAP SuccessFactors (REST-to-REST Mapping)*
