# Scenario 04 — SOAP to REST Protocol Conversion
## Week 1 | Day 6 | Difficulty: ★★☆

---

## What You Will Build

An iFlow that exposes a **SOAP endpoint** (like SAP ECC would call), receives an XML payload about training completion, converts it to JSON using XSLT, and POSTs it to Syllabrix as a learning path generation request.

```
[SOAP Client / Postman]
    ↓ SOAP Envelope (XML)
[SOAP Sender Adapter] → /ws/training-complete
    ↓
[XSLT Mapping] → SOAP XML → Syllabrix JSON
    ↓
[Content Modifier] → Set Authorization header
    ↓
[HTTP POST] → Syllabrix /api/career/learning/generate
    ↓
[XSLT Mapping] → Syllabrix JSON response → SOAP Response XML
    ↓
[SOAP Response] → Back to caller
```

**Skills learned:** SOAP Sender Adapter, XSLT transformation, XML-JSON conversion, synchronous request-reply pattern, WSDL

---

## Pre-Requisites

### 1. Install SoapUI (Free)
- Download from: **soapui.org/downloads/soapui**
- This is the industry standard SOAP testing tool — every SAP consultant uses it

### 2. Create WSDL File Locally
WSDL defines the SOAP contract. Create a file `TrainingComplete.wsdl` on your desktop:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="http://schemas.xmlsoap.org/wsdl/"
             xmlns:soap="http://schemas.xmlsoap.org/wsdl/soap/"
             xmlns:tns="http://syllabrix.com/training"
             xmlns:xsd="http://www.w3.org/2001/XMLSchema"
             targetNamespace="http://syllabrix.com/training"
             name="TrainingCompleteService">

  <types>
    <xsd:schema targetNamespace="http://syllabrix.com/training">
      <xsd:element name="TrainingCompleteRequest">
        <xsd:complexType>
          <xsd:sequence>
            <xsd:element name="EmployeeId"      type="xsd:string"/>
            <xsd:element name="SkillName"        type="xsd:string"/>
            <xsd:element name="CompletionDate"   type="xsd:string"/>
            <xsd:element name="Score"            type="xsd:integer"/>
            <xsd:element name="TotalDays"        type="xsd:integer"/>
            <xsd:element name="Difficulty"       type="xsd:string"/>
          </xsd:sequence>
        </xsd:complexType>
      </xsd:element>
      <xsd:element name="TrainingCompleteResponse">
        <xsd:complexType>
          <xsd:sequence>
            <xsd:element name="Status"     type="xsd:string"/>
            <xsd:element name="Message"    type="xsd:string"/>
            <xsd:element name="PathId"     type="xsd:string"/>
            <xsd:element name="Timestamp"  type="xsd:string"/>
          </xsd:sequence>
        </xsd:complexType>
      </xsd:element>
    </xsd:schema>
  </types>

  <message name="TrainingCompleteInput">
    <part name="parameters" element="tns:TrainingCompleteRequest"/>
  </message>
  <message name="TrainingCompleteOutput">
    <part name="parameters" element="tns:TrainingCompleteResponse"/>
  </message>

  <portType name="TrainingCompletePortType">
    <operation name="TrainingComplete">
      <input message="tns:TrainingCompleteInput"/>
      <output message="tns:TrainingCompleteOutput"/>
    </operation>
  </portType>

  <binding name="TrainingCompleteBinding" type="tns:TrainingCompletePortType">
    <soap:binding style="document" transport="http://schemas.xmlsoap.org/soap/http"/>
    <operation name="TrainingComplete">
      <soap:operation soapAction="TrainingComplete"/>
      <input><soap:body use="literal"/></input>
      <output><soap:body use="literal"/></output>
    </operation>
  </binding>

  <service name="TrainingCompleteService">
    <port name="TrainingCompletePort" binding="tns:TrainingCompleteBinding">
      <soap:address location="WILL_BE_REPLACED_BY_CPI"/>
    </port>
  </service>
</definitions>
```

---

## Step-by-Step: Create the iFlow

### STEP 1 — New iFlow

1. Package → **Add** → **Integration Flow**
2. Name: `S04 - SOAP Training Complete to REST Syllabrix`
3. Open designer

---

### STEP 2 — SOAP Sender Adapter

1. Start event → add Sender → Adapter Type: **SOAP**

**SOAP Adapter — Connection tab:**
```
Address:    /training-complete
Service:    TrainingCompleteService
Endpoint:   TrainingCompletePort
URL to WSDL: (upload your WSDL file)
```

**Upload WSDL:**
- Click the folder icon next to "URL to WSDL"
- Upload your `TrainingComplete.wsdl` file
- Select Operation: `TrainingComplete`

2. Click **Save**

> The iFlow is now a SOAP service. Any SOAP client can call it.

---

### STEP 3 — Create XSLT: SOAP Request → JSON

1. We need to upload an XSLT file as a resource.
2. In the iFlow designer → **Resources** tab (top right of canvas) → **Add** → **XSLT Stylesheet**
3. Name: `SoapToSyllabrix.xsl`
4. Content:

```xsl
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:tns="http://syllabrix.com/training">
  
  <xsl:output method="text" media-type="application/json" encoding="UTF-8"/>
  
  <xsl:template match="/">
    <xsl:variable name="skill"       select="//tns:SkillName/text()"/>
    <xsl:variable name="totalDays"   select="//tns:TotalDays/text()"/>
    <xsl:variable name="difficulty"  select="//tns:Difficulty/text()"/>
    <xsl:variable name="score"       select="//tns:Score/text()"/>
{
  "skill_name": "<xsl:value-of select="$skill"/>",
  "total_days": <xsl:value-of select="if ($totalDays != '') then $totalDays else 30"/>,
  "difficulty": "<xsl:value-of select="if ($difficulty != '') then $difficulty else 'intermediate'"/>",
  "source": "SAP_ECC",
  "score": <xsl:value-of select="if ($score != '') then $score else 0"/>
}
  </xsl:template>
</xsl:stylesheet>
```

5. Click **Save**

---

### STEP 4 — Add XSLT Mapping Step

1. Drag **XSLT Mapping** step (under Message Transformers) onto canvas
2. Connect Start → XSLT Mapping
3. Click the XSLT Mapping step → **Processing** tab:
   ```
   XSLT Stylesheet: SoapToSyllabrix.xsl  (select from resources)
   Output Encoding: UTF-8
   ```

---

### STEP 5 — Content Modifier: Set Headers for REST Call

1. Drag **Content Modifier** → connect XSLT → Content Modifier
2. **Message Header** tab:
   ```
   Name: Authorization    Value: Bearer YOUR_JWT_TOKEN
   Name: Content-Type     Value: application/json
   ```

---

### STEP 6 — Call Syllabrix REST API

1. **Request Reply** → connect Content Modifier → Request Reply
2. Add Receiver → HTTP Adapter:
   ```
   URL:    https://syllabrix-api.up.railway.app/api/career/learning/generate
   Method: POST
   ```
3. Request Headers to forward: `Authorization,Content-Type`

---

### STEP 7 — Create XSLT: JSON Response → SOAP Response

1. Add another XSLT resource:
2. **Resources** → **Add** → **XSLT Stylesheet** → Name: `SyllabrixToSoapResponse.xsl`

```xsl
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:tns="http://syllabrix.com/training">
  
  <xsl:output method="xml" indent="yes"/>
  
  <xsl:template match="/">
    <!-- Parse JSON response — CPI provides it as text, we extract values -->
    <xsl:variable name="body" select="string(.)"/>
    <tns:TrainingCompleteResponse>
      <tns:Status>SUCCESS</tns:Status>
      <tns:Message>Learning path generated in Syllabrix</tns:Message>
      <tns:PathId>AUTO_GENERATED</tns:PathId>
      <tns:Timestamp><xsl:value-of select="current-dateTime()"/></tns:Timestamp>
    </tns:TrainingCompleteResponse>
  </xsl:template>
</xsl:stylesheet>
```

> **Note:** For the response XSLT, since JSON-to-XML is complex in XSLT 2.0, we use a Groovy script instead (next step). The XSLT here shows the concept — in practice use Groovy for JSON parsing.

---

### STEP 7 (Alternative) — Groovy: Build SOAP Response

Replace the response XSLT with a Groovy Script (easier for JSON parsing):

```groovy
import com.sap.gateway.ip.core.customdev.util.Message
import groovy.json.JsonSlurper

def Message processData(Message message) {
    def body = message.getBody(String.class)
    def json
    def pathId = "UNKNOWN"
    def status = "SUCCESS"
    
    try {
        json = new JsonSlurper().parseText(body)
        pathId = json?.data?.id?.toString() ?: "NEW"
    } catch (Exception e) {
        status = "PARTIAL"
    }
    
    def timestamp = new Date().format("yyyy-MM-dd'T'HH:mm:ss'Z'")
    
    def soapResponse = """<?xml version="1.0" encoding="UTF-8"?>
<tns:TrainingCompleteResponse xmlns:tns="http://syllabrix.com/training">
  <tns:Status>${status}</tns:Status>
  <tns:Message>Learning path created in Syllabrix successfully</tns:Message>
  <tns:PathId>${pathId}</tns:PathId>
  <tns:Timestamp>${timestamp}</tns:Timestamp>
</tns:TrainingCompleteResponse>"""
    
    message.setBody(soapResponse)
    message.setHeader("Content-Type", "text/xml; charset=UTF-8")
    return message
}
```

---

### STEP 8 — Deploy

1. Connect: Request Reply → Groovy Script → End Message
2. Click **Save** → **Deploy**

---

### STEP 9 — Test with SoapUI

#### Load WSDL in SoapUI
1. Open SoapUI → **File** → **New SOAP Project**
2. Project Name: `Syllabrix Training Complete`
3. Initial WSDL: Upload/paste your WSDL path
4. Click **OK** — SoapUI auto-generates test requests

#### Update the SOAP Endpoint URL
1. In SoapUI → expand your project → **TrainingCompleteBinding** → right-click → **Show Interface Viewer**
2. Change endpoint to your CPI SOAP URL:
   `https://YOUR-TENANT.it-cpi.cfapps.region.hana.ondemand.com/ws/training-complete`

#### Add Basic Auth in SoapUI
1. Double-click the **TrainingComplete** request
2. At bottom → **Auth** tab → Add New Authorization → **Basic**
3. Username: BTP email, Password: BTP password

#### Send Test Request
```xml
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                  xmlns:tns="http://syllabrix.com/training">
   <soapenv:Header/>
   <soapenv:Body>
      <tns:TrainingCompleteRequest>
         <tns:EmployeeId>E001</tns:EmployeeId>
         <tns:SkillName>SAP BTP Integration Suite</tns:SkillName>
         <tns:CompletionDate>2026-04-12</tns:CompletionDate>
         <tns:Score>87</tns:Score>
         <tns:TotalDays>30</tns:TotalDays>
         <tns:Difficulty>intermediate</tns:Difficulty>
      </tns:TrainingCompleteRequest>
   </soapenv:Body>
</soapenv:Envelope>
```

#### Expected SOAP Response
```xml
<tns:TrainingCompleteResponse xmlns:tns="http://syllabrix.com/training">
  <tns:Status>SUCCESS</tns:Status>
  <tns:Message>Learning path created in Syllabrix successfully</tns:Message>
  <tns:PathId>5</tns:PathId>
  <tns:Timestamp>2026-04-12T10:30:00Z</tns:Timestamp>
</tns:TrainingCompleteResponse>
```

---

### Protocol Conversion Concepts

**Why Protocol Conversion matters in SAP projects:**
- SAP ECC/S4 uses RFC/BAPI → SOAP
- Modern systems (Salesforce, Syllabrix) use REST
- CPI is the bridge — it speaks both

**Conversion Matrix:**
| From | To | CPI Mechanism |
|---|---|---|
| SOAP XML | REST JSON | XSLT or Groovy |
| REST JSON | SOAP XML | Groovy or XSLT |
| RFC/BAPI | REST | RFC Adapter → HTTP Adapter |
| IDoc (flat) | JSON | IDoc Adapter → Groovy |
| EDIFACT | XML | EDI Splitter → XSLT |
| CSV | JSON | CSV-to-XML → Message Mapping |

---

### Common Errors & Fixes

| Error | Cause | Fix |
|---|---|---|
| `WSDL not found` | Wrong path/URL | Upload WSDL as iFlow resource |
| `SOAPFault: No service found` | Wrong SOAP address | Check address field matches `/ws/training-complete` |
| `XSLT: namespace prefix not found` | Missing xmlns declaration | Add namespace to `xsl:stylesheet` element |
| `Empty JSON output from XSLT` | XSLT outputs XML, not JSON | Set `<xsl:output method="text"/>` for JSON output |
| `401 from Syllabrix` | JWT expired | Refresh token, update in Content Modifier |

---

### Checklist

- [ ] WSDL created and uploaded to iFlow resources
- [ ] SOAP endpoint deployed and visible in Monitor
- [ ] SoapUI test sends request successfully
- [ ] Syllabrix creates a new learning path
- [ ] SOAP response returned with PathId from Syllabrix
- [ ] Groovy response builder generates valid XML

---

### Interview Q&A for Scenario 04

**Q: What is WSDL and what does it define?**  
A: Web Services Description Language. It defines the contract for a SOAP service: what operations exist, what input/output messages look like (XSD types), what protocol/transport to use, and where the endpoint is. Think of it as a Swagger/OpenAPI spec but for SOAP.

**Q: What is the difference between SOAP document style and RPC style?**  
A: Document style: message body contains an XML document (defined in WSDL types section). RPC style: message wraps parameters like a function call. SAP uses document/literal for most web services. Document style is more flexible and WS-I compliant.

**Q: When would you choose XSLT over Groovy for transformation?**  
A: XSLT: pure XML-to-XML transformations, stateless, fast, declarative. Groovy: complex logic, conditionals, loops, JSON parsing, calling Java libraries, external HTTP calls within the transformation. XSLT is more performant for large XML; Groovy is more powerful but slower.

**Q: What is a synchronous iFlow vs asynchronous?**  
A: Synchronous: caller waits for a response (request-reply). The iFlow must return a message to the caller. Used with SOAP, HTTP where the client waits. Asynchronous: fire-and-forget. Caller doesn't wait. Used with Event Mesh, SFTP, Timer. In CPI, synchronous iFlows must end with a response step, not just End Message.

---

**Next:** [Scenario 05 →](WEEK1-SCENARIO-05.md) Bulk Enrollment via SFTP CSV + Splitter
