# Scenario 05 — Bulk Enrollment via SFTP CSV + Splitter
## Week 1 | Day 7 | Difficulty: ★★☆

---

## What You Will Build

An iFlow that polls an SFTP server every 5 minutes, picks up a CSV file of employee enrollments, converts it to XML, splits it into individual records, and creates a Syllabrix learning path for each person.

```
[SFTP Poll: every 5 min] → /inbound/syllabrix/*.csv
    ↓
[CSV-to-XML Converter]
    ↓
[General Splitter] → 1 message per employee row
    ↓ (loop for each)
[Content Modifier] → Build JSON body + set JWT header
    ↓
[HTTP POST] → Syllabrix /api/career/learning/generate
    ↓
[Data Store Write] → Log result per employee
```

**Skills learned:** SFTP Adapter, CSV-to-XML Converter, Splitter, Looping pattern, Data Store Write, parallel vs sequential processing

---

## Pre-Requisites

### 1. Get a Free SFTP Server

**Option A — Use sftpcloud.io (free trial):**
1. Go to **sftpcloud.io** → Sign up free
2. Create SFTP user: `syllabrix_user` / password: `your_password`
3. SFTP Host: given in dashboard (e.g. `sftp.sftpcloud.io`)
4. Port: `22`
5. Create directories: `/inbound/syllabrix/` and `/processed/syllabrix/`

**Option B — Use mocky + simulate (no SFTP):**
Skip SFTP, use HTTP trigger instead (see note at end of this guide).

**Option C — filezilla local server (Windows):**
1. Download FileZilla Server
2. Set up local SFTP on `localhost:22`
3. Only works if your CPI can reach your machine (needs public IP/ngrok tunnel)

> **Recommendation for BTP Trial: Use sftpcloud.io** — it's purpose-built for this.

### 2. Create a Security Material for SFTP

Before building the iFlow:
1. CPI → Monitor → **Manage Security** → **Security Material**
2. **Add** → **User Credentials**:
   ```
   Name:     SFTPCloud
   User:     syllabrix_user
   Password: your_sftp_password
   ```
3. Click **Deploy**

### 3. Upload a Test CSV File to SFTP

Using **FileZilla** (free FTP client):
1. Connect to your SFTP server
2. Navigate to `/inbound/syllabrix/`
3. Create a file `enrollments_20260412.csv` with content:

```csv
employee_id,full_name,email,skill_name,total_days,difficulty
E001,Krish Kumar,krish@company.com,SAP BTP Integration Suite,30,intermediate
E002,Priya Singh,priya@company.com,React Development,21,beginner
E003,Rahul Sharma,rahul@company.com,Data Science Fundamentals,14,beginner
E004,Anjali Patel,anjali@company.com,Cloud Architecture AWS,21,intermediate
E005,Suresh Reddy,suresh@company.com,SAP ABAP Development,30,advanced
```

---

## Step-by-Step: Create the iFlow

### STEP 1 — New iFlow

Package → **Add** → **Integration Flow**  
Name: `S05 - Bulk Enrollment via SFTP CSV Splitter`

---

### STEP 2 — SFTP Sender Adapter (Polling)

1. Start event → Delete → Replace with **Message Start Event** (keep default)
2. Add Sender → Adapter Type: **SFTP**

**SFTP Adapter — Source tab:**
```
Directory:      /inbound/syllabrix
File Name:      *.csv
Address:        sftp.sftpcloud.io
Port:           22
Proxy Type:     None
Authentication: User Name/Password
Credential Name: SFTPCloud    ← the Security Material we created
```

**SFTP Adapter — Processing tab:**
```
Read Lock Strategy:     Done File Expected
Move File:             Yes
Archive Directory:     /processed/syllabrix
Completed File Suffix: .done
Poll Interval:         5 (Minutes)
Max Messages Per Poll: 1
```

> **Read Lock Strategy: Done File Expected** — SFTP will only pick up a file when there is a corresponding `.done` file (e.g. `enrollments.csv.done`). This prevents picking up partially uploaded files. For testing, switch to **Rename** strategy.

---

### STEP 3 — CSV to XML Converter

1. Drag **Converter** step (under Message Transformers → **CSV to XML Converter**)
2. Connect Start → CSV to XML Converter

**CSV to XML Converter — Processing tab:**
```
Field Separator:         Comma (,)
Record Marker Name:      employee
Record Namespace:        http://syllabrix.com/enrollment
Field Name From Header:  Yes   ← reads first row as column names
Include Field Name:      Yes
```

> **Output XML structure:**
> ```xml
> <root>
>   <employee>
>     <employee_id>E001</employee_id>
>     <full_name>Krish Kumar</full_name>
>     <email>krish@company.com</email>
>     <skill_name>SAP BTP Integration Suite</skill_name>
>     <total_days>30</total_days>
>     <difficulty>intermediate</difficulty>
>   </employee>
>   <employee>...</employee>
> </root>
> ```

---

### STEP 4 — General Splitter

1. From palette → **Routing** → **Splitter** → **General Splitter**
2. Connect CSV Converter → Splitter

**Splitter — Processing tab:**
```
Expression Type:    XPath
XPath Expression:   //employee
Grouping:           1          ← 1 record per message
Grouping Based On:  Number of Messages
Streaming:          No
Stop on Exception:  Yes
Parallel Processing: No        ← sequential (safe for Syllabrix API rate limits)
```

> **Stop on Exception: Yes** — if one employee enrollment fails, stop the batch. 
> Set to `No` if you want to process all records regardless of individual failures.

---

### STEP 5 — Content Modifier: Build JSON Body

After the Splitter, each message contains ONE `<employee>` element.

1. Add **Content Modifier** → connect Splitter → Content Modifier

**Message Header tab:**
```
Name: Authorization    Value: Bearer YOUR_JWT_TOKEN
Name: Content-Type     Value: application/json
```

**Exchange Property tab:**
```
Name: employeeId    Type: XPath    Value: //employee_id/text()
Name: empEmail      Type: XPath    Value: //email/text()
Name: skillName     Type: XPath    Value: //skill_name/text()
```

**Message Body tab:**
```
Type: Expression

Body:
{
  "skill_name": "${xpath(//skill_name/text())}",
  "total_days": ${xpath(//total_days/text())},
  "difficulty": "${xpath(//difficulty/text())}"
}
```

> **XPath in Body expressions**: Use `${xpath(...)}` to pull values from the current XML message body.

---

### STEP 6 — HTTP POST to Syllabrix

1. **Request Reply** → connect Content Modifier → Request Reply
2. Receiver → HTTP Adapter:
   ```
   URL:    https://syllabrix-api.up.railway.app/api/career/learning/generate
   Method: POST
   ```

---

### STEP 7 — Write Result to Data Store (Audit Log)

1. Add **Data Store Write** step (under Persistence)
2. Connect Request Reply → Data Store Write

**Data Store Operations — Write:**
```
Data Store Name:    EnrollmentAuditLog
Visibility:         Global
Entry ID:           ${exchangeProperty.employeeId}_${date:now:yyyyMMddHHmmss}
Retention Period:   30 (days)
Encrypt at Rest:    No
Overwrite Existing: No
```

---

### STEP 8 — End Message

1. Connect Data Store Write → **End Message** event
2. Click **Save** → **Deploy**

---

### STEP 9 — Test It

#### Upload CSV + Trigger File
1. Using FileZilla → connect to your SFTP server
2. Upload `enrollments_20260412.csv` to `/inbound/syllabrix/`
3. If using "Done File" strategy: also upload `enrollments_20260412.csv.done`

#### Monitor in CPI
1. Monitor → **Message Monitor**
2. Watch for messages to appear (may take up to 5 minutes for the poll)
3. You should see 5 messages (one per CSV row) — all green/completed

#### Verify in Syllabrix
1. Login to Syllabrix → `/career/learning`
2. You should see new learning paths generated
3. (Note: Syllabrix generates paths for the logged-in user's JWT — for bulk user creation you'd need a separate signup flow first)

#### Check Data Store
1. Monitor → **Manage Stores** → **Data Stores** → `EnrollmentAuditLog`
2. You should see 5 entries with the employee IDs

---

### Deep Dive: Splitter Types in CPI

| Splitter Type | Use Case | Split Expression |
|---|---|---|
| **General Splitter** | Split any XML by XPath | XPath expression |
| **Iterating Splitter** | Split by fixed line count | Number of lines |
| **IDoc Splitter** | Split IDoc bulk message | Automatic IDoc parsing |
| **PKCS#7/XML Splitter** | Split encrypted messages | Automatic |

**Grouping in General Splitter:**
```
Grouping = 1         → 1 record per message (most common)
Grouping = 5         → 5 records per message (mini-batches)
Grouping = 0         → all records in one message (no split, just conversion)
```

---

### Parallel vs Sequential Processing

**Sequential (default):**
```
Employee E001 → Process → Done
Employee E002 → Process → Done
Employee E003 → Process → Done
```
- Safe, predictable
- Easy error handling
- Slower

**Parallel:**
```
E001, E002, E003 → All process simultaneously → Done
```
- Much faster
- Harder to handle errors
- API rate limits can cause 429 errors
- Enable: Splitter → `Parallel Processing: Yes`

> **For Syllabrix API:** Use Sequential to avoid rate limits on the free tier.

---

### Common Errors & Fixes

| Error | Cause | Fix |
|---|---|---|
| `SFTP connection refused` | Wrong host/port/credentials | Test SFTP connection first with FileZilla |
| `File not picked up` | Wrong Read Lock Strategy | Switch to `Rename` for testing |
| `XPath returns empty` | Wrong namespace in XPath | Add namespace mapping or use `local-name()` |
| `CSV parsing error` | BOM character in file | Save CSV as UTF-8 without BOM |
| `5 messages but only 1 learning path` | JWT belongs to one user | Expected — in real scenario each employee has their own JWT |
| `Data Store entry ID conflict` | Same employee uploaded twice | Add `_${date:now:yyyyMMddHHmmssSSS}` to entry ID |

---

### XPath Namespace Issue Fix

If your CSV-to-XML converter adds a namespace and XPath fails:

```groovy
// In Groovy script before Splitter:
import com.sap.gateway.ip.core.customdev.util.Message

def Message processData(Message message) {
    def body = message.getBody(String.class)
    // Remove namespace declaration to simplify XPath
    body = body.replaceAll('xmlns="[^"]*"', '')
    message.setBody(body)
    return message
}
```

---

### Checklist

- [ ] SFTP credentials stored in Security Material
- [ ] CSV file uploaded to SFTP server
- [ ] iFlow polls and processes the file
- [ ] 5 messages appear in Message Monitor (one per row)
- [ ] Data Store shows 5 entries in EnrollmentAuditLog
- [ ] Processed file moved to `/processed/` directory
- [ ] No errors in Message Monitor

---

### Interview Q&A for Scenario 05

**Q: What is the difference between General Splitter and Iterating Splitter in CPI?**  
A: General Splitter uses XPath to split an XML document at specific element boundaries — you define exactly where to cut. Iterating Splitter splits by line count or token — useful for flat files, CSV, or when you want fixed-size chunks regardless of content structure.

**Q: What is "Stop on Exception" in the Splitter and when do you use each option?**  
A: Stop on Exception = Yes: If any split message fails processing, the entire batch stops. Use when all records must succeed together (e.g., financial transactions, order sets). Stop on Exception = No: Failed messages are logged but remaining records continue. Use when partial success is acceptable (bulk notifications, batch enrollments).

**Q: What is the Read Lock Strategy in SFTP Adapter?**  
A: Prevents processing files that are still being uploaded. Options: None (risky), Rename (renames file with .processing suffix), Done File (requires a companion .done file), Content Change (polls until file size stops changing), Exclusive Lock (OS-level lock). Production recommendation: Done File or Content Change.

**Q: How do you maintain message order in a Splitter flow?**  
A: Use Sequential Processing (Parallel = No). CPI processes split messages in XPath document order. If parallel processing is enabled, order is not guaranteed. For ordered processing with parallel performance, use the Sequencer pattern: add a sequence number header, process in parallel, re-sort by sequence number before aggregating.

**Q: What is a Data Store in CPI and what are its limits?**  
A: CPI Data Store is a key-value persistence layer built into the Cloud Integration runtime. Limits: Max entry size 1.5MB, retention period 1-180 days, Global visibility accessible across iFlows in the same tenant, Local visibility only within the same iFlow. Used for: dead letter queues, idempotency tracking, audit logs, temporary message buffering.

---

## Week 1 Complete! 🎉

You have now built:
- ✅ S01: Timer + HTTP + Groovy + Mail (async polling iFlow)
- ✅ S02: HTTP trigger + Message Mapping + REST-to-REST
- ✅ S03: Router + Content-Based Routing + 4 branches
- ✅ S04: SOAP → XSLT → REST (protocol conversion)
- ✅ S05: SFTP → CSV-to-XML → Splitter → Bulk processing

### Week 1 Interview Readiness Scorecard

| Topic | Covered | Confidence |
|---|---|---|
| Timer, Message Start Events | ✅ S01 | |
| HTTP Sender/Receiver Adapter | ✅ S01-04 | |
| Security Material / Credentials | ✅ S01-05 | |
| Groovy Scripting | ✅ S01, S04 | |
| Message Mapping (Graphical) | ✅ S02 | |
| Content Modifier | ✅ S02-05 | |
| Router + Conditions | ✅ S03 | |
| SOAP Adapter + WSDL | ✅ S04 | |
| XSLT Transformation | ✅ S04 | |
| SFTP Adapter | ✅ S05 | |
| Splitter Pattern | ✅ S05 | |
| Data Store Write | ✅ S05 | |
| Exchange Properties vs Headers | ✅ S02-05 | |
| Message Trace / Monitoring | ✅ S01-05 | |

---

**Next Week:** [Week 2 →](../MASTER-CASE-STUDY.md) Scenarios 06-10: Aggregator, Polling, Error Handling, Idempotency, Multicast
