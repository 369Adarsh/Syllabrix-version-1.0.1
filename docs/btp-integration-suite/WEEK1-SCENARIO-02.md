# Scenario 02 — Syllabrix Career Profile → SAP SuccessFactors (Mock)
## Week 1 | Day 3–4 | Difficulty: ★☆☆

---

## What You Will Build

An iFlow triggered by an HTTP POST that reads a Syllabrix career profile, transforms it using Graphical Message Mapping, and sends it to a mock SuccessFactors endpoint (webhook.site for trial — real SF in production).

```
[HTTP POST trigger] → /http/syllabrix-profile-sync
    ↓
[HTTP GET] → Syllabrix /api/career/profile
    ↓
[Message Mapping] → Syllabrix JSON → SF Candidate JSON
    ↓
[HTTP POST] → webhook.site (mock SF endpoint)
    ↓
[HTTP Response] → Return sync result
```

**Skills learned:** HTTP Sender Adapter, Message Mapping (Graphical), Content Modifier, Request-Reply chaining, webhook.site for testing

---

## Pre-Requisites

### 1. Get Your Mock Endpoint
1. Go to **https://webhook.site**
2. Copy your unique URL — looks like: `https://webhook.site/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
3. Keep this tab open — you'll see incoming requests here in real time
4. This simulates your SuccessFactors endpoint

### 2. Verify Syllabrix Has a Career Profile
- Login to Syllabrix → /career/profile or /home
- If no profile exists → go to /career/skills → paste resume → analyze
- You need at least `current_role` filled

---

## Step-by-Step: Create the iFlow

### STEP 1 — Create the iFlow in Your Package

1. Open your `Syllabrix Integrations` package → **Add** → **Integration Flow**
2. Name: `S02 - Career Profile to SuccessFactors`
3. Description: `Syncs Syllabrix career profile to SF Candidate object on demand`
4. Click **OK** → open the designer

---

### STEP 2 — Configure HTTP Sender Adapter (Inbound Trigger)

> This makes your iFlow callable via an HTTPS endpoint.

1. Click the default **Start Message** event on canvas
2. In the bottom panel → click the **Sender** connection icon (left side)
3. A Sender shape appears on the left
4. Click the **Sender** shape → Adapter Type: **HTTPS**

**HTTPS Adapter — Connection tab:**
```
Address:    /syllabrix-profile-sync
CSRF Protected: Yes (default)
```

> The full URL will be:  
> `https://YOUR-TENANT.it-cpi.cfapps.YOUR-REGION.hana.ondemand.com/http/syllabrix-profile-sync`

5. Click **Save**

---

### STEP 3 — Content Modifier: Set JWT Header

1. Drag a **Content Modifier** step after the Start event
2. Connect Start → Content Modifier
3. Click Content Modifier → **Message Header** tab → **Add**:

```
Action: Create
Name: Authorization
Type: Constant
Value: Bearer YOUR_JWT_TOKEN_HERE
```

4. Add another header:
```
Action: Create  
Name: Content-Type
Type: Constant
Value: application/json
```

5. Click **Save**

---

### STEP 4 — Request Reply: GET Syllabrix Profile

1. Drag **Request Reply** → connect Content Modifier → Request Reply
2. Add Receiver → Adapter Type: **HTTP**

**HTTP Adapter — Connection:**
```
URL: https://syllabrix-api.up.railway.app/api/career/profile
Method: GET
Send Body: No (GET request)
Request Headers: Authorization    ← select the header we set
```

> **Important:** In the "Request Headers" field, list headers to forward:  
> `Authorization,Content-Type`

---

### STEP 5 — Add Message Mapping

This is the key step — graphical field mapping.

1. Drag **Message Mapping** step → connect Request Reply → Message Mapping
2. Click the Message Mapping step → **Processing** tab → Click **Create**

#### Define Source Structure (Syllabrix Profile JSON)

In the mapping editor:
1. Click **Add Source Message** → **Add JSON**
2. Paste this sample JSON (represents Syllabrix profile schema):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "user_id": 42,
    "current_role": "SAP BTP Consultant",
    "current_company": "Infosys",
    "experience_years": 3,
    "industry": "Technology",
    "primary_domain": "SAP",
    "career_goal": "Senior Architect",
    "target_role": "SAP Solution Architect",
    "preferred_location": "Bangalore",
    "salary_expectation": "15-20 LPA",
    "onboarding_completed": 1
  }
}
```
3. Name it: `SyllabrixProfile`
4. Click **OK**

#### Define Target Structure (SuccessFactors Candidate)

1. Click **Add Target Message** → **Add JSON**
2. Paste target schema:
```json
{
  "candidate": {
    "currentTitle": "",
    "currentCompany": "",
    "yearsOfExperience": 0,
    "industry": "",
    "domain": "",
    "targetRole": "",
    "preferredLocation": "",
    "salaryExpectation": "",
    "source": "",
    "profileComplete": false
  }
}
```
3. Name it: `SFCandidate`

#### Draw the Mappings

Connect fields by dragging lines:

| Source (Syllabrix) | → | Target (SF) | Function |
|---|---|---|---|
| `data/current_role` | → | `candidate/currentTitle` | Direct |
| `data/current_company` | → | `candidate/currentCompany` | Direct |
| `data/experience_years` | → | `candidate/yearsOfExperience` | Direct |
| `data/industry` | → | `candidate/industry` | Direct |
| `data/primary_domain` | → | `candidate/domain` | Direct |
| `data/target_role` | → | `candidate/targetRole` | Direct |
| `data/preferred_location` | → | `candidate/preferredLocation` | Direct |
| `data/salary_expectation` | → | `candidate/salaryExpectation` | Direct |

**Special mapping — source constant:**
- Click `candidate/source` target field → right-click → **Create Constant**
- Value: `Syllabrix`

**Special mapping — onboarding_completed → profileComplete (boolean):**
1. `data/onboarding_completed` → drag to an empty area
2. Right-click → **Standard Functions** → **Boolean Functions** → **equalS**
3. One input: `onboarding_completed`, other input: Constant `1`
4. Output → `candidate/profileComplete`

4. Click **OK** to close mapping editor

---

### STEP 6 — Add Content Modifier: Set Target Headers

1. Add another **Content Modifier** after Message Mapping
2. **Message Header** tab → Add:
```
Name: Content-Type
Type: Constant
Value: application/json
```
3. **Exchange Property** tab → Add:
```
Name: syncTimestamp
Type: Expression
Value: ${date:now:yyyy-MM-dd'T'HH:mm:ss'Z'}
```

---

### STEP 7 — Send to Mock SF Endpoint (webhook.site)

1. Add **Request Reply** → connect Content Modifier → Request Reply
2. Add Receiver → Adapter Type: **HTTP**

**HTTP Adapter — Connection:**
```
URL: https://webhook.site/YOUR-UNIQUE-ID
Method: POST
Authentication: None
Content-Type: application/json
```

---

### STEP 8 — Return Response to Caller

1. Add **Content Modifier** at the end
2. **Message Body** tab:
```
Type: Expression
Body: 
{
  "success": true,
  "message": "Profile synced to SuccessFactors",
  "timestamp": "${exchangeProperty.syncTimestamp}",
  "source": "Syllabrix"
}
```

3. Connect to **End Message** event
4. Click **Save** → **Deploy**

---

### STEP 9 — Test It

#### Get Your iFlow Endpoint URL
1. Monitor → All Integration Flows → click your iFlow
2. Click **Endpoints** tab
3. Copy the URL — looks like:
   `https://xxxxxxxx.it-cpi.cfapps.us20.hana.ondemand.com/http/syllabrix-profile-sync`

#### Call the Endpoint
```bash
curl -X POST "YOUR_IFLOW_ENDPOINT_URL" \
  -H "Content-Type: application/json" \
  -u "your_btp_email@domain.com:your_btp_password" \
  -d "{}"
```

> Note: CPI HTTP endpoints require Basic Auth using your BTP user credentials

#### Verify on webhook.site
Open your webhook.site tab — you should see a new request with:
```json
{
  "candidate": {
    "currentTitle": "SAP BTP Consultant",
    "currentCompany": "Infosys",
    "yearsOfExperience": 3,
    "industry": "Technology",
    "domain": "SAP",
    "targetRole": "SAP Solution Architect",
    "preferredLocation": "Bangalore",
    "salaryExpectation": "15-20 LPA",
    "source": "Syllabrix",
    "profileComplete": true
  }
}
```

---

### Understanding Message Mapping — Deep Dive

#### How the Graphical Mapper Works Internally
The graphical mapper generates an **XSLT** stylesheet behind the scenes. You can see it:
1. In mapping editor → click **Functions** → **Display Mapping Code**
2. This shows the generated XSLT — useful to understand what CPI does under the hood

#### Function Types in Message Mapping

| Category | Functions | When to Use |
|---|---|---|
| String | `concat`, `substring`, `upper-case`, `lower-case` | Text manipulation |
| Arithmetic | `add`, `subtract`, `multiply`, `divide` | Number calculations |
| Boolean | `equalS`, `notEqualS`, `if`, `ifWithoutElse` | Conditional mapping |
| Date | `formatDate`, `parseDate`, `currentDate` | Date transformation |
| Constants | Create constant, Create context | Fixed values |
| Node | `splitByValue`, `removeContexts` | Structure changes |

---

### Common Errors & Fixes

| Error | Cause | Fix |
|---|---|---|
| `403 Forbidden on iFlow endpoint` | Wrong Basic Auth | Use BTP credentials (not Syllabrix) |
| `Empty mapping output` | JSON path wrong | In mapping editor, check source path starts with `data/` not root |
| `Content type not supported` | Missing Content-Type header | Add `application/json` in Content Modifier before POST |
| `Mapping validation error` | Type mismatch | `experience_years` is integer, `yearsOfExperience` must also be integer — add `parseInt` function |

---

### Checklist

- [ ] iFlow deployed and Started
- [ ] Called endpoint with curl/Postman
- [ ] webhook.site shows the mapped JSON
- [ ] All fields correctly transformed
- [ ] Constant field `source: "Syllabrix"` appears in output
- [ ] Boolean `profileComplete` shows `true` when onboarding complete

---

### Interview Q&A for Scenario 02

**Q: What is Message Mapping in CPI and how does it work internally?**  
A: Message Mapping is a graphical tool to map fields between source and target structures (XML or JSON). Internally it generates an XSLT stylesheet. You connect source to target fields and can apply standard functions (string, date, math, boolean). For complex logic, use a Custom Function (Java) or switch to full XSLT.

**Q: What is the difference between HTTP Sender and HTTP Receiver adapters?**  
A: HTTP Sender (inbound) exposes your iFlow as an HTTPS endpoint — external systems call it. HTTP Receiver (outbound) calls an external system from within the iFlow. Sender = you receive; Receiver = you call.

**Q: How do you expose an iFlow as a REST endpoint?**  
A: Add an HTTP Sender adapter to the Start event. Configure the Address path (e.g. `/syllabrix-sync`). After deployment, the full URL is `https://TENANT/http/syllabrix-sync`. Authentication is Basic (BTP credentials) by default, or you can configure OAuth.

**Q: What is a Content Modifier step?**  
A: It modifies the message without calling an external system. Three tabs: (1) Message Header — set/create/delete HTTP headers, (2) Exchange Property — set internal flow variables (not sent externally), (3) Message Body — overwrite the payload. Essential for setting Authorization headers, timestamps, constants.

**Q: Can Message Mapping handle arrays/lists?**  
A: Yes. For repeating elements (arrays), you set the context node. Use `1..n` multiplicity on the target node and `splitByValue` or `removeContexts` functions to iterate. For complex array transformations, Groovy or XSLT is often cleaner.

---

**Next:** [Scenario 03 →](WEEK1-SCENARIO-03.md) Content-Based Routing by User Type
