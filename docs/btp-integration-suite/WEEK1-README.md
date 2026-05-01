# Week 1 — Foundation Patterns
## SAP BTP Integration Suite | Syllabrix Case Study

---

## Your BTP Tenant Setup Checklist (Do This First)

```
BTP Trial → Subaccount → Integration Suite → Activate
  ✅ Cloud Integration (CPI)     — main iFlow builder
  ✅ API Management               — Scenario 12
  ✅ Integration Advisor          — Scenario 15
```

### One-time Security Material Setup
Create these in Monitor → Manage Security → Security Material:

| Name | Type | Used In |
|---|---|---|
| `SyllabrixJWT` | User Credentials → paste JWT as password | S01-S05 |
| `GmailCredentials` | User Credentials → Gmail App Password | S01 |
| `SFTPCloud` | User Credentials → SFTP password | S05 |

### Get Syllabrix JWT Once
```bash
curl -X POST https://syllabrix-api.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"YOUR_EMAIL","password":"YOUR_PASSWORD"}'
```
Copy `data.token` → store in `SyllabrixJWT` Security Material.

---

## Week 1 Schedule

| Day | Scenario | Time Estimate | Tools Needed |
|---|---|---|---|
| 1–2 | [S01 — Timer + Email](WEEK1-SCENARIO-01.md) | 3–4 hrs | Gmail App Password |
| 3–4 | [S02 — Profile → SF Mapping](WEEK1-SCENARIO-02.md) | 4–5 hrs | webhook.site |
| 5   | [S03 — Content-Based Router](WEEK1-SCENARIO-03.md) | 2–3 hrs | webhook.site (x3) + Slack |
| 6   | [S04 — SOAP → REST](WEEK1-SCENARIO-04.md) | 4–5 hrs | SoapUI (free download) |
| 7   | [S05 — SFTP CSV Splitter](WEEK1-SCENARIO-05.md) | 4–5 hrs | sftpcloud.io + FileZilla |

---

## Key Concepts Mastered in Week 1

```
ADAPTERS:         HTTP Sender, HTTP Receiver, SOAP, SFTP, Mail
TRANSFORMATION:   Groovy Script, Message Mapping, XSLT, CSV-to-XML
ROUTING:          Content-Based Router, Exchange Properties
SPLITTING:        General Splitter, Grouping, Sequential/Parallel
PERSISTENCE:      Data Store Write, Security Material
MONITORING:       Message Trace, Message Monitor, Endpoints
SECURITY:         User Credentials, Bearer Token, Basic Auth
TESTING:          webhook.site, SoapUI, curl, FileZilla
```

---

## Debugging Workflow (Use Every Time)

```
1. Deploy iFlow
2. Monitor → All Integration Flows → check status = Started
3. Trigger the iFlow (Timer fires / curl / SoapUI)
4. Monitor → Message Monitor → look for your message
5. If failed → click message → Error Details tab
6. If unclear → set Log Level = Trace → redeploy → retry → inspect each step
7. Fix issue → redeploy → retest
8. When working → set Log Level = Error
```

---

## Common BTP Trial Limits to Know

| Resource | Trial Limit |
|---|---|
| iFlows deployed | 2 simultaneously |
| Message processing | Limited per month |
| Data Store retention | 90 days max |
| SFTP connections | Depends on CPI runtime |
| API Management APIs | 5 in trial |

> **Tip:** Undeploy iFlows you're not using to stay under the 2-iFlow limit.

---

## Interview Quick Reference — Week 1 Concepts

| Question | Answer (1 line) |
|---|---|
| Timer vs Message Start? | Timer = scheduled/autonomous; Message = waits for inbound event |
| Groovy vs XSLT? | Groovy = logic+loops; XSLT = pure XML-to-XML declarative |
| Header vs Exchange Property? | Headers forwarded externally; Properties internal only |
| Router vs Multicast? | Router = one matching branch; Multicast = all branches |
| SOAP Sender = ? | Exposes iFlow as SOAP/WSDL endpoint |
| HTTP Sender = ? | Exposes iFlow as REST HTTPS endpoint |
| Splitter purpose? | Splits one large message into N individual messages |
| Data Store used for? | Persistence: DLQ, idempotency, audit log, buffering |
| How to debug step-by-step? | Enable Trace log level, check Message Monitor |
| Where to store passwords? | Security Material (never hardcode in iFlow) |
