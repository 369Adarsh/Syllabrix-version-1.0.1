# Scenario 01 — Learning Progress Sync → Email Notification
## Week 1 | Day 1–2 | Difficulty: ★☆☆

---

## What You Will Build

A Cloud Integration iFlow that runs every 2 hours, calls the Syllabrix API to fetch your learning paths, and emails you a progress summary.

```
[Timer: every 2hrs]
    ↓
[HTTP GET] → Syllabrix /api/career/learning
    ↓
[Groovy Script] → Build HTML email body
    ↓
[Mail Sender] → Gmail SMTP → your inbox
```

**Skills learned:** Timer Start Event, HTTP Receiver Adapter, Groovy Script, Mail Adapter, User Credentials Security Material

---

## Pre-Requisites

### 1. Get a Syllabrix JWT Token
You need your JWT from Syllabrix. Run this in your terminal or use Postman:

```bash
curl -X POST https://syllabrix-api.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"YOUR_EMAIL","password":"YOUR_PASSWORD"}'
```

Copy the `token` value from the response. Keep it — you'll paste it into CPI.

### 2. Get a Gmail App Password
1. Go to myaccount.google.com → Security → 2-Step Verification (enable if not done)
2. Search "App passwords" → Create → Name it `SAP CPI`
3. Copy the 16-character password shown (e.g. `abcd efgh ijkl mnop`)
   - Remove spaces: `abcdefghijklmnop`
4. Keep this — you'll use it as your SMTP password

### 3. Open Integration Suite
1. BTP Cockpit → your subaccount → Services → Instances and Subscriptions
2. Click **Integration Suite** → Go to Application
3. In Integration Suite home → Click **Cloud Integration** tile
4. You are now in the Cloud Integration web UI

---

## Step-by-Step: Create the iFlow

### STEP 1 — Create a New Package

1. In Cloud Integration → **Design** tab (left sidebar)
2. Click **Create** → **Package**
3. Fill in:
   - Name: `Syllabrix Integrations`
   - Short Description: `Real-world integration scenarios with Syllabrix EdTech API`
   - Version: `1.0.0`
4. Click **Save**
5. Click on the package to open it

---

### STEP 2 — Create the iFlow

1. Inside the package → Click **Add** → **Integration Flow**
2. Fill in:
   - Name: `S01 - Learning Progress Email Digest`
   - Description: `Polls Syllabrix learning paths and sends email summary every 2 hours`
3. Click **OK**
4. Click the iFlow name to open the designer

---

### STEP 3 — Set Up the Timer Start Event

> The canvas has a default Start Message event. We need to replace it with a Timer.

1. Click the **Start Message** event on the canvas → Press **Delete**
2. From the left palette → **Events** section → Drag **Timer Start Event** onto the canvas
3. Double-click the Timer → **Processing** tab:
   - Scheduler: `Time Interval`
   - Every: `2`
   - Unit: `Hour(s)`
   - Run Once: ☐ (unchecked)
4. Click anywhere else to deselect

---

### STEP 4 — Add HTTP Request Step (Call Syllabrix API)

1. From palette → **Call** → **External Call** → Drag **Request Reply** block after the Timer
2. Connect Timer → Request Reply (drag the arrow)
3. Click the **Request Reply** block → look at the bottom panel
4. In the right-side panel that appears → click the **connector icon** (circle with arrow) on the right edge of the block
5. This creates a **Receiver** placeholder on the right
6. Click the Receiver shape → in properties panel:
   - Adapter Type: **HTTP**
7. Configure the **HTTP Adapter**:

**Connection tab:**
```
URL: https://syllabrix-api.onrender.com/api/career/learning
Method: GET
Authentication: None (we'll add JWT via header)
```

**Header tab — Add Request Header:**
```
Name: Authorization
Value: Bearer YOUR_JWT_TOKEN_HERE
```
> Paste the full JWT token from Step 1. Later (Scenario 11) we'll move this to a Security Artifact properly.

8. Click **Save** (top right)

---

### STEP 5 — Add Groovy Script (Build Email Body)

1. From palette → **Message Transformers** → Drag **Script** step after Request Reply
2. Connect Request Reply → Script
3. Click the Script step → **Processing** tab → Type: **Groovy**
4. Click **Create** to open the script editor
5. Replace default content with:

```groovy
import com.sap.gateway.ip.core.customdev.util.Message
import groovy.json.JsonSlurper

def Message processData(Message message) {
    def body = message.getBody(String.class)
    
    // Parse Syllabrix response
    def json
    try {
        json = new JsonSlurper().parseText(body)
    } catch (Exception e) {
        message.setBody("<p>Error parsing Syllabrix response: ${e.message}</p>")
        return message
    }
    
    def paths = json?.data ?: []
    def today = new Date().format("dd MMM yyyy, hh:mm a")
    
    // Build HTML email
    def sb = new StringBuilder()
    sb.append("""
<html>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; color: #333;">
  <div style="background: #6C47FF; padding: 24px; border-radius: 12px 12px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 20px;">📚 Syllabrix Learning Progress</h1>
    <p style="color: #d4c8ff; margin: 6px 0 0 0; font-size: 13px;">${today}</p>
  </div>
  <div style="background: #f9f9fb; padding: 24px; border-radius: 0 0 12px 12px;">
""")
    
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
    <div style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; 
                padding: 16px; margin-bottom: 12px;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <h3 style="margin: 0; font-size: 15px; color: #1f2937;">${path.skill_name ?: 'Unnamed Path'}</h3>
        <span style="background: ${statusColor}20; color: ${statusColor}; 
                     padding: 3px 10px; border-radius: 20px; font-size: 11px; 
                     font-weight: bold;">${statusLabel}</span>
      </div>
      <p style="margin: 6px 0; color: #6b7280; font-size: 12px;">
        ${path.difficulty ?: ''} · ${totalDays} days total
      </p>
      <div style="background: #f1f5f9; border-radius: 6px; height: 8px; margin-top: 10px; overflow: hidden;">
        <div style="background: #6C47FF; height: 100%; width: ${pct}%; 
                    border-radius: 6px; transition: width 0.3s;"></div>
      </div>
      <p style="margin: 4px 0 0 0; color: #6b7280; font-size: 11px;">
        ${completedDays}/${totalDays} days completed (${pct}%)
      </p>
    </div>
""")
        }
    }
    
    sb.append("""
    <div style="text-align: center; margin-top: 20px;">
      <a href="https://syllabrix.com/career/learning" 
         style="background: #6C47FF; color: white; padding: 12px 28px; 
                border-radius: 8px; text-decoration: none; font-size: 14px; 
                font-weight: bold;">
        Continue Learning →
      </a>
    </div>
  </div>
</body>
</html>
""")
    
    message.setBody(sb.toString())
    message.setHeader("emailSubject", "Syllabrix Progress Report — ${today}")
    return message
}
```

6. Click **OK** to close editor
7. Click **Save**

---

### STEP 6 — Add Mail Sender

1. From palette → **Call** → **External Call** → Drag another **Request Reply** (or use **Send** step) after the Script
2. Connect Script → this new block
3. Add a Receiver shape → Adapter Type: **Mail**

**Mail Adapter — Connection tab:**
```
Address:    smtp.gmail.com:587
Protection: STARTTLS
Authentication: Plain User/Password
Credential Name: GmailCredentials    ← (we'll create this next)
```

**Mail Adapter — Processing tab:**
```
From:       your.email@gmail.com
To:         your.email@gmail.com
Subject:    ${header.emailSubject}
Content Type: text/html
Body:       ${in.body}
```

7. Click **Save**

---

### STEP 7 — Create Security Material (Gmail Credentials)

> Never hardcode passwords. Store them in CPI Security Material.

1. Go to **Monitor** tab (left sidebar) → **Manage Security** → **Security Material**
2. Click **Add** → **User Credentials**
3. Fill in:
   ```
   Name:        GmailCredentials
   Description: Gmail SMTP for Syllabrix notifications
   User:        your.email@gmail.com
   Password:    abcdefghijklmnop   (your 16-char App Password, no spaces)
   ```
4. Click **Deploy**
5. Status should show: **OK**

---

### STEP 8 — Deploy the iFlow

1. Go back to your iFlow designer
2. Click **Deploy** button (top right, cloud icon)
3. Confirm the deployment dialog
4. Wait ~30 seconds
5. Check status: Monitor → **All Integration Flows** → find `S01 - Learning Progress...`
   - Status should show: **Started**

---

### STEP 9 — Test It (Don't Wait 2 Hours!)

**Option A — Change Timer to run Once, redeploy:**
1. Open iFlow → Edit → Timer → Check **Run Once**
2. Deploy → check your inbox within 60 seconds
3. After test → uncheck Run Once, redeploy

**Option B — Use Message Trace to debug:**
1. Monitor → All Integration Flows → click your iFlow
2. Click **Edit** → set Log Level to **Trace**
3. Click **Deploy**
4. Monitor → Message Monitor → watch for the message to appear
5. Click the message → see each step's payload

---

### Expected Output (Email)

You should receive an HTML email like:

```
📚 Syllabrix Learning Progress — 12 Apr 2026, 10:30 AM

[SAP BTP Integration Suite]  [In Progress]
Intermediate · 30 days total
████████░░░░  8/30 days (26%)

[Continue Learning →]
```

---

### Common Errors & Fixes

| Error | Cause | Fix |
|---|---|---|
| `401 Unauthorized` | JWT expired | Re-login to Syllabrix, get new token, update header |
| `SMTP Authentication failed` | Wrong App Password | Regenerate Gmail App Password |
| `Connection refused port 587` | STARTTLS blocked | Try port 465 with SSL protection |
| `JsonException` | API returned error | Check Monitor → Message Trace → HTTP response step |
| `No paths in email` | User has no paths | Go to Syllabrix → /career/learning → generate one first |

---

### Checklist

- [ ] iFlow deployed with status: Started
- [ ] Email received in inbox
- [ ] Email shows correct learning path names + progress
- [ ] Credentials stored in Security Material (not hardcoded)
- [ ] Log Level set back to Error (not Trace) in production

---

### Interview Q&A for Scenario 01

**Q: What is a Timer Start Event in CPI?**  
A: It triggers an iFlow on a schedule (time interval or cron expression) without any inbound message. Unlike a Message Start Event which waits for HTTP/SFTP input, a Timer runs autonomously. Use it for batch jobs, polling, and scheduled reports.

**Q: What is the difference between Groovy Script and XSLT in CPI?**  
A: Groovy is Java-based scripting — use it for logic-heavy transformations, conditional processing, looping, external calls within scripts. XSLT is an XML stylesheet language — use it purely for XML-to-XML transformations with no side effects. XSLT is faster for pure XML; Groovy is more flexible.

**Q: How do you store sensitive credentials in Cloud Integration?**  
A: Use Security Material (Monitor → Manage Security → Security Material). Types: User Credentials (username/password), OAuth2, Secure Parameter (API keys), PGP Keys, Keystore (X.509 certificates). Never hardcode credentials in iFlow steps.

**Q: What is Message Trace and when do you use it?**  
A: Trace is the highest log level in CPI. It captures the exact payload at every step of the iFlow. Use it for debugging during development. Always switch back to Error in production — Trace stores large amounts of data and slows down processing.

**Q: What happens if the Groovy script throws an exception?**  
A: By default, the iFlow fails and the message lands in Failed state in Message Monitor. To handle it gracefully, wrap logic in try-catch inside the Groovy script and set a fallback body, or use an Exception Subprocess (covered in Scenario 08).

---

**Next:** [Scenario 02 →](WEEK1-SCENARIO-02.md) Syllabrix Career Profile → SAP SuccessFactors (REST-to-REST Mapping)
