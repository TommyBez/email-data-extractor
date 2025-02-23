import { responseSchema } from '@/lib/schema'
import { openai } from '@ai-sdk/openai'
import { streamObject } from 'ai'

const getPrompt = (context: string) => `
# **Enhanced Prompt: RFQ Extraction from Emails**

## **Objective**
Analyze an email message and extract all **Requests for Quotation (RFQ)** in a structured JSON format.  
The extracted data should always follow the **same schema**, regardless of variations in the text.

## **JSON Structure Requirements**
- The JSON format **must remain consistent** across all extracted RFQs.
- Each RFQ **must be compatible** with the internal RFQ system.
- If multiple quantities are requested in the email (e.g., 30 and 170 pieces), they **must be treated as separate objects**, not as an array within one object.

---

## **Extraction Rules**

### **Primary Fields**
1. **\`oggetto\`** (Subject)  
   - Extracted from the email subject line.  
   - If the email is forwarded, use the most relevant text as the subject.

2. **\`richiedente\`** (Requester)  
   - The email address of the sender.  
   - If the email is forwarded, extract the actual requester from the email body.

3. **\`cliente\`** (Customer)  
   - Extracted from the email content or inferred from the domain of the requester's email.  
   - **Ignore** "EES" as a customer and find the real customer name.

4. **\`quantità\`** (Quantity)  
   - If multiple quantities are mentioned, generate **separate RFQs** for each, instead of using an array.

5. **\`codice_prodotto\`** (Product Code)  
   - Identify the requested product, extracted from either the subject line or email body.

6. **\`data_richiesta\`** (Request Date)  
   - The email's **received date**, formatted as **DD/MM/YYYY**.

7. **\`data_scadenza\`** (Deadline Date)  
   - If specified in the email, extract the requested delivery date.  
   - If not provided, set the deadline **15 business days** from the request date.

8. **\`note\`** (Notes)  
   - A **detailed summary** of the email, including key information such as:
     - Technical specifications
     - Delivery requirements
     - Any additional relevant details  
   - **Must always be present**.

---

## **Service Requests (\`servizi\`)**
If the email mentions service requests, generate an array of objects with the following fields:

- **\`nome\`**: The service name (e.g., PCB Fabrication, PCBA Assembly, Coating, Testing, Boundary Scan, Design, BOM Quotation).  
- **\`quantità\`**: The quantity of the requested service (if not specified, inherit from the main request).  
- **\`note\`**: Any additional details.

### **Default Service Assumptions**
- If unspecified, **"Acquisto PCB"** (PCB Purchase) and **"Acquisto Kit"** (Kit Purchase) should **always** be included—unless the BOM or kit is explicitly declared as customer-supplied.

---

## **Data Accuracy & Validation Rules**
:white_check_mark: **Unclear or incomplete emails** → Include a field **\`richieste_per_cliente\`** with **formal questions** to clarify missing details.  
:white_check_mark: **Attachments mentioned?** → Add a note: \`"File allegato presente in email"\`.  
:white_check_mark: **Multiple product variations?** → Create **separate RFQ objects** for each product variation.  

---

## **Example Output JSON**

### **Example 1 - Standard RFQ**
**Email Example:**  
> _Subject:_ "Richiesta di quotazione - Assemblaggio PCBA e collaudo"  
> _From:_ luca.rossi@automotive-tech.com  
> _Body:_ "Buongiorno, siamo interessati a ricevere un preventivo per l'assemblaggio di 500 unità della scheda di controllo motore modello XZ-5000. Allego BOM e file Gerber. Consegna desiderata entro il 15/06/2025."  

\`\`\`json
[
  {
    "oggetto": "Richiesta di quotazione - Assemblaggio PCBA e collaudo",
    "richiedente": "luca.rossi@automotive-tech.com",
    "cliente": "Automotive Tech",
    "quantità": 500,
    "codice_prodotto": "XZ-5000",
    "data_richiesta": "15/02/2025",
    "data_scadenza": "15/06/2025",
    "note": "Richiesta di preventivo per assemblaggio di 500 unità della scheda XZ-5000. Allegata BOM e file Gerber.",
    "servizi": [
      {
        "nome": "Acquisto PCB",
        "quantità": 500
      },
      {
        "nome": "Assemblaggio PCBA",
        "quantità": 500
      },
      {
        "nome": "Collaudo",
        "quantità": 500,
        "note": "Test funzionale con protocollo IPC-610 classe 2"
      },
      {
        "nome": "Acquisto Kit",
        "quantità": 500
      }
    ],
    "richieste_per_cliente": "Confermare ricezione e fornire stima costi."
  }
]
\`\`\`

  The email content is:
  ${context}
}`

interface RequestBody {
  content: string
  settings: {
    model: string
    temperature: number
  }
}

export async function POST(req: Request) {
  const { content, settings } = await req.json() as RequestBody

  const result = streamObject({
    model: openai(settings.model),
    schema: responseSchema,
    prompt: getPrompt(content),
    temperature: settings.temperature
  })

  return result.toTextStreamResponse()
} 