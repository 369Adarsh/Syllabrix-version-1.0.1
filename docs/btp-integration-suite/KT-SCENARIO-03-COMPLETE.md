# KT Document — Scenario 03: Secure JWT Auto-Refresh
## SAP BTP Cloud Integration | Syllabrix Case Study | Complete Baby-Step SOP
### Version 1.0 | April 2026

---

# PART 1 — WHAT ARE WE BUILDING AND WHY

---

## 1.1 The Business Problem (Plain English)

In Scenario 01 and Scenario 02, we hardcoded the JWT token directly inside the iFlow's Content Modifier. This creates three serious problems:

**Problem 1 — Token Expiry:**
JWT tokens expire (typically every 24 hours to 7 days). Every time it expires, someone has to manually open the iFlow, paste a new token, save, and redeploy. This is not sustainable in production.

**Problem 2 — Security Risk:**
The JWT token is visible to anyone who can open the iFlow designer in CPI. If a team member opens the iFlow to check a step, they can see the token. This violates the principle of least privilege.

**Problem 3 — Credential Management:**
If the password changes, you have to update every iFlow that uses it. In large enterprises, one system may have 50+ iFlows — updating all of them manually is error-prone.

**The solution we are building:**
- Store Syllabrix credentials (email + password) in **CPI Security Material** — encrypted, access-controlled, never visible in iFlow design
- iFlow **auto-logs in** to Syllabrix on every run using those stored credentials
- Fresh JWT is extracted from login response and stored as an **Exchange Property**
- All API calls use the fresh JWT automatically
- **Nobody ever needs to update the iFlow again** when the token expires

---

## 1.2 Why This Matters in Enterprise SAP Projects

In every SAP BTP project you will work on, the first security review question is:

> *"Are any credentials hardcoded in your iFlows?"*

If the answer is yes, the project fails security audit. This scenario teaches you the **correct, production-grade pattern** for credential management in CPI.

**Real-world usage of this pattern:**
- SAP S/4HANA auto-login to third-party APIs
- SuccessFactors integration with external HR systems
- Auto-refreshing OAuth2 tokens for Salesforce, ServiceNow integrations
- Any scheduled integration that calls a protected REST API

---

## 1.3 Business Impact

| Stakeholder | Problem Without S03 | Solution With S03 |
|---|---|---|
| Integration Developer | Manual token update every few days | Zero manual intervention |
| Security Team | Credentials visible in iFlow design | Credentials encrypted in Security Material |
| Operations Team | iFlow fails silently when token expires | Fresh token on every run — no failures |
| IT Manager | 50 iFlows need updates when password changes | Update Security Material once — all iFlows fixed |

---

## 1.4 What You Will Build

A Cloud Integration iFlow that:
1. Runs every 2 hours (Timer)
2. Reads Syllabrix credentials from **Security Material** (never hardcoded)
3. Auto-logs in to Syllabrix and gets a fresh JWT
4. Uses that JWT to fetch the user's career profile
5. Emails a secure profile summary to your inbox

```
[Timer: every 2hrs]
        ↓
[Groovy 1: ReadCredentials]
→ Reads email + password from Security Material
→ Builds login request body
        ↓
[Request Reply 1] → POST /api/auth/login → Receiver (HTTP)
        ↓
[Groovy 2: ExtractJWT]
→ Parses login response
→ Stores token as Exchange Property "jwtToken"
        ↓
[Content Modifier]
→ Sets Authorization header = Bearer {jwtToken}
        ↓
[Request Reply 2] → GET /api/career/profile → Receiver1 (HTTP)
        ↓
[Groovy 3: BuildSummary]
→ Formats HTML email
→ Shows profile + confirms JWT was auto-refreshed
        ↓
[Mail Sender] → Gmail SMTP → your inbox
        ↓
[End]
```

**Skills Learned:**
- User Credentials Security Material
- SecureStoreService API in Groovy
- Exchange Properties for token passing
- Dynamic Authorization header injection
- Production-grade credential management pattern

---

# PART 2 — CORE CONCEPTS

---

## 2.1 What is Security Material in CPI?

Security Material is CPI's encrypted vault for storing sensitive data. It is accessible only to iFlows running in the same tenant and to users with the PI_Administrator role.

**Types of Security Material:**

| Type | What it stores | Example use |
|---|---|---|
| User Credentials | Username + Password | Syllabrix login, SFTP credentials, SMTP password |
| Secure Parameter | Single encrypted string | API keys, secret tokens |
| OAuth2 Client Credentials | Client ID + Client Secret + Token URL | Salesforce, SuccessFactors OAuth |
| PGP Key | Public/Private PGP keys | Encrypting data files |
| Keystore | X.509 certificates | HTTPS mutual TLS |

**In this scenario** we use **User Credentials** to store the Syllabrix email and password.

---

## 2.2 Why Not Store Credentials in Content Modifier?

| | Content Modifier | Security Material |
|---|---|---|
| Visibility | Visible to anyone who opens iFlow | Encrypted, never visible |
| Auditability | No audit log | Full audit trail of access |
| Rotation | Update every iFlow manually | Update once, all iFlows pick it up |
| Security Audit | Fails audit | Passes audit |
| GDPR / Compliance | Non-compliant | Compliant |

---

## 2.3 What is an Exchange Property?

An Exchange Property is a key-value pair that travels with the message through the entire iFlow. Unlike Message Headers (which can be forwarded to external systems), Exchange Properties stay internal to the iFlow.

**Why we use Exchange Property for the JWT token:**
- The JWT must survive across multiple steps (login → extract → use)
- We do NOT want to send the JWT as an HTTP request header unless explicitly needed
- Properties are the safest way to pass data internally

**Setting a property in Groovy:**
```groovy
message.setProperty("jwtToken", "Bearer eyJ...")
```

**Reading a property in Content Modifier:**
```
Source Type: XPath
Value: ${property.jwtToken}
```

---

## 2.4 What is SecureStoreService?

`SecureStoreService` is a Java/Groovy API built into CPI that allows scripts to read from Security Material programmatically at runtime.

```groovy
import com.sap.it.api.securestore.SecureStoreService
import com.sap.it.api.ITApiFactory

def service = ITApiFactory.getApi(SecureStoreService.class, null)
def cred = service.getUserCredential("SyllabrixCredentials")
def email = cred.getUsername()
def password = new String(cred.getPassword())
```

**Key points:**
- `getUserCredential("name")` reads User Credentials by name
- `getPassword()` returns a `char[]` (not String) for security — convert with `new String(...)`
- If the Security Material name doesn't exist, it throws a `NullPointerException` — always validate

---

## 2.5 JWT Token Lifecycle in This iFlow

```
Every 2 Hours:
┌─────────────────────────────────────────────────────┐
│  1. Security Material → ReadCredentials.groovy       │
│     email: 123anita2kumari@gmail.com (encrypted)    │
│     password: ••••••••• (encrypted)                 │
│                    ↓                                 │
│  2. POST /api/auth/login                             │
│     Response: {"token": "eyJhbGci..."}              │
│                    ↓                                 │
│  3. ExtractJWT.groovy                                │
│     stores: property["jwtToken"] = "Bearer eyJ..."  │
│                    ↓                                 │
│  4. Content Modifier                                 │
│     header["Authorization"] = property["jwtToken"]  │
│                    ↓                                 │
│  5. GET /api/career/profile                          │
│     Header: Authorization: Bearer eyJ... (fresh!)   │
└─────────────────────────────────────────────────────┘
```

---

# PART 3 — PRE-REQUISITES

---

## 3.1 What You Need Before Starting

- [ ] Scenario 01 completed (you know how Mail Sender and Timer work)
- [ ] GmailCredentials Security Material already deployed (from S01)
- [ ] Syllabrix account: 123anita2kumari@gmail.com / 123@Adarsh
- [ ] CPI tenant access with PI_Administrator role

---

## 3.2 Verify the Syllabrix API is Awake

Before building, hit the Render API once in Postman to wake it up:

```
POST https://syllabrix-api.onrender.com/api/auth/login
Body: {"email":"123anita2kumari@gmail.com","password":"123@Adarsh"}
```

Expected: 200 OK with a `token` field in response.

---

# PART 4 — STEP-BY-STEP BUILD GUIDE

---

## STEP 1 — Create the Security Material

> This is the most important step — this replaces hardcoded credentials forever.

1. Go to **Monitor** (left sidebar) → **Integrations and APIs** → **Manage Security** → **Security Material**
2. Click **Add** → **User Credentials**
3. Fill in:
   ```
   Name:        SyllabrixCredentials
   Description: Syllabrix API login credentials for auto JWT refresh
   User:        123anita2kumari@gmail.com
   Password:    123@Adarsh
   ```
4. Click **Deploy**
5. Status should show: **OK**

> **Why this name?** The name `SyllabrixCredentials` is referenced exactly in the Groovy script. If you use a different name, update the script.

---

## STEP 2 — Create a New iFlow

1. Design → **Syllabrix Integrations** package → **Add** → **Integration Flow**
2. Fill in:
   ```
   Name:        S03 - Secure JWT Auto-Refresh
   Description: Auto-logins to Syllabrix using Security Material, refreshes JWT, fetches profile
   ```
3. Click **OK** → click the iFlow name to open designer

---

## STEP 3 — Set Up Timer Start Event

1. Delete the default Start Message event
2. From palette → **Events** → drag **Timer Start Event**
3. Double-click Timer → **Scheduler** tab:
   - Select: **Basic**
   - Enter As: **Simple Schedule**
   - Repeat: **Minutes**
   - Every: **2** (for testing — change to Hours/2 in production)
4. Click outside to deselect

---

## STEP 4 — Add Groovy Script 1: ReadCredentials

1. From palette → **Message Transformers** → drag **Script** step onto canvas
2. Connect Timer → Script
3. Click Script → **Processing** tab → Type: **Groovy**
4. Click **Create** → paste this code:

```groovy
import com.sap.it.api.securestore.SecureStoreService
import com.sap.it.api.ITApiFactory

def processData(def message) {
    // Read Syllabrix credentials from Security Material (never hardcoded)
    def service = ITApiFactory.getApi(SecureStoreService.class, null)
    
    if (service == null) {
        throw new Exception("SecureStoreService not available — check CPI runtime")
    }
    
    def cred = service.getUserCredential("SyllabrixCredentials")
    
    if (cred == null) {
        throw new Exception("Security Material 'SyllabrixCredentials' not found — deploy it first")
    }
    
    def email = cred.getUsername()
    def password = new String(cred.getPassword())
    
    // Build login request body
    def loginBody = """{"email":"${email}","password":"${password}"}"""
    
    message.setBody(loginBody)
    message.setHeader("Content-Type", "application/json")
    
    return message
}
```

5. Click **OK** → **Save**

---

## STEP 5 — Add Request Reply 1: Login to Syllabrix

1. From palette → **Call** → **External Call** → drag **Request Reply** after Groovy Script 1
2. Connect Groovy Script 1 → Request Reply 1
3. Add a **Receiver** shape → Adapter Type: **HTTP**

**HTTP Adapter — Connection tab:**
```
Address:        https://syllabrix-api.onrender.com/api/auth/login
Method:         POST
Authentication: None
Timeout (ms):   90000
```

**HTTP Adapter — Header Details:**
```
Request Headers:  Content-Type
Response Headers: *
```

4. Click **Save**

---

## STEP 6 — Add Groovy Script 2: ExtractJWT

1. From palette → drag another **Script** step after Request Reply 1
2. Connect Request Reply 1 → Groovy Script 2
3. Click Script → **Processing** tab → Type: **Groovy**
4. Click **Create** → paste this code:

```groovy
def processData(def message) {
    def body = message.getBody(String.class)
    
    if (!body) {
        throw new Exception("Empty response from Syllabrix login endpoint")
    }
    
    def json
    try {
        json = new groovy.json.JsonSlurper().parseText(body)
    } catch (Exception e) {
        throw new Exception("Invalid JSON from login response: ${e.message}")
    }
    
    def token = json?.token
    
    if (!token) {
        def errorMsg = json?.message ?: "Unknown error"
        throw new Exception("JWT extraction failed — API response: ${errorMsg}")
    }
    
    // Store token as Exchange Property (internal — never forwarded externally)
    message.setProperty("jwtToken", "Bearer ${token}")
    message.setProperty("loginTime", new Date().format("dd MMM yyyy, hh:mm a"))
    message.setProperty("loginSuccess", "true")
    
    return message
}
```

5. Click **OK** → **Save**

---

## STEP 7 — Add Content Modifier: Set Authorization Header

1. From palette → **Message Transformers** → drag **Content Modifier** after Groovy Script 2
2. Connect Groovy Script 2 → Content Modifier
3. Click Content Modifier → **Message Header** tab → **Add**:
   ```
   Action:       Create
   Name:         Authorization
   Source Type:  Expression
   Value:        ${property.jwtToken}
   ```
4. Click **Save**

> **Key point:** This reads the JWT from the Exchange Property and injects it as an HTTP header. No token is hardcoded anywhere.

---

## STEP 8 — Add Request Reply 2: Fetch Profile

1. From palette → drag **Request Reply** after Content Modifier
2. Connect Content Modifier → Request Reply 2
3. Add a **Receiver** shape → Adapter Type: **HTTP**

**HTTP Adapter — Connection tab:**
```
Address:        https://syllabrix-api.onrender.com/api/career/profile
Method:         GET
Authentication: None
Timeout (ms):   90000
```

**HTTP Adapter — Header Details:**
```
Request Headers:  Authorization
Response Headers: *
```

4. Click **Save**

---

## STEP 9 — Add Groovy Script 3: BuildSummary

1. From palette → drag **Script** step after Request Reply 2
2. Connect Request Reply 2 → Groovy Script 3
3. Click Script → **Processing** tab → Type: **Groovy**
4. Click **Create** → paste this code:

```groovy
def processData(def message) {
    def body = message.getBody(String.class)
    def loginTime = message.getProperty("loginTime") ?: "Unknown"
    def today = new Date().format("dd MMM yyyy, hh:mm a")
    
    def profile = [:]
    try {
        def json = new groovy.json.JsonSlurper().parseText(body)
        profile = json?.data ?: [:]
    } catch (Exception e) {
        profile = [full_name: "Parse Error", current_role: e.message]
    }

    def html = """
<html>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; color: #333;">
  <div style="background: #6C47FF; padding: 24px; border-radius: 12px 12px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 20px;">Syllabrix Secure Profile Sync</h1>
    <p style="color: #d4c8ff; margin: 6px 0 0 0; font-size: 13px;">${today}</p>
  </div>
  <div style="background: #f9f9fb; padding: 24px; border-radius: 0 0 12px 12px;">

    <div style="background: #e8f5e9; border: 1px solid #a5d6a7; border-radius: 8px;
                padding: 12px; margin-bottom: 20px;">
      <p style="margin: 0; color: #2e7d32; font-size: 13px; font-weight: bold;">
        JWT Auto-Refreshed Successfully
      </p>
      <p style="margin: 4px 0 0 0; color: #388e3c; font-size: 12px;">
        Token obtained at: ${loginTime} | Source: Security Material (encrypted)
      </p>
    </div>

    <h2 style="font-size: 16px; color: #1f2937; margin-bottom: 12px;">Career Profile</h2>

    <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
      <tr style="background: white;">
        <td style="padding: 10px; color: #6b7280; width: 40%;">Full Name</td>
        <td style="padding: 10px; font-weight: bold;">${profile.full_name ?: 'N/A'}</td>
      </tr>
      <tr style="background: #f9f9fb;">
        <td style="padding: 10px; color: #6b7280;">Current Role</td>
        <td style="padding: 10px;">${profile.current_role ?: 'N/A'}</td>
      </tr>
      <tr style="background: white;">
        <td style="padding: 10px; color: #6b7280;">Career Goal</td>
        <td style="padding: 10px;">${profile.career_goal ?: 'N/A'}</td>
      </tr>
      <tr style="background: #f9f9fb;">
        <td style="padding: 10px; color: #6b7280;">Market Fit Score</td>
        <td style="padding: 10px; font-weight: bold; color: #6C47FF;">
          ${profile.market_fit_score ?: 0}%
        </td>
      </tr>
      <tr style="background: white;">
        <td style="padding: 10px; color: #6b7280;">Experience</td>
        <td style="padding: 10px;">${profile.experience_years ?: 0} years</td>
      </tr>
      <tr style="background: #f9f9fb;">
        <td style="padding: 10px; color: #6b7280;">Industry</td>
        <td style="padding: 10px;">${profile.industry ?: 'N/A'}</td>
      </tr>
    </table>

    <div style="background: #fff3e0; border: 1px solid #ffcc80; border-radius: 8px;
                padding: 12px; margin-top: 20px;">
      <p style="margin: 0; color: #e65100; font-size: 12px;">
        This email was generated by SAP BTP Integration Suite.
        Credentials are stored in Security Material — never hardcoded.
      </p>
    </div>

    <div style="text-align: center; margin-top: 20px;">
      <a href="https://syllabrix.com/career"
         style="background: #6C47FF; color: white; padding: 12px 28px;
                border-radius: 8px; text-decoration: none; font-size: 14px;
                font-weight: bold;">
        View Full Profile
      </a>
    </div>

  </div>
</body>
</html>
"""

    message.setBody(html)
    message.setHeader("emailSubject", "Syllabrix Secure Sync — ${today}")
    return message
}
```

5. Click **OK** → **Save**

---

## STEP 10 — Add Mail Sender

1. From palette → **Call** → **External Call** → drag **Request Reply** after Groovy Script 3
2. Connect Groovy Script 3 → Request Reply (Mail)
3. Add a **Receiver** shape → Adapter Type: **Mail**

**Mail Adapter — Connection tab:**
```
Address:         smtp.gmail.com:465
Protection:      SMTPS
Authentication:  Plain User/Password
Credential Name: GmailCredentials
```

**Mail Adapter — Processing tab:**
```
From:         adarshsingh0321@gmail.com
To:           adarshsingh0321@gmail.com
Subject:      ${header.emailSubject}
Content Type: text/html
Body:         ${in.body}
```

4. Add **End Message Event** after Request Reply (Mail)
5. Click **Save**

---

## STEP 11 — Deploy and Test

1. Click **Deploy** (top right)
2. Wait ~30 seconds → check Monitor → **Manage Integration Content**
3. Status: **Started**
4. Go to Monitor → **Message Processing**
5. After 2 minutes → message should appear as **Completed**
6. Check your inbox for the Syllabrix Secure Sync email

---

# PART 5 — COMPLETE FLOW DIAGRAM

```
START TIMER (every 2 hrs)
        │
        ▼
┌─────────────────────────────────┐
│  Groovy 1: ReadCredentials      │
│  ┌─────────────────────────┐   │
│  │ Security Material        │   │
│  │ SyllabrixCredentials     │   │
│  │ user: xxx@gmail.com      │   │
│  │ pass: ●●●●●●●●●         │   │
│  └─────────────────────────┘   │
│  → body = {email, password}     │
└─────────────────────────────────┘
        │
        ▼
[POST /api/auth/login] ──── Receiver (HTTP)
        │
        ▼
┌─────────────────────────────────┐
│  Groovy 2: ExtractJWT           │
│  response → json.token          │
│  property["jwtToken"] = token   │
│  property["loginTime"] = now    │
└─────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────┐
│  Content Modifier               │
│  header[Authorization] =        │
│    ${property.jwtToken}         │
└─────────────────────────────────┘
        │
        ▼
[GET /api/career/profile] ──── Receiver1 (HTTP)
        │
        ▼
┌─────────────────────────────────┐
│  Groovy 3: BuildSummary         │
│  profile data → HTML email      │
│  shows JWT refresh confirmation │
└─────────────────────────────────┘
        │
        ▼
[Mail Sender] ──── Gmail SMTP (GmailCredentials)
        │
        ▼
       END
```

---

# PART 6 — HOW THIS DIFFERS FROM S01 AND S02

| | S01 / S02 | S03 |
|---|---|---|
| JWT token | Hardcoded in Content Modifier | Auto-refreshed from Security Material |
| Token expires | iFlow fails, manual fix needed | Never fails — fresh token every run |
| Credentials visible | Yes — anyone with iFlow access | No — encrypted in Security Material |
| Password change | Update every iFlow | Update Security Material once |
| Security audit | Fails | Passes |
| Production ready | No | Yes |

---

# PART 7 — COMMON ERRORS AND FIXES

| Error | Cause | Fix |
|---|---|---|
| `NullPointerException` in ReadCredentials | Security Material name wrong or not deployed | Check exact name matches `SyllabrixCredentials` in Monitor → Security Material |
| `JWT extraction failed` | Login API returned 401 or error | Verify credentials in Security Material are correct |
| `SecureStoreService not available` | Script running in wrong runtime | Ensure iFlow is deployed on Cloud Integration runtime |
| `Empty response from login` | Render free tier sleeping | Hit the API once in Postman to wake it up, then redeploy |
| `401` on /api/career/profile | JWT not set in Authorization header | Check Content Modifier Source Type is `Expression` not `Constant` |
| `Expression ${property.jwtToken} is empty` | ExtractJWT script failed before this step | Check Groovy Script 2 for errors in Message Monitor |
| Mail not received | GmailCredentials expired or wrong | Regenerate Gmail App Password, update Security Material |

---

# PART 8 — SECURITY CHECKLIST

- [ ] `SyllabrixCredentials` deployed in Security Material with status OK
- [ ] No credentials hardcoded anywhere in iFlow steps
- [ ] JWT stored as Exchange Property (not Message Header)
- [ ] Authorization header set dynamically from property
- [ ] `GmailCredentials` stored in Security Material (not hardcoded in Mail adapter)
- [ ] Log Level set to Error in production (not Trace)
- [ ] iFlow deployed with status Started
- [ ] Email received confirming JWT auto-refresh

---

# PART 9 — INTERVIEW Q&A

---

**Q: What is Security Material in SAP CPI and what types exist?**

A: Security Material is CPI's encrypted vault for storing sensitive data — credentials, keys, and certificates. Types include:
- **User Credentials** — username + password (e.g., SMTP, API logins)
- **Secure Parameter** — single encrypted string (e.g., API keys)
- **OAuth2 Client Credentials** — for OAuth2 flows with client ID + secret
- **PGP Key** — for payload encryption/decryption
- **Keystore** — X.509 certificates for mutual TLS

Never hardcode credentials in iFlow steps. Always use Security Material.

---

**Q: How do you access Security Material from a Groovy script in CPI?**

A: Using the `SecureStoreService` API:
```groovy
import com.sap.it.api.securestore.SecureStoreService
import com.sap.it.api.ITApiFactory

def service = ITApiFactory.getApi(SecureStoreService.class, null)
def cred = service.getUserCredential("CredentialName")
def user = cred.getUsername()
def pass = new String(cred.getPassword()) // char[] → String
```
The password returns as `char[]` for security — convert to String explicitly.

---

**Q: What is the difference between a Message Header and an Exchange Property in CPI?**

A: 
- **Message Header** — travels with the message and CAN be forwarded to external systems as HTTP headers. Visible to receivers.
- **Exchange Property** — stays internal to the iFlow. Never forwarded externally. Used for storing intermediate values like JWT tokens, counters, saved API responses.

For a JWT token: store it as an Exchange Property (internal), then copy to Message Header only when needed for an outbound HTTP call.

---

**Q: Why is hardcoding credentials in a Content Modifier a security risk?**

A: Three reasons:
1. **Visibility** — any developer who opens the iFlow can see the password
2. **Audit failure** — security audits require credentials to be in an access-controlled vault
3. **Rotation nightmare** — if the password changes, every iFlow using it must be manually updated and redeployed

Security Material solves all three — credentials are encrypted, access-controlled, and updating them requires no iFlow changes.

---

**Q: What happens in this iFlow if the Syllabrix password changes?**

A: Only the Security Material (`SyllabrixCredentials`) needs to be updated in Monitor → Security Material → edit the entry → change password → Deploy. No iFlow changes, no redeployment needed. The next timer run will automatically use the new credentials.

---

**Q: What is the difference between Secure Parameter and User Credentials in Security Material?**

A:
- **User Credentials** — stores a username + password pair. Used for system logins (SMTP, APIs that use username/password auth).
- **Secure Parameter** — stores a single encrypted string. Used for API keys, tokens, or any single secret value.

In Groovy: `getUserCredential("name")` for User Credentials, `getSecureParameter("name")` for Secure Parameter.

---

**Q: How do you handle the case where the Security Material doesn't exist?**

A: Validate in the Groovy script:
```groovy
def cred = service.getUserCredential("SyllabrixCredentials")
if (cred == null) {
    throw new Exception("Security Material 'SyllabrixCredentials' not found")
}
```
This throws a clear exception that appears in Message Monitor instead of a confusing NullPointerException.

---

**Q: In this S03 iFlow, where exactly is the JWT token at each stage?**

A:
1. After **ReadCredentials.groovy** → JWT doesn't exist yet. Login body is in message body.
2. After **Request Reply 1 (login)** → JWT is in the message body (as JSON response).
3. After **ExtractJWT.groovy** → JWT is in Exchange Property `jwtToken`. Message body is still the login response.
4. After **Content Modifier** → JWT is in Message Header `Authorization`. Also still in Exchange Property.
5. After **Request Reply 2 (profile)** → JWT is still in Exchange Property. Message body is now the profile response.

---

# PART 10 — QUICK REFERENCE CARD

```
┌─────────────────────────────────────────────────────────────┐
│              S03 — SECURE JWT AUTO-REFRESH                  │
├─────────────────────────────────────────────────────────────┤
│  Security Material:                                         │
│    Name: SyllabrixCredentials                               │
│    Type: User Credentials                                   │
│    Path: Monitor → Manage Security → Security Material      │
│                                                             │
│  Groovy 1 (ReadCredentials):                                │
│    ITApiFactory.getApi(SecureStoreService.class, null)      │
│    .getUserCredential("SyllabrixCredentials")               │
│                                                             │
│  Groovy 2 (ExtractJWT):                                     │
│    json.token → property["jwtToken"] = "Bearer " + token   │
│                                                             │
│  Content Modifier:                                          │
│    Name: Authorization                                      │
│    Source Type: Expression                                  │
│    Value: ${property.jwtToken}                              │
│                                                             │
│  Login Endpoint:                                            │
│    POST https://syllabrix-api.onrender.com/api/auth/login   │
│    Body: {"email":"...","password":"..."}                   │
│    Timeout: 90000ms (Render free tier cold start)           │
│                                                             │
│  Profile Endpoint:                                          │
│    GET https://syllabrix-api.onrender.com/api/career/profile│
│    Header: Authorization: Bearer {fresh-token}              │
│                                                             │
│  Key Rule: NEVER hardcode credentials in iFlow steps.       │
│            ALWAYS use Security Material.                    │
└─────────────────────────────────────────────────────────────┘
```

---

**Previous:** [Scenario 02 →](KT-SCENARIO-02-COMPLETE.md) Career Profile Sync to SuccessFactors

**Next:** Scenario 04 → PGP Encrypted Data Transfer (GDPR Compliant)
