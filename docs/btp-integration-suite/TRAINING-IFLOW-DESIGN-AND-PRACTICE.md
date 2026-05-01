# CPI iFlow Design — Complete Training Notes + Practice Scenarios
## SAP BTP Cloud Integration | Syllabrix Case Study | April 2026

---

# PART 1 — COMPLETE NOTES: HOW TO DESIGN ANY iFLOW

---

## 1.1 The Golden Rule — Always Think in 3 Questions

Before touching the CPI designer, answer these 3 questions on paper:

```
Question 1: WHAT STARTS the flow?
Question 2: WHAT HAPPENS in the middle?
Question 3: WHERE does the data go at the end?
```

These 3 answers will tell you exactly which palette components to pick.

---

## 1.2 Question 1 — What Starts the Flow?

### Decision Table: Choosing Your Start Event

| Scenario | Start Event | Adapter on Sender |
|---|---|---|
| Runs on a schedule automatically | Timer Start Event | None (no Sender needed) |
| Someone calls a REST/HTTP endpoint | Message Start Event | HTTP Sender Adapter |
| A file appears on an SFTP server | Message Start Event | SFTP Sender Adapter |
| A SOAP/WSDL call comes in | Message Start Event | SOAP Sender Adapter |
| An event arrives from SAP Event Mesh | Message Start Event | Event Mesh Adapter |
| An IDoc arrives from SAP ECC | Message Start Event | IDoc Sender Adapter |
| A message arrives in a queue | Message Start Event | AMQP / JMS Adapter |

### Key Rule about the Sender Box
- **Timer Start Event** → Sender box stays EMPTY, no connection needed
- **Message Start Event** → Sender box is connected with the inbound adapter
- The Sender box is always on the LEFT of the canvas

---

## 1.3 Question 2 — What Happens In Between?

### The Processing Step Decision Tree

```
Need to SET a header / property / body value?
    └── Content Modifier

Need to CALL an external system and USE its response?
    └── Request Reply  (bi-directional — waits for response)

Need to SEND data to an external system (no response needed)?
    └── Send Step  (fire-and-forget)

Need to write CUSTOM LOGIC (loops, conditions, JSON parsing)?
    └── Groovy Script

Need to MAP fields from one structure to another (graphical)?
    └── Message Mapping

Need to TRANSFORM XML to XML using a stylesheet?
    └── XSLT Mapping

Need to CONVERT CSV / flat file to XML?
    └── CSV to XML Converter

Need to SPLIT one message into many individual messages?
    └── Splitter (General / Iterating / IDoc)

Need to MERGE many messages back into one?
    └── Aggregator

Need to ROUTE to different paths based on a condition?
    └── Router

Need to SEND to multiple targets at the same time?
    └── Multicast (Parallel or Sequential)

Need to FILTER — pass only if condition is true?
    └── Filter

Need to STORE data for later use?
    └── Data Store Write / Read

Need to HANDLE errors gracefully?
    └── Exception Subprocess

Need to DEDUPLICATE — process each message only once?
    └── Idempotent Process Call
```

---

## 1.4 Question 3 — Where Does Data Go?

### Adapter Selection Guide

| Target System | Adapter | Protocol |
|---|---|---|
| Any REST API | HTTP Adapter | HTTP/HTTPS |
| Gmail / Outlook / SMTP server | Mail Adapter | SMTP |
| FTP / SFTP file server | SFTP Adapter | SSH/FTP |
| SAP S/4HANA (RFC/BAPI) | RFC Adapter | RFC |
| SAP SuccessFactors | SuccessFactors Adapter | OData |
| SAP Ariba | Ariba Adapter | REST |
| SOAP/WSDL web service | SOAP Adapter | SOAP |
| Any database | JDBC Adapter | JDBC |
| SAP Event Mesh | Event Mesh Adapter | AMQP |
| Slack / Teams / webhook | HTTP Adapter | HTTP POST |
| SAP IDoc (ECC/S4) | IDoc Adapter | IDoc |
| OData service | OData Adapter | OData V2/V4 |

### Key Rule about Receiver Boxes
- Every **Request Reply** step needs its OWN dedicated Receiver box
- Every **Send** step needs its OWN dedicated Receiver box
- You can have MULTIPLE Receiver boxes in one iFlow
- Receiver boxes are always on the RIGHT of the canvas

---

## 1.5 The 5-Step iFlow Design Method (Use Every Time)

### Step 1 — Write the flow in plain English
```
Example: "Every morning at 9AM, fetch job matches from Syllabrix,
          filter only high-match jobs, and send a summary to Slack"
```

### Step 2 — Identify the trigger
```
"Every morning at 9AM" = Timer Start Event (scheduler: cron = 0 9 * * *)
```

### Step 3 — Break middle into steps
```
"Fetch job matches from Syllabrix"  → Request Reply + HTTP Receiver
"Filter only high-match jobs"       → Groovy Script (filter logic)
"Send a summary to Slack"           → Send + HTTP Receiver (Slack webhook)
```

### Step 4 — Identify what needs to be SET before each call
```
Before HTTP call → Content Modifier (set Authorization header)
Before Slack call → Groovy Script (build Slack JSON payload)
```

### Step 5 — Draw left to right, add End Event
```
[Timer] → [Content Modifier] → [Request Reply] → [Groovy] → [Send] → [End]
                                      |                          |
                               [HTTP Receiver]           [HTTP Receiver]
                               (Syllabrix API)           (Slack Webhook)
```

---

## 1.6 Full Palette Component Reference

### Events (Start / End)
| Component | Icon | When to Use |
|---|---|---|
| Timer Start Event | Clock | Scheduled autonomous trigger |
| Message Start Event | Envelope | Waits for inbound message |
| End Message Event | Circle (thick border) | Normal successful end |
| Error End Event | Circle (red X) | Deliberate failure end |
| Escalation End Event | Circle (triangle) | Non-fatal escalation |

### Call Steps
| Component | When to Use | Has Response? |
|---|---|---|
| Request Reply | Call external system, use its response | YES |
| Send | Call external system, ignore response | NO |
| Service Call | Internal subprocess call | YES |

### Transformers
| Component | When to Use |
|---|---|
| Content Modifier | Set/read headers, properties, body |
| Groovy Script | Custom logic, JSON parsing, dynamic values |
| XSLT Mapping | XML-to-XML transformation via stylesheet |
| Message Mapping | Graphical drag-and-drop field mapping |
| Filter | Pass message only if XPath/property condition is true |
| CSV to XML Converter | Convert flat CSV files to XML |
| XML to CSV Converter | Convert XML back to CSV |
| Encoder / Decoder | Base64, GZIP, MIME encoding |

### Routing
| Component | When to Use |
|---|---|
| Router | Send to ONE matching branch based on condition |
| Multicast | Send to ALL branches (parallel or sequential) |

### Aggregation / Splitting
| Component | When to Use |
|---|---|
| General Splitter | Split by XPath expression |
| Iterating Splitter | Split into N chunks of size X |
| IDoc Splitter | Split SAP IDoc messages |
| Gather | Collect split messages back together |
| Aggregator | Merge multiple independent messages into one |

### Persistence
| Component | When to Use |
|---|---|
| Data Store Write | Save message to CPI's internal storage |
| Data Store Read | Read previously saved message |
| Data Store Delete | Delete stored entry |
| Idempotent Process Call | Check + mark message as processed (deduplication) |

### Error Handling
| Component | When to Use |
|---|---|
| Exception Subprocess | Catch errors from the main flow |
| Terminate Message | Stop processing immediately |

---

## 1.7 Headers vs Properties vs Body — Know the Difference

| | Headers | Exchange Properties | Message Body |
|---|---|---|---|
| What it is | Key-value metadata | Internal flow variables | The actual payload |
| Flows to external system? | YES (sent with HTTP calls) | NO (internal only) | YES |
| Set using | Content Modifier | Content Modifier | Content Modifier / Script |
| Read using | `${header.name}` | `${property.name}` | `${in.body}` |
| Use for | Auth tokens, Content-Type, custom metadata | Routing flags, counters, temp values | JSON, XML, CSV, HTML |

### Example from Scenario 01:
- **Header:** `Authorization: Bearer eyJ...` — sent WITH the HTTP call to Syllabrix
- **Header:** `emailSubject: Syllabrix Progress...` — set by Groovy, used in Mail adapter
- **Body:** The JSON from Syllabrix → then replaced by HTML email body

---

## 1.8 The Receiver Box Rules (Most Common Confusion)

```
RULE 1: Every Request Reply needs its OWN Receiver
RULE 2: Every Send needs its OWN Receiver
RULE 3: The Receiver is where you configure the ADAPTER (HTTP, Mail, SFTP)
RULE 4: Multiple steps CANNOT share a Receiver
RULE 5: Receiver boxes go OUTSIDE the Integration Process box
RULE 6: Connect step → Receiver with a DASHED line (adapter channel)
RULE 7: The sequence flow (solid arrow) stays INSIDE the process box
```

Visual guide:
```
┌─────────────────────────────────────────┐
│         Integration Process             │
│                                         │
│  [Step A] ──→ [Request Reply] ──→ [Step B] ──→ [Send] ──→ [End]
│                     |                               |    │
└─────────────────────|───────────────────────────────|────┘
                      | (dashed)                      | (dashed)
                 [Receiver A]                    [Receiver B]
                 HTTP Adapter                   Mail Adapter
```

---

# PART 2 — PRACTICE SCENARIOS (SAME PATTERN AS SCENARIO 01)

All 5 scenarios below use the **Timer + HTTP + Transform + Send** pattern.
Build them in order — each one adds one new concept on top of the last.

---

## Practice Scenario P01 — Daily Job Match Alert

**Difficulty:** ★☆☆ (same as Scenario 01)

### Business Story
Every morning at 9AM, fetch your top job matches from Syllabrix and send yourself an email digest of companies hiring for your skill set.

### Flow in Plain English
```
Every day at 9AM →
  Call Syllabrix /api/career/jobs →
  Parse jobs, build HTML email →
  Send to Gmail
```

### iFlow Architecture
```
[Timer: 9AM daily] → [Content Modifier] → [Request Reply] → [Groovy] → [Send] → [End]
                                               |                           |
                                        [HTTP Receiver]            [Mail Receiver]
                                     /api/career/jobs              Gmail SMTP
```

### Timer Configuration
```
Scheduler: Cron
Cron Expression: 0 9 * * *   (every day at 9:00 AM)
```
> Note: CPI uses UTC time. India (IST) = UTC+5:30. For 9AM IST, use cron: `0 3:30 * * *` → enter as `30 3 * * *`

### HTTP Adapter
```
URL:    https://syllabrix-api.onrender.com/api/career/jobs
Method: GET
```

### Groovy Script (paste this)
```groovy
import com.sap.gateway.ip.core.customdev.util.Message
import groovy.json.JsonSlurper

def Message processData(Message message) {
    def body = message.getBody(String.class)
    def json
    try {
        json = new JsonSlurper().parseText(body)
    } catch (Exception e) {
        message.setBody("<p>Error: ${e.message}</p>")
        return message
    }

    def jobs = json?.data?.jobs ?: json?.data ?: []
    def today = new Date().format("dd MMM yyyy")

    def sb = new StringBuilder()
    sb.append("""<html>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
  <div style="background: #0f172a; padding: 24px; border-radius: 12px 12px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 20px;">Job Matches for ${today}</h1>
    <p style="color: #94a3b8; margin: 6px 0 0 0;">Your daily Syllabrix job radar</p>
  </div>
  <div style="background: #f8fafc; padding: 24px; border-radius: 0 0 12px 12px;">""")

    if (!jobs) {
        sb.append("<p style='color:#888;'>No job matches found today. Keep learning!</p>")
    } else {
        def count = 0
        jobs.each { job ->
            if (count >= 5) return
            sb.append("""
    <div style="background: white; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px; margin-bottom: 12px;">
      <h3 style="margin: 0; color: #1e293b;">${job.title ?: job.job_title ?: 'Job Opening'}</h3>
      <p style="margin: 4px 0; color: #6366f1; font-weight: bold;">${job.company ?: job.company_name ?: 'Company'}</p>
      <p style="margin: 4px 0; color: #64748b; font-size: 13px;">${job.location ?: 'Location not specified'}</p>
    </div>""")
            count++
        }
    }

    sb.append("""
    <div style="text-align: center; margin-top: 20px;">
      <a href="https://syllabrix.com/career/jobs"
         style="background: #6366f1; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none;">
        View All Jobs
      </a>
    </div>
  </div>
</body></html>""")

    message.setBody(sb.toString())
    message.setHeader("emailSubject", "Your Job Matches — ${today}")
    return message
}
```

### Mail Adapter
```
From:          123anita2kumari@gmail.com
To:            123anita2kumari@gmail.com
Subject:       ${header.emailSubject}
Body:          ${in.body}
Body Mime-Type: Text/HTML
Credential:    GmailCredentials
```

### New Concept Learned
- **Cron expressions** in Timer Start Event for specific time scheduling
- `0 9 * * *` = minute hour day month weekday (standard Unix cron)

---

## Practice Scenario P02 — Career Profile Change Alert

**Difficulty:** ★☆☆

### Business Story
Every 4 hours, fetch your Syllabrix career profile and email it to yourself as a snapshot — useful to track how your profile score changes over time.

### Flow in Plain English
```
Every 4 hours →
  Call Syllabrix /api/career/profile →
  Build a profile summary email →
  Send to Gmail
```

### iFlow Architecture
```
[Timer: 4hrs] → [Content Modifier] → [Request Reply] → [Groovy] → [Send] → [End]
                                           |                          |
                                    [HTTP Receiver]           [Mail Receiver]
                                  /api/career/profile          Gmail SMTP
```

### Timer Configuration
```
Scheduler: Time Interval
Every:     4
Unit:      Hour(s)
```

### HTTP Adapter
```
URL:    https://syllabrix-api.onrender.com/api/career/profile
Method: GET
```

### Groovy Script
```groovy
import com.sap.gateway.ip.core.customdev.util.Message
import groovy.json.JsonSlurper

def Message processData(Message message) {
    def body = message.getBody(String.class)
    def json
    try {
        json = new JsonSlurper().parseText(body)
    } catch (Exception e) {
        message.setBody("<p>Error: ${e.message}</p>")
        return message
    }

    def profile = json?.data ?: [:]
    def today = new Date().format("dd MMM yyyy, hh:mm a")

    def marketFit = profile.market_fit_score ?: 0
    def fitColor = marketFit >= 70 ? '#22c55e' : marketFit >= 40 ? '#f59e0b' : '#ef4444'
    def fitLabel = marketFit >= 70 ? 'Strong' : marketFit >= 40 ? 'Growing' : 'Early Stage'

    def sb = new StringBuilder()
    sb.append("""<html>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
  <div style="background: #7c3aed; padding: 24px; border-radius: 12px 12px 0 0;">
    <h1 style="color: white; margin: 0;">Career Profile Snapshot</h1>
    <p style="color: #ddd6fe; margin: 6px 0 0 0;">${today}</p>
  </div>
  <div style="background: #faf5ff; padding: 24px; border-radius: 0 0 12px 12px;">
    <table style="width: 100%; border-collapse: collapse;">
      <tr style="border-bottom: 1px solid #e9d5ff;">
        <td style="padding: 10px; color: #6b7280;">Current Role</td>
        <td style="padding: 10px; font-weight: bold;">${profile.current_role ?: 'Not set'}</td>
      </tr>
      <tr style="border-bottom: 1px solid #e9d5ff;">
        <td style="padding: 10px; color: #6b7280;">Industry</td>
        <td style="padding: 10px; font-weight: bold;">${profile.industry ?: 'Not set'}</td>
      </tr>
      <tr style="border-bottom: 1px solid #e9d5ff;">
        <td style="padding: 10px; color: #6b7280;">Experience</td>
        <td style="padding: 10px; font-weight: bold;">${profile.experience_years ?: 0} years</td>
      </tr>
      <tr style="border-bottom: 1px solid #e9d5ff;">
        <td style="padding: 10px; color: #6b7280;">Career Goal</td>
        <td style="padding: 10px; font-weight: bold;">${profile.career_goal ?: 'Not set'}</td>
      </tr>
      <tr>
        <td style="padding: 10px; color: #6b7280;">Market Fit Score</td>
        <td style="padding: 10px;">
          <span style="background: ${fitColor}20; color: ${fitColor};
                       padding: 4px 12px; border-radius: 20px; font-weight: bold;">
            ${marketFit}% — ${fitLabel}
          </span>
        </td>
      </tr>
    </table>
    <div style="text-align: center; margin-top: 20px;">
      <a href="https://syllabrix.com/career"
         style="background: #7c3aed; color: white; padding: 12px 28px;
                border-radius: 8px; text-decoration: none;">
        Update Profile
      </a>
    </div>
  </div>
</body></html>""")

    message.setBody(sb.toString())
    message.setHeader("emailSubject", "Career Profile Snapshot — ${today}")
    return message
}
```

### New Concept Learned
- Calling a **different API endpoint** with the same Timer + HTTP pattern
- Building a **table-based HTML email** instead of card-based
- Using **conditional color coding** in Groovy (green/yellow/red based on score)

---

## Practice Scenario P03 — Skill Gap Weekly Report

**Difficulty:** ★★☆ (introduces a second HTTP call in the same flow)

### Business Story
Every Monday morning, fetch both your career profile AND your learning paths, combine them into one weekly skill gap report email.

### Flow in Plain English
```
Every Monday 8AM →
  Call Syllabrix /api/career/profile → save result
  Call Syllabrix /api/career/learning → save result
  Combine both into one HTML email →
  Send to Gmail
```

### iFlow Architecture
```
[Timer: Monday 8AM]
  → [Content Modifier: set auth header]
  → [Request Reply 1: GET /career/profile]
  → [Groovy Script 1: save profile data to property]
  → [Request Reply 2: GET /career/learning]
  → [Groovy Script 2: combine both, build email]
  → [Send]
  → [End]
```

### New Concepts Learned
- **Two Request Reply steps** in one iFlow (chained HTTP calls)
- **Exchange Properties** — save first response, use it in second Groovy script
- Each Request Reply has its OWN Receiver box (3 Receivers total — 2 HTTP + 1 Mail)

### Groovy Script 1 — Save Profile Data
```groovy
import com.sap.gateway.ip.core.customdev.util.Message
import groovy.json.JsonSlurper

def Message processData(Message message) {
    def body = message.getBody(String.class)
    // Save profile response as a property — body will be overwritten by next HTTP call
    message.setProperty("profileData", body)
    return message
}
```

### Groovy Script 2 — Combine and Build Email
```groovy
import com.sap.gateway.ip.core.customdev.util.Message
import groovy.json.JsonSlurper

def Message processData(Message message) {
    def profileRaw = message.getProperty("profileData")
    def learningRaw = message.getBody(String.class)

    def profile = new JsonSlurper().parseText(profileRaw)?.data ?: [:]
    def learning = new JsonSlurper().parseText(learningRaw)?.data ?: []
    def today = new Date().format("dd MMM yyyy")

    def totalPaths = learning.size()
    def inProgress = learning.findAll { it.status == 'in_progress' }.size()
    def completed = learning.findAll { it.status == 'completed' }.size()

    def sb = new StringBuilder()
    sb.append("""<html>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
  <div style="background: #0f766e; padding: 24px; border-radius: 12px 12px 0 0;">
    <h1 style="color: white; margin: 0;">Weekly Skill Gap Report</h1>
    <p style="color: #99f6e4; margin: 6px 0 0 0;">Week of ${today}</p>
  </div>
  <div style="background: #f0fdfa; padding: 24px;">
    <h3 style="color: #0f766e;">Your Profile</h3>
    <p><b>Role:</b> ${profile.current_role ?: 'Not set'} |
       <b>Goal:</b> ${profile.career_goal ?: 'Not set'} |
       <b>Market Fit:</b> ${profile.market_fit_score ?: 0}%</p>

    <h3 style="color: #0f766e; margin-top: 20px;">Learning Summary</h3>
    <p>Total Paths: <b>${totalPaths}</b> |
       In Progress: <b>${inProgress}</b> |
       Completed: <b>${completed}</b></p>
  </div>
  <div style="text-align: center; padding: 20px; background: #f0fdfa; border-radius: 0 0 12px 12px;">
    <a href="https://syllabrix.com"
       style="background: #0f766e; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none;">
      Go to Syllabrix
    </a>
  </div>
</body></html>""")

    message.setBody(sb.toString())
    message.setHeader("emailSubject", "Weekly Skill Gap Report — ${today}")
    return message
}
```

---

## Practice Scenario P04 — Slack Notification Instead of Email

**Difficulty:** ★★☆ (replaces Mail adapter with HTTP adapter for Slack)

### Business Story
Every 3 hours, fetch Syllabrix learning progress and send a short summary to a Slack channel instead of email.

### Flow in Plain English
```
Every 3 hours →
  Call Syllabrix /api/career/learning →
  Build a Slack-formatted JSON message →
  POST to Slack Webhook URL
```

### New Concepts Learned
- **HTTP Receiver for outbound POST** (not just GET)
- Building **JSON payload** in Groovy (not HTML)
- **Slack webhook** format — a real enterprise integration pattern
- No Mail adapter needed — both calls use HTTP adapter

### iFlow Architecture
```
[Timer: 3hrs] → [Content Modifier] → [Request Reply] → [Groovy] → [Send] → [End]
                                           |                          |
                                    [HTTP Receiver]           [HTTP Receiver]
                                  Syllabrix GET /learning     Slack POST webhook
```

### Get a Slack Webhook URL (Free)
1. Go to [api.slack.com/apps](https://api.slack.com/apps) → Create New App
2. From Scratch → name it `Syllabrix Bot` → pick your workspace
3. Click **Incoming Webhooks** → Activate
4. Click **Add New Webhook to Workspace** → pick a channel
5. Copy the webhook URL: `https://hooks.slack.com/services/T.../B.../...`

### Second HTTP Receiver (Slack) Configuration
```
URL:            https://hooks.slack.com/services/YOUR/WEBHOOK/URL
Method:         POST
Authentication: None
Content-Type Header: application/json
```

### Groovy Script — Build Slack Payload
```groovy
import com.sap.gateway.ip.core.customdev.util.Message
import groovy.json.JsonSlurper
import groovy.json.JsonOutput

def Message processData(Message message) {
    def body = message.getBody(String.class)
    def json = new JsonSlurper().parseText(body)
    def paths = json?.data ?: []
    def today = new Date().format("dd MMM yyyy, hh:mm a")

    def blocks = []
    blocks.add([
        type: "header",
        text: [type: "plain_text", text: "Syllabrix Learning Update — ${today}"]
    ])

    if (!paths) {
        blocks.add([type: "section", text: [type: "mrkdwn", text: "No learning paths found."]])
    } else {
        paths.each { path ->
            def totalDays = path.total_days ?: 0
            def status = path.status?.replace('_', ' ')?.capitalize() ?: 'Not started'
            blocks.add([
                type: "section",
                text: [type: "mrkdwn",
                       text: "*${path.skill_name ?: 'Path'}* — ${status}\n${totalDays} days total"]
            ])
        }
    }

    def slackPayload = JsonOutput.toJson([blocks: blocks])
    message.setBody(slackPayload)
    message.setHeader("Content-Type", "application/json")
    return message
}
```

---

## Practice Scenario P05 — Multi-Channel Alert (Email + Slack Together)

**Difficulty:** ★★★ (introduces Multicast)

### Business Story
Every 6 hours, fetch Syllabrix progress and send it to BOTH Gmail AND Slack simultaneously.

### Flow in Plain English
```
Every 6 hours →
  Call Syllabrix /api/career/learning →
  Split into two parallel branches:
    Branch 1: Build HTML → Send via Gmail
    Branch 2: Build JSON → POST to Slack
```

### New Concepts Learned
- **Multicast step** — sends the same message to multiple branches simultaneously
- **Parallel vs Sequential** multicast
- Two different transformations of the SAME source data

### iFlow Architecture
```
[Timer: 6hrs]
  → [Content Modifier: auth header]
  → [Request Reply: GET /career/learning]
  → [Multicast]
       ├── Branch 1: [Groovy: HTML email] → [Send] → [Mail Receiver: Gmail]
       └── Branch 2: [Groovy: Slack JSON] → [Send] → [HTTP Receiver: Slack]
  → [End]
```

### Multicast Configuration
```
In the Multicast step:
  Parallel Processing: YES (both branches run at the same time)
  Stop on Exception:   NO  (if Slack fails, email still sends)
```

### Key Design Points
- After Multicast, each branch is independent
- Each branch has its own Groovy script and Send step
- Each branch has its own Receiver box
- The Multicast step itself has no adapter — it just splits the flow

---

# PART 3 — BUILD ORDER AND PROGRESSION

---

## Recommended Build Order

| # | Scenario | New Concept | Time |
|---|---|---|---|
| S01 | Learning Progress Email (already done) | Timer, HTTP, Groovy, Mail | Done |
| P01 | Job Match Email | Cron timer, different endpoint | 30 min |
| P02 | Career Profile Email | Different data structure in Groovy | 30 min |
| P03 | Weekly Skill Gap (2 HTTP calls) | Chained HTTP, Exchange Properties | 1 hr |
| P04 | Slack Notification | HTTP POST adapter, JSON payload | 1 hr |
| P05 | Email + Slack Together | Multicast, parallel branches | 1.5 hr |

---

## What Changes Between Scenarios

```
S01 → P01:  Change the Timer (cron vs interval) + Change the URL
S01 → P02:  Change the URL + Change the Groovy HTML structure
P02 → P03:  Add a second Request Reply + Add Groovy property save
P01 → P04:  Replace Mail adapter with HTTP adapter + Change Groovy to JSON
P04 → P05:  Add Multicast + duplicate the Send branch
```

---

# PART 4 — COMMON MISTAKES AND HOW TO AVOID THEM

---

## Mistake 1: Sharing a Receiver between two steps
**Wrong:** Request Reply and Send both pointing to one Receiver box
**Right:** Each step has its own dedicated Receiver box

## Mistake 2: Connecting Sender box in Timer-based iFlow
**Wrong:** Drawing an arrow from Sender → Timer
**Right:** Sender box stays empty and unconnected for Timer flows

## Mistake 3: No End Event
**Wrong:** Flow ends at Send step with no End Event
**Right:** Always add End Message Event after the last step in the flow

## Mistake 4: Wrong Mime Type for HTML email
**Wrong:** Body Mime-Type = Text/Plain (shows raw HTML tags)
**Right:** Body Mime-Type = Text/HTML (renders the email properly)

## Mistake 5: Bearer token without space
**Wrong:** `BearereyJhbGci...`
**Right:** `Bearer eyJhbGci...` (one space after Bearer)

## Mistake 6: Not saving intermediate data before it gets overwritten
**Wrong:** Call API 1 → Call API 2 → try to use API 1 data (it's gone)
**Right:** After API 1 → use Groovy to save body to a Property → then Call API 2

## Mistake 7: Hardcoding passwords in iFlow
**Wrong:** Pasting password directly in Mail adapter
**Right:** Store in Security Material → reference by name (GmailCredentials)

## Mistake 8: Forgetting to uncheck Run Once after testing
**Wrong:** Leave Run Once checked → iFlow only fires once and stops
**Right:** Uncheck Run Once → redeploy → it runs on schedule forever

---

# PART 5 — QUICK CHEAT SHEET (PRINT THIS)

```
┌─────────────────────────────────────────────────────────────┐
│                  iFLOW DESIGN CHEAT SHEET                   │
├─────────────────────────────────────────────────────────────┤
│ STARTS WITH SCHEDULE?  → Timer Start Event                  │
│ STARTS WITH HTTP CALL? → Message Start Event + HTTP Sender  │
│ STARTS WITH FILE?      → Message Start Event + SFTP Sender  │
├─────────────────────────────────────────────────────────────┤
│ SET HEADER/PROPERTY?   → Content Modifier                   │
│ CALL API, NEED RESULT? → Request Reply + Receiver           │
│ SEND DATA, NO RESULT?  → Send + Receiver                    │
│ CUSTOM LOGIC / JSON?   → Groovy Script                      │
│ FIELD MAPPING?         → Message Mapping or XSLT            │
│ SPLIT MESSAGE?         → Splitter                           │
│ ROUTE CONDITIONALLY?   → Router                             │
│ SEND TO MANY TARGETS?  → Multicast                          │
│ STORE FOR LATER?       → Data Store Write/Read              │
├─────────────────────────────────────────────────────────────┤
│ REST API TARGET?       → HTTP Adapter                       │
│ EMAIL TARGET?          → Mail Adapter (SMTP)                │
│ FILE SERVER TARGET?    → SFTP Adapter                       │
│ SAP SF TARGET?         → SuccessFactors Adapter             │
│ DATABASE TARGET?       → JDBC Adapter                       │
├─────────────────────────────────────────────────────────────┤
│ RECEIVER RULES:                                             │
│  - Each Request Reply → own Receiver                        │
│  - Each Send → own Receiver                                 │
│  - Receivers go OUTSIDE process box                         │
│  - Sender stays EMPTY for Timer flows                       │
├─────────────────────────────────────────────────────────────┤
│ ALWAYS END WITH: End Message Event                          │
│ ALWAYS TEST WITH: Timer → Run Once ☑ → Deploy              │
│ ALWAYS DEBUG WITH: Log Level = Trace → Message Monitor      │
│ ALWAYS RESTORE: Log Level = Error after testing             │
└─────────────────────────────────────────────────────────────┘
```

---

*Training Document | Syllabrix × SAP BTP Cloud Integration | April 2026*
*Build P01 → P02 → P03 → P04 → P05 in order for complete mastery of the Timer+HTTP pattern*