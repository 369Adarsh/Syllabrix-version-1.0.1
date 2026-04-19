# Scenario 03 — Content-Based Routing by User Type
## Week 1 | Day 5 | Difficulty: ★☆☆

---

## What You Will Build

An iFlow that receives a Syllabrix user registration event and routes it to different downstream systems based on the `user_type` field — using the **Router** step with multiple conditional branches.

```
[HTTP POST] → /http/syllabrix-user-router
    ↓
[Content Modifier] → Extract user_type into Property
    ↓
[Router]
  ├── user_type = 'student'              → webhook.site/students
  ├── user_type = 'professional_learner' → webhook.site/professionals  
  ├── user_type = 'teacher'              → webhook.site/teachers
  └── Default                            → Slack alert (webhook)
```

**Skills learned:** Router step, routing conditions (XPath/Property/Header), Exchange Properties, Default route, Content-Based Routing pattern

---

## Pre-Requisites

### 1. Create 3 Separate webhook.site URLs
1. Open **3 different browser tabs**
2. Each tab: go to `https://webhook.site`
3. Each gets a unique URL — copy all three:
   - Students URL: `https://webhook.site/AAA-students`
   - Professionals URL: `https://webhook.site/BBB-professionals`
   - Teachers URL: `https://webhook.site/CCC-teachers`

### 2. Get a Slack Webhook (for Default route)
1. Go to **api.slack.com/apps** → Create New App → From Scratch
2. Name: `Syllabrix CPI Alerts` → Select your workspace
3. In app settings → **Incoming Webhooks** → Activate Incoming Webhooks
4. Click **Add New Webhook to Workspace** → choose a channel → `#cpi-alerts`
5. Copy the webhook URL: `https://hooks.slack.com/services/T.../B.../xxx`

---

## Step-by-Step: Create the iFlow

### STEP 1 — New iFlow

1. Package → **Add** → **Integration Flow**
2. Name: `S03 - User Type Content Based Router`
3. Open designer

---

### STEP 2 — HTTP Sender Adapter

1. Start event → add Sender → HTTPS Adapter
2. Address: `/syllabrix-user-router`

---

### STEP 3 — Content Modifier: Extract user_type

1. Drag **Content Modifier** after Start
2. **Exchange Property** tab → **Add**:

```
Name:       userType
Type:       XPath
Value:      //user_type/text()
Data Type:  java.lang.String
```

> We also add a second property for the user's name (for the Slack alert):

```
Name:       userName
Type:       XPath  
Value:      //username/text()
Data Type:  java.lang.String
```

> **Why Exchange Property vs Header?**  
> Properties are internal to the iFlow — they don't get forwarded to external systems.  
> Headers CAN get forwarded. Use Properties for routing logic to keep it clean.

---

### STEP 4 — Add the Router Step

1. From palette → **Routing** → **Router**
2. Drag onto canvas → connect Content Modifier → Router

> The Router creates multiple outgoing branches. Each branch has its own condition.

---

### STEP 5 — Configure Route 1: Students

1. Click the **first outgoing arrow** from the Router
2. In properties → **Processing** tab:
   ```
   Name:                  Route to Student System
   Condition Type:        Non-XML (Expression Language)
   Condition Expression:  ${property.userType} = 'student'
   ```

3. Add Receiver → HTTP Adapter:
   ```
   URL:    https://webhook.site/AAA-students
   Method: POST
   ```

---

### STEP 6 — Configure Route 2: Professional Learner

1. Right-click the Router → **Add Route**
2. Click the new outgoing arrow:
   ```
   Name:                  Route to Professional System
   Condition Type:        Non-XML (Expression Language)
   Condition Expression:  ${property.userType} = 'professional_learner'
   ```
3. Add Receiver → HTTP Adapter:
   ```
   URL:    https://webhook.site/BBB-professionals
   Method: POST
   ```

---

### STEP 7 — Configure Route 3: Teacher

1. Right-click Router → **Add Route**
2. Configure:
   ```
   Name:                  Route to Teacher System
   Condition Type:        Non-XML (Expression Language)
   Condition Expression:  ${property.userType} = 'teacher'
   ```
3. Add Receiver → HTTP Adapter:
   ```
   URL:    https://webhook.site/CCC-teachers
   Method: POST
   ```

---

### STEP 8 — Configure Default Route (Slack Alert)

> The default route catches anything that doesn't match — unknown user types.

1. Right-click Router → **Add Default Route**
   - This creates a route marked as "Default" — no condition needed
2. Before the Receiver, add a **Content Modifier** to build the Slack message:

**Content Modifier → Message Body tab:**
```
Type: Expression
Body:
{
  "text": "⚠️ Unknown user type received from Syllabrix!\nUser: ${exchangeProperty.userName}\nType: *${exchangeProperty.userType}*\nCheck your integration.",
  "channel": "#cpi-alerts"
}
```

3. Add Receiver → HTTP Adapter:
   ```
   URL:    https://hooks.slack.com/services/YOUR/WEBHOOK/URL
   Method: POST
   ```

---

### STEP 9 — Add End Events to Each Branch

> Each branch needs its own End event.

1. For each branch after the HTTP Receiver → drag **End Message** event
2. Connect: HTTP Receiver → End Message

Your canvas should look like:
```
[Start] → [Content Modifier] → [Router] ─┬─ [HTTP: students]      → [End]
                                          ├─ [HTTP: professionals] → [End]
                                          ├─ [HTTP: teachers]      → [End]
                                          └─ [Content Modifier: Slack] → [HTTP: Slack] → [End]
```

---

### STEP 10 — Deploy and Test All Routes

Deploy the iFlow. Get your endpoint URL from Monitor → Endpoints.

#### Test 1: Student Route
```bash
curl -X POST "YOUR_IFLOW_URL" \
  -H "Content-Type: application/json" \
  -u "btp_email:btp_password" \
  -d '{
    "user_id": 101,
    "username": "arjun_student",
    "email": "arjun@student.com",
    "user_type": "student",
    "full_name": "Arjun Sharma"
  }'
```
✅ **Verify:** webhook.site/students tab shows the request

#### Test 2: Professional Learner Route
```bash
curl -X POST "YOUR_IFLOW_URL" \
  -H "Content-Type: application/json" \
  -u "btp_email:btp_password" \
  -d '{
    "user_id": 102,
    "username": "krish_pro",
    "email": "krish@company.com",
    "user_type": "professional_learner",
    "full_name": "Krish Kumar"
  }'
```
✅ **Verify:** webhook.site/professionals tab shows the request

#### Test 3: Default Route (Unknown type)
```bash
curl -X POST "YOUR_IFLOW_URL" \
  -H "Content-Type: application/json" \
  -u "btp_email:btp_password" \
  -d '{
    "user_id": 999,
    "username": "unknown_user",
    "email": "unknown@test.com",
    "user_type": "admin",
    "full_name": "Admin User"
  }'
```
✅ **Verify:** Slack channel `#cpi-alerts` receives the warning message

---

### Deep Dive: Routing Condition Types Compared

| Type | Syntax | When to Use |
|---|---|---|
| Non-XML (EL) | `${property.X} = 'value'` | JSON payloads, properties/headers |
| XPath | `//field/text() = 'value'` | XML payloads |
| Header | `${header.X} = 'value'` | HTTP header-based routing |

**Expression Language (EL) Reference:**
```
${property.myProp}         → Exchange Property
${header.myHeader}         → Message Header
${in.body}                 → Full message body as string
${in.header.Content-Type}  → Specific header
```

**Compound Conditions:**
```
${property.userType} = 'student' AND ${property.country} = 'IN'
${property.amount} > 10000 OR ${property.priority} = 'HIGH'
```

---

### Common Errors & Fixes

| Error | Cause | Fix |
|---|---|---|
| All messages go to Default | Property not set | Check XPath in Content Modifier — must match exact field name in JSON |
| `XPath evaluation failed` | JSON payload, used XPath condition | Switch condition type to `Non-XML` for JSON |
| `No route matched, message dropped` | No Default route | Always add a Default route |
| Slack message not received | Wrong webhook URL | Test webhook URL with curl directly first |

---

### Checklist

- [ ] All 3 routes tested and verified on correct webhook.site tab
- [ ] Default route fires for unknown user_type
- [ ] Slack alert received with correct username
- [ ] Exchange Properties used (not Headers) for routing logic
- [ ] iFlow canvas clean with End events on all branches

---

### Interview Q&A for Scenario 03

**Q: What is the Content-Based Router pattern?**  
A: A message routing pattern where the content (data) of the message determines which processing path it takes. In CPI, implemented via the Router step with conditional expressions. Essential for fan-out integrations where one inbound event goes to different systems.

**Q: What is the difference between Router and Multicast?**  
A: Router sends the message to exactly ONE matching branch (exclusive OR). Multicast sends the message to ALL branches simultaneously. Use Router when you need to choose one target; use Multicast when all targets should receive the same message.

**Q: What is an Exchange Property vs a Message Header in CPI?**  
A: Headers are part of the message and CAN be forwarded to external systems (like HTTP headers). Exchange Properties are internal flow variables — never sent to external systems. Always use Properties for routing logic, counters, and internal state to avoid accidentally sending internal data to external systems.

**Q: What happens if no Router condition matches and there is no Default route?**  
A: The message is dropped silently — no error is thrown by default. This is a dangerous scenario. Always define a Default route that logs or alerts about unexpected messages. Without it, you lose messages with no trace.

**Q: Can you nest Routers in CPI?**  
A: Yes. You can have a Router inside a branch of another Router. This creates hierarchical routing. However, complex nested routing is hard to maintain — consider restructuring into separate iFlows called via Process Direct or Local Integration Process for maintainability.

---

**Next:** [Scenario 04 →](WEEK1-SCENARIO-04.md) SOAP RFC → Syllabrix REST (Protocol Conversion)
