# SAP BTP Integration Suite — Master Case Study
## Project: Syllabrix ↔ SAP Ecosystem Integration
### 15 Real-World Scenarios | Interview-Ready | 2026

---

## Project Context

**Student:** Professional Learner on Syllabrix Platform  
**BTP Tenant:** Trial — account.hanatrial.ondemand.com  
**Integration Suite Components Activated:**  
- Cloud Integration (CPI)  
- API Management  
- Open Connectors  
- Integration Advisor  
- Trading Partner Management  

**Business Story:**  
Syllabrix is an EdTech SaaS platform (REST API on Railway). You are building a suite of integrations between Syllabrix and the SAP ecosystem — connecting learning progress, career data, HR systems, and notification engines. Each scenario is a standalone iFlow that solves a real business problem and covers a distinct Integration Suite concept.

**Syllabrix Base URL:** `https://syllabrix-api.up.railway.app`  
**Auth:** Bearer JWT (POST `/api/auth/login` → get token)

---

## Scenario Index

| # | Scenario | Key Concept | Difficulty |
|---|----------|-------------|------------|
| 01 | Learning Progress Sync → Email | HTTP Adapter + Mail Sender | ★☆☆ |
| 02 | Syllabrix User → SAP SuccessFactors | REST-to-REST Mapping | ★☆☆ |
| 03 | Content-Based Routing by User Type | Router Step | ★☆☆ |
| 04 | SOAP RFC → Syllabrix REST | Protocol Conversion | ★★☆ |
| 05 | Bulk Enrollment via SFTP CSV | SFTP Adapter + Splitter | ★★☆ |
| 06 | Daily Learning Digest (Aggregator) | Aggregator + Timer | ★★☆ |
| 07 | Syllabrix API Polling → SAP Data Store | Polling + Persistence | ★★☆ |
| 08 | Error Handling + Dead Letter Queue | Exception Subprocess | ★★☆ |
| 09 | Idempotent Message Processing | Idempotent Receiver | ★★★ |
| 10 | Batch Enrollment Splitter + Parallel | Splitter + Multicast | ★★★ |
| 11 | JWT Security + OAuth 2.0 Flow | Security Artifacts | ★★★ |
| 12 | Expose Syllabrix via API Management | API Proxy + Rate Limit | ★★★ |
| 13 | Event-Driven via SAP Event Mesh | Event Mesh Adapter | ★★★ |
| 14 | B2B EDI Message Exchange | Trading Partner Mgmt | ★★★ |
| 15 | Integration Advisor Runtime Artifact | IA + MIG/MAG | ★★★ |

---

---

# TIER 1 — Foundation Patterns

---

## Scenario 01: Learning Progress Sync → Email Notification

### Business Problem
When a Syllabrix user completes a learning path day, the HR manager should receive an email digest with the progress update.

### Architecture
```
Timer (every 2 hrs)
  → HTTP Call: GET /api/career/learning (Syllabrix)
  → Message Mapping: Extract completed paths
  → Filter: Only status = "in_progress" OR pct > 0
  → Mail Sender: SMTP → HR Manager
```

### iFlow Steps
1. **Timer Start Event** — Schedule: Every 2 hours
2. **Request-Reply** — HTTP Receiver Adapter
   - URL: `https://syllabrix-api.up.railway.app/api/career/learning`
   - Method: GET
   - Header: `Authorization: Bearer {{jwt_token}}`
3. **Message Mapping (XSLT or Groovy)**
   ```groovy
   // Groovy script to build email body
   import com.sap.gateway.ip.core.customdev.util.Message
   def Message processData(Message message) {
     def body = message.getBody(String.class)
     def json = new groovy.json.JsonSlurper().parseText(body)
     def paths = json.data?.findAll { it.status == 'in_progress' }
     def html = "<h2>Learning Progress Report</h2><ul>"
     paths?.each { p -> html += "<li>${p.skill_name} — ${p.total_days} days</li>" }
     html += "</ul>"
     message.setBody(html)
     return message
   }
   ```
4. **Mail Sender** — SMTP Adapter
   - To: `hr@company.com`
   - Subject: `Syllabrix Learning Progress — ${date}`
   - Content Type: `text/html`

### Security Artifact
- Create **User Credentials** in Security Material:
  - Name: `SyllabrixJWT`
  - Type: User Credentials
  - Value: JWT token from Syllabrix login

### Interview Questions for This Scenario
- What is a Timer Start Event vs Message Start Event?
- How do you handle SMTP configuration in Cloud Integration?
- What is the difference between Groovy script and Message Mapping?
- How do you store sensitive credentials in CPI?

---

## Scenario 02: Syllabrix Career Profile → SAP SuccessFactors

### Business Problem
When a professional learner completes career onboarding on Syllabrix, sync their profile to SAP SuccessFactors as a candidate record.

### Architecture
```
HTTP Trigger (Webhook-style polling)
  → GET /api/career/profile (Syllabrix)
  → Message Mapping: Syllabrix → SF OData entity
  → POST /sap/opu/odata/sap/HCM_Staffing (SuccessFactors OData)
```

### Source JSON (Syllabrix)
```json
{
  "current_role": "SAP BTP Consultant",
  "experience_years": 3,
  "industry": "Technology",
  "career_goal": "Senior Architect",
  "salary_expectation": "₹15-20 LPA"
}
```

### Target Structure (SuccessFactors Candidate)
```json
{
  "currentTitle": "SAP BTP Consultant",
  "yearsOfExperience": 3,
  "industry": "Technology",
  "targetRole": "Senior Architect"
}
```

### Mapping Table
| Source Field | Target Field | Transformation |
|---|---|---|
| `current_role` | `currentTitle` | Direct |
| `experience_years` | `yearsOfExperience` | Integer cast |
| `industry` | `industry` | Direct |
| `career_goal` | `targetRole` | Direct |
| `salary_expectation` | `salaryExpectation` | Strip `₹`, parse range |

### Message Mapping (Graphical)
- Source: `application/json`
- Target: `application/json` (or OData XML)
- Use **Mapping Expression** for salary: `substring-before(source, ' LPA')`

### Interview Questions
- What is OData and how is it different from REST?
- How does SAP CPI connect to SuccessFactors — what authentication is used?
- What is the difference between graphical mapping and XSLT mapping?
- How do you handle field-level transformations in message mapping?

---

## Scenario 03: Content-Based Routing by User Type

### Business Problem
Syllabrix has multiple user types (student, professional_learner, teacher). When a new user registers, route to the correct downstream system:
- `student` → Google Classroom API
- `professional_learner` → SAP SuccessFactors
- `teacher` → SAP LMS

### Architecture
```
HTTP Start (POST from Syllabrix webhook)
  → Content Modifier: Read user_type from payload
  → Router:
      [user_type = 'student']        → Google Classroom Adapter
      [user_type = 'professional_learner'] → SuccessFactors Adapter
      [user_type = 'teacher']        → SAP LMS Adapter
      [Default]                      → Slack Alert
```

### Router Step Configuration
| Route | Condition Expression | Type |
|---|---|---|
| Student | `${xpath(//user_type/text())} = 'student'` | XPath |
| Professional | `${property.userType} = 'professional_learner'` | Property |
| Teacher | `${header.userType} = 'teacher'` | Header |

### Content Modifier (Set Property)
```
Property Name: userType
Value Type: XPath
Value: //user_type/text()
Data Type: java.lang.String
```

### Interview Questions
- What are the routing condition types available in CPI Router step?
- Difference between XPath, header-based, and property-based routing?
- What happens when no route matches — how does the Default route work?
- How do you pass context between steps using Exchange Properties vs Headers?

---

## Scenario 04: SOAP RFC → Syllabrix REST (Protocol Conversion)

### Business Problem
An SAP ECC system calls an RFC to notify Syllabrix when an employee completes a training module in the HR system. RFC is SOAP-based; Syllabrix is REST.

### Architecture
```
SOAP Receiver Adapter (Expose as SOAP endpoint)
  → XSLT Mapping: SOAP XML → JSON
  → HTTP Request: POST /api/career/learning (Syllabrix)
  → Response Mapping: JSON → SOAP Response
```

### Incoming SOAP Envelope
```xml
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">
  <soapenv:Body>
    <TrainingComplete>
      <EmployeeId>E001</EmployeeId>
      <SkillName>SAP BTP Integration Suite</SkillName>
      <CompletionDate>2026-04-12</CompletionDate>
      <Score>87</Score>
    </TrainingComplete>
  </soapenv:Body>
</soapenv:Envelope>
```

### XSLT Transformation → JSON
```xsl
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="text" media-type="application/json"/>
  <xsl:template match="/">
    {
      "skill_name": "<xsl:value-of select="//SkillName"/>",
      "total_days": 30,
      "difficulty": "intermediate"
    }
  </xsl:template>
</xsl:stylesheet>
```

### Content Modifier — Set Header
```
Header: Content-Type = application/json
Header: Authorization = Bearer {{SyllabrixJWT}}
```

### Interview Questions
- How do you expose an iFlow as a SOAP endpoint?
- What is XSLT and when would you use it over Graphical Mapping?
- How does protocol conversion work in Cloud Integration?
- What is WSDL and how is it used in SOAP adapter configuration?

---

## Scenario 05: Bulk Enrollment via SFTP → Syllabrix API

### Business Problem
HR uploads a CSV file with 500 employee records to an SFTP server. CPI should process each row and enroll them into Syllabrix learning paths one by one.

### Architecture
```
SFTP Polling (every 15 min)
  → Read CSV File
  → CSV-to-XML Converter
  → Splitter (Split per employee record)
  → Loop: For each employee:
      → HTTP POST: /api/auth/register (Syllabrix)
      → HTTP POST: /api/career/learning/generate
  → Gather results
  → Write completion report to SFTP
```

### CSV Format (SFTP input)
```csv
employee_id,name,email,skill_target,days
E001,Krish Kumar,krish@company.com,SAP BTP Integration Suite,30
E002,Priya Singh,priya@company.com,React Development,21
E003,Rahul Sharma,rahul@company.com,Data Science,14
```

### Splitter Configuration
- Type: General Splitter
- Expression Type: XPath
- XPath Expression: `//employees/employee`
- Batch Size: 1 (process one at a time)
- Stop on Exception: Yes

### SFTP Adapter Configuration
- Host: `sftp.yourserver.com`
- Directory: `/inbound/syllabrix/`
- File Name: `enrollments_*.csv`
- Post-Processing: Move to `/processed/`
- Poll Interval: 15 minutes

### Interview Questions
- What is the difference between General Splitter, Iterating Splitter, and IDoc Splitter?
- How do you configure SFTP polling with file archiving?
- How do you handle partial failures in a Splitter flow?
- What is the difference between parallel and sequential processing in a Splitter?

---

---

# TIER 2 — Intermediate Patterns

---

## Scenario 06: Daily Learning Digest (Aggregator Pattern)

### Business Problem
Collect all learning completion events fired throughout the day and send a single consolidated digest email to the manager at 6PM.

### Architecture
```
HTTP Start (receive completion events all day)
  → Store in temporary buffer (Data Store)

Timer (6PM daily)
  → Read all buffered events from Data Store
  → Aggregator: Merge into single message
  → Message Mapping: Build HTML digest
  → Mail Sender
```

### Aggregator Configuration
| Property | Value |
|---|---|
| Correlation Expression | `${property.userId}` |
| Aggregation Algorithm | Combine (Collect all) |
| Completion Condition | `${property.count} >= 10 OR ${property.timeout}` |
| Message Aggregation Algorithm | Concatenate |
| Last Message Wins | No |

### Data Store Operations
```
Write:
  - Data Store Name: LearningEvents
  - Entry ID: ${property.correlationId}
  - Retention: 24 hours

Read:
  - Data Store Name: LearningEvents
  - Delete on Completion: Yes
```

### Interview Questions
- What is the Aggregator step and what problem does it solve?
- Explain Correlation ID and why it matters in aggregation
- What is the WireTap pattern — how does it differ from Aggregator?
- What happens to messages that don't meet the completion condition?

---

## Scenario 07: Syllabrix API Polling → SAP Data Store (Persistence)

### Business Problem
Every hour, poll Syllabrix for new job matches and persist them to SAP HANA via a Data Store for reporting in SAP Analytics Cloud.

### Architecture
```
Timer (every 1 hour)
  → HTTP GET: /api/career/jobs (Syllabrix)
  → Filter: Only jobs created in last 1 hour
  → For Each Job:
      → Write to SAP Data Store (CPI persistence layer)
      → Optional: JDBC Adapter → SAP HANA
```

### Groovy: Filter Recent Jobs
```groovy
import com.sap.gateway.ip.core.customdev.util.Message
import groovy.json.JsonSlurper
import groovy.json.JsonOutput

def Message processData(Message message) {
  def body = message.getBody(String.class)
  def json = new JsonSlurper().parseText(body)
  def cutoff = new Date(System.currentTimeMillis() - 3600000) // 1 hour ago
  
  def recentJobs = json.data?.jobs?.findAll { job ->
    def createdAt = Date.parse("yyyy-MM-dd'T'HH:mm:ss", job.created_at)
    createdAt.after(cutoff)
  }
  
  message.setBody(JsonOutput.toJson([jobs: recentJobs]))
  message.setProperty("jobCount", recentJobs?.size() ?: 0)
  return message
}
```

### Data Store Write Configuration
```
Data Store Name: SyllabrixJobs
Visibility: Global
Entry ID: ${xpath(//job/id/text())}
Retention Period: 7 days
Encrypt at Rest: Yes
```

### Interview Questions
- What is the SAP CPI Data Store and what is it used for?
- Difference between Global and Local Data Store visibility?
- How does JDBC adapter connect to external databases?
- What are the retention limits for CPI Data Store?

---

## Scenario 08: Error Handling + Dead Letter Queue

### Business Problem
When syncing skill analysis results to SuccessFactors fails, the message should retry 3 times, then land in a Dead Letter Queue (Data Store) for manual reprocessing.

### Architecture
```
HTTP Trigger (Syllabrix skill analyzed event)
  → Try:
      → HTTP POST → SuccessFactors
  → Exception Subprocess:
      → Retry Counter (max 3)
      → If retry < 3: Wait 30s + Retry
      → If retry = 3: Write to DLQ Data Store + Alert Email
```

### Exception Subprocess Steps
1. **Exception Subprocess** — catches all exceptions
2. **Groovy Script** — check retry count
   ```groovy
   def retryCount = message.getProperty("CamelRedeliveryCounter") as Integer ?: 0
   message.setProperty("retryCount", retryCount)
   if (retryCount >= 3) {
     message.setProperty("sendToDLQ", "true")
   }
   ```
3. **Router** — branch on `sendToDLQ`
   - True → Data Store Write (DLQ) + Mail Alert
   - False → Wait 30s → End (triggers re-delivery)

### DLQ Data Store Configuration
```
Name: SkillSyncDLQ
Entry ID: ${header.MessageId}_${date:now:yyyyMMddHHmmss}
Retention: 30 days
```

### Interview Questions
- How does the Exception Subprocess differ from a Try-Catch in code?
- What is the Dead Letter Channel pattern?
- How do you implement retry with exponential backoff in CPI?
- What is `CamelRedeliveryCounter` and where does it come from?
- How do you monitor failed messages in CPI Operations cockpit?

---

## Scenario 09: Idempotent Message Processing

### Business Problem
Syllabrix sends skill analysis completion webhooks. Due to network issues, the same event may arrive multiple times. Process each event exactly once.

### Architecture
```
HTTP Start (receive webhook)
  → Extract Message ID from payload
  → Idempotent Process Call:
      Check: Has this MessageId been processed before?
      YES → Discard silently
      NO  → Process + Mark as processed
```

### Idempotent Receiver Configuration
```
Message ID Expression: ${xpath(//event_id/text())}
Skip Duplicate: Yes
Data Store Name: ProcessedEvents
```

### Groovy: Extract Event ID and Set Header
```groovy
import com.sap.gateway.ip.core.customdev.util.Message
import groovy.json.JsonSlurper

def Message processData(Message message) {
  def body = message.getBody(String.class)
  def json = new JsonSlurper().parseText(body)
  def eventId = json.event_id ?: UUID.randomUUID().toString()
  message.setHeader("MessageId", eventId)
  message.setHeader("SapMessageIdEx", eventId) // CPI standard idempotency header
  return message
}
```

### Interview Questions
- What is idempotency and why is it critical in enterprise integration?
- How does CPI implement idempotent processing natively?
- What is the `SapMessageIdEx` header?
- What is "Exactly Once" vs "At Least Once" delivery?
- How do you test for duplicate message handling?

---

## Scenario 10: Batch Splitter + Parallel Multicast

### Business Problem
Process a batch of 100 Syllabrix users simultaneously — send each user's profile to both SuccessFactors AND a Slack notification channel in parallel.

### Architecture
```
SFTP (CSV with 100 users)
  → CSV-to-XML Converter
  → General Splitter (1 user per message)
  → Parallel Multicast:
      Branch 1 → POST → SuccessFactors
      Branch 2 → POST → Slack Webhook
  → Gather responses
  → Write audit log
```

### Parallel Multicast vs Sequential Multicast
| Feature | Parallel | Sequential |
|---|---|---|
| Execution | Simultaneous | One by one |
| Performance | Faster | Predictable |
| Error Handling | Complex | Simpler |
| Use When | Independent targets | Dependent targets |

### Slack Webhook Adapter (using HTTP Receiver)
```
URL: https://hooks.slack.com/services/YOUR/WEBHOOK/URL
Method: POST
Body (Groovy):
{
  "text": "New Syllabrix user synced: ${header.employeeName}",
  "channel": "#hr-integrations"
}
```

### Interview Questions
- What is the difference between Multicast and Router?
- When would you use Parallel Multicast vs Sequential?
- How do you collect results from all Multicast branches?
- What happens in Multicast if one branch fails?

---

---

# TIER 3 — Advanced Enterprise Patterns

---

## Scenario 11: OAuth 2.0 + JWT Security Hardening

### Business Problem
Secure all Syllabrix API calls from CPI using OAuth 2.0 Client Credentials flow, and expose the integration endpoint with mutual TLS.

### Architecture
```
OAuth 2.0 Token Endpoint (Syllabrix /api/auth/login)
  → Store Token in Security Material
  → Refresh before expiry (token lifecycle management)
  → Use Bearer token in all downstream HTTP calls
  
Inbound Security:
  → Client Certificate Authentication (mTLS)
  → Role-based access: IntegrationDeveloper role
```

### OAuth 2.0 Security Artifact
```
Type: OAuth2 Client Credentials
Name: SyllabrixOAuth
Token Service URL: https://syllabrix-api.up.railway.app/api/auth/login
Client ID: (username)
Client Secret: (password)
Scope: (leave blank)
```

### Groovy: Manual JWT Refresh
```groovy
import groovy.json.JsonSlurper
import org.apache.http.client.methods.HttpPost
import org.apache.http.impl.client.CloseableHttpClient
import org.apache.http.impl.client.HttpClients

def Message processData(Message message) {
  def client = HttpClients.createDefault()
  def post = new HttpPost("https://syllabrix-api.up.railway.app/api/auth/login")
  post.setHeader("Content-Type", "application/json")
  post.setEntity(new org.apache.http.entity.StringEntity(
    '{"email":"bot@syllabrix.in","password":"yourpassword"}'
  ))
  def response = client.execute(post)
  def json = new JsonSlurper().parse(response.getEntity().getContent())
  def token = json.data?.token
  message.setProperty("SyllabrixToken", token)
  message.setHeader("Authorization", "Bearer ${token}")
  client.close()
  return message
}
```

### Interview Questions
- Explain OAuth 2.0 Client Credentials flow vs Authorization Code flow
- What is the difference between User Credentials and OAuth2 in CPI Security Material?
- What is mutual TLS (mTLS) and how is it configured in CPI?
- How do you rotate secrets without downtime in CPI?
- What is the KeyStore Manager in CPI and when do you use it?

---

## Scenario 12: Expose Syllabrix via API Management

### Business Problem
Enterprise partners need controlled access to Syllabrix's job matching API. Expose it via SAP API Management with rate limiting, API key authentication, and analytics.

### Architecture
```
External Partner
  → API Management Proxy (SAP API Portal)
      → Rate Limit Policy: 100 req/min
      → API Key Verification Policy
      → Spike Arrest: 10 req/sec
      → Request Transformation (add auth header)
  → Syllabrix Backend: /api/career/jobs
      → Response Caching: 5 minutes
```

### API Proxy Configuration
```yaml
basePath: /v1/syllabrix
targetEndpoint: https://syllabrix-api.up.railway.app
virtualHost: prod

policies:
  preFlow:
    - VerifyAPIKey:
        key.source: request.header.x-api-key
    - SpikeArrest:
        rate: 10ps
        useEffectiveCount: true
    - Quota:
        allow: 100
        interval: 1
        timeUnit: minute
        identifier: request.header.x-api-key

  targetEndpoint:
    preFlow:
      - AssignMessage:
          Add:
            Headers:
              - Authorization: Bearer {{syllabrix_jwt}}
              - Content-Type: application/json
          Remove:
            Headers:
              - x-api-key

  postFlow:
    - ResponseCache:
        timeoutInSeconds: 300
        skipCacheLookup: request.header.x-bypass-cache = "true"
```

### Developer Portal Setup
1. Create API Product → assign API Proxy
2. Create App → generate API Key
3. Publish to Developer Portal
4. Set up custom domain (optional)

### Interview Questions
- What is the difference between API Proxy and API Provider in API Management?
- Explain Spike Arrest vs Quota policy — when to use each?
- What is the API Product concept in SAP API Management?
- How does the Developer Portal work for partner onboarding?
- How do you version APIs in SAP API Management?

---

## Scenario 13: Event-Driven Integration via SAP Event Mesh

### Business Problem
When Syllabrix completes a skill analysis (async event), publish the result to SAP Event Mesh. Multiple consumers (HR system, Notification service, Analytics) subscribe independently.

### Architecture
```
Syllabrix Skill Analysis Complete
  → iFlow A (Publisher):
      HTTP Start Event
      → Message Mapping
      → Event Mesh Publisher Adapter
          Topic: syllabrix/skills/analyzed/v1
          QoS: At Least Once

Event Mesh
  ↓ [Topic: syllabrix/skills/analyzed/v1]
  
iFlow B (Consumer — HR):    Subscribe → Update SuccessFactors
iFlow C (Consumer — Notify): Subscribe → Send Slack/Email
iFlow D (Consumer — Analytics): Subscribe → Write to HANA
```

### Event Mesh Adapter Configuration (Publisher)
```
Service Instance: your-event-mesh-instance
Destination: SyllabrixEventMesh
Topic: syllabrix/skills/analyzed/v1
Quality of Service: At Least Once (1)
Message Retention: 24 hours
```

### Event Mesh Adapter Configuration (Consumer)
```
Service Instance: your-event-mesh-instance
Subscription Name: hr-skill-sync
Topic Subscription: syllabrix/skills/analyzed/v1
Max. Unacknowledged Messages: 10
Reconnect Attempts: 5
```

### Event Schema (CloudEvents format)
```json
{
  "specversion": "1.0",
  "type": "com.syllabrix.skills.analyzed",
  "source": "https://syllabrix-api.up.railway.app",
  "id": "evt-12345",
  "time": "2026-04-12T10:30:00Z",
  "data": {
    "user_id": 42,
    "market_fit_score": 78,
    "skill_gaps": ["SAP Integration Suite", "React"],
    "industry": "Technology"
  }
}
```

### Interview Questions
- What is the publish-subscribe pattern and why use Event Mesh over direct HTTP?
- What is Quality of Service (QoS) — difference between 0, 1, and 2?
- What is Topic vs Queue in Event Mesh?
- How does Event Mesh ensure message delivery if a consumer is down?
- What is the CloudEvents specification?

---

## Scenario 14: B2B / EDI Message Exchange (Trading Partner Management)

### Business Problem
Syllabrix partners with a training content provider (ACME Corp) that sends course completion certificates in EDIFACT format. CPI must receive, validate, transform, and post to Syllabrix.

### Architecture
```
ACME Corp (SFTP/AS2)
  → EDI Splitter: Parse EDIFACT EDCERT message
  → EDI-to-XML Converter
  → Message Mapping: EDIFACT → Syllabrix JSON
  → HTTP POST → Syllabrix /api/career/certifications
  → Functional ACK (CONTRL) → back to ACME
```

### Trading Partner Setup (TPM)
```
My Company:
  Name: Syllabrix Pvt Ltd
  ID Type: GLN
  ID: 8712345678900

Partner: ACME Training Corp
  ID Type: GLN  
  ID: 8700000000001
  Communication: AS2 or SFTP

Agreement:
  Direction: Inbound
  Message Type: EDIFACT ORDERS D.96A
  Validation: Yes (syntax + schema)
```

### EDIFACT Sample (simplified)
```
UNB+UNOA:1+8700000000001:14+8712345678900:14+260412:1030+1'
UNH+1+EDCERT:D:96A:UN'
BGM+380+CERT-2026-001+9'
DTM+137:20260412:102'
NAD+BY+ACME:92++ACME Training Corp'
LIN+1++SAP-BTP-IS:SA'
QTY+1:1:PCE'
UNT+7+1'
UNZ+1+1'
```

### Interview Questions
- What is EDI and what are the common EDI standards (EDIFACT, X12, ANSI)?
- What is AS2 protocol and how does it ensure non-repudiation?
- What is a Functional Acknowledgement (FA/CONTRL)?
- How does Trading Partner Management differ from manual iFlow development?
- What is an Agreement in TPM and what does it define?

---

## Scenario 15: Integration Advisor — Runtime Artifact Generation

### Business Problem
Create a standards-compliant mapping between the UN/EDIFACT ORDERS message and a custom Syllabrix course enrollment JSON, using Integration Advisor's AI-assisted mapping recommendation.

### Architecture
```
Integration Advisor (Separate Tool — IA)
  1. Create Message Implementation Guideline (MIG)
     Source: UN/EDIFACT ORDERS D.96A
     Target: Syllabrix Custom JSON
  
  2. Create Mapping Guideline (MAG)
     Source MIG → Target MIG
     Use AI recommendations
  
  3. Activate → Export Runtime Artifact
  
  4. Import into Cloud Integration iFlow
     → Use as Message Mapping artifact
```

### Step 1: Create MIG (Message Implementation Guideline)
```
Type Library: UN/EDIFACT
Message Type: ORDERS
Version: D.96A
Agency: UN

Select only needed segments:
✓ UNB — Interchange Header
✓ BGM — Beginning of Message  
✓ DTM — Date/Time
✓ NAD — Name and Address
✓ LIN — Line Item
✗ (deactivate unused segments)
```

### Step 2: Create MAG (Mapping Guideline)
```
Source MIG: ORDERS D.96A (yours)
Target MIG: Syllabrix Enrollment JSON

AI Recommendation: Enable
→ System suggests mappings based on semantic similarity
→ Review each suggestion: Accept / Reject / Modify

Sample mappings:
BGM/1004 (Document Number) → enrollment_id
NAD/3035=BY/3039 (Buyer ID) → company_id
LIN/7140 (Item ID) → course_code
DTM/2380 (Date) → enrollment_date
```

### Step 3: Activate and Export
```
Activate MAG → Status: Active
Export: Runtime Artifact (.mmap or .xslt)
→ Download to local machine
→ Import in Cloud Integration:
   Resources → Add → Message Mapping → Upload
```

### Step 4: Use in iFlow
```
Message Mapping Step:
  → Select imported runtime artifact
  → Map source message (parsed EDIFACT XML)
  → Output: Syllabrix JSON payload
```

### Interview Questions
- What is Integration Advisor and how is it different from Cloud Integration mapping?
- What is a MIG (Message Implementation Guideline)?
- What is a MAG (Mapping Guideline)?
- How does AI-assisted mapping recommendation work in IA?
- What runtime artifact formats does Integration Advisor export?
- When would you use Integration Advisor over manual mapping?

---

---

# Interview Master Cheat Sheet

## Core Concepts

| Concept | One-Line Definition | Where Used |
|---|---|---|
| iFlow | Visual integration flow in Cloud Integration | All scenarios |
| Adapter | Connector to external system (HTTP, SFTP, SOAP, JDBC) | All scenarios |
| Content Modifier | Set/read headers, properties, body | All scenarios |
| Groovy Script | Custom Java/Groovy logic in iFlow | 01, 07, 08, 11 |
| Message Mapping | Graphical field-to-field mapping | 02, 04, 15 |
| XSLT | XML-to-XML/JSON transformation via stylesheet | 04 |
| Router | Conditional branching | 03, 08 |
| Splitter | Split one message into many | 05, 10 |
| Aggregator | Merge many messages into one | 06 |
| Data Store | CPI persistence layer | 07, 08, 09 |
| Idempotent Receiver | Deduplicate messages | 09 |
| Multicast | Send one message to multiple channels | 10 |
| Event Mesh | SAP's pub/sub message broker | 13 |
| API Proxy | API Management facade over backend | 12 |
| TPM | Trading Partner Management for B2B/EDI | 14 |
| Integration Advisor | Standards-based mapping tool with AI | 15 |

## Common Interview Topics

### Architecture Questions
- "Design an integration between HR system and LMS" → use Scenarios 02 + 05
- "How do you handle high volume message bursts?" → Scenario 12 (Spike Arrest) + 10 (Parallel)
- "How do you ensure exactly-once processing?" → Scenario 09 (Idempotency)
- "How would you handle a target system being down?" → Scenario 08 (DLQ + Retry)

### Technical Deep-Dives
- Exchange Properties vs Headers vs Body → Properties: internal flow context, Headers: external metadata, Body: payload
- Groovy vs XSLT vs Message Mapping → Groovy: logic-heavy, XSLT: XML-to-XML, Mapping: graphical field mapping
- Synchronous vs Asynchronous iFlow → Sync: request-reply, HTTP; Async: Event Mesh, Timer, SFTP
- At Least Once vs Exactly Once → QoS levels, idempotent receiver for Exactly Once

## Monitoring & Operations

| Tool | Purpose |
|---|---|
| Message Monitor | Track message status, payload inspection |
| Operations Cockpit | iFlow deployment, adapter status |
| Trace | Step-by-step debug (enable on iFlow) |
| Data Store Monitor | View persisted messages |
| Security Material | Manage credentials, certificates |
| Log Level | Error/Info/Debug/Trace |

---

# Project Execution Plan

## Week 1 — Scenarios 01–05 (Foundation)
- Day 1-2: Deploy Scenario 01 (Timer + HTTP + Mail)
- Day 3-4: Deploy Scenario 02 (REST mapping)
- Day 5: Deploy Scenario 03 (Content-based routing)
- Day 6: Deploy Scenario 04 (SOAP-REST conversion)
- Day 7: Deploy Scenario 05 (SFTP + Splitter)

## Week 2 — Scenarios 06–10 (Intermediate)
- Day 8-9: Aggregator + Data Store (06, 07)
- Day 10-11: Error handling + Idempotency (08, 09)
- Day 12-13: Multicast (10)
- Day 14: Review + document all iFlows

## Week 3 — Scenarios 11–15 (Advanced)
- Day 15-16: OAuth + mTLS (11)
- Day 17-18: API Management (12)
- Day 19-20: Event Mesh (13)
- Day 21: TPM + EDI (14)
- Day 22: Integration Advisor (15)
- Day 23-24: Mock interview + review all 15

## Deliverables per Scenario
- [ ] iFlow deployed and tested in BTP Trial
- [ ] Screenshot of successful message trace
- [ ] One-page explanation of the business problem solved
- [ ] 5 interview Q&A prepared

---

*Generated for Syllabrix Professional Learner | BTP Integration Suite Mastery Project | 2026*
