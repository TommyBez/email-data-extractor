import { responseSchema } from '@/lib/schema'
import { openai } from '@ai-sdk/openai'
import { streamObject } from 'ai'

const getPrompt = (context: string) => `You are an AI assistant that extracts structured information from emails requesting quotes (RFQ).
Your task is to analyze the email content and extract specific fields into a JSON format.

Rules:
1. Extract all possible fields, even if some are empty
2. For dates, use the format dd/mm/yyyy
3. If scadenza (deadline) is not specified, calculate it as request date + 15 working days
4. Always include "Acquisto PCB" and "Acquisto Kit" in services unless explicitly excluded
5. Services inherit the main quantity if not specified
6. Validate all numeric values
7. Generate concise but complete notes

Output the data in this exact JSON structure:
{
  "oggetto": string,
  "richiedente": string,
  "cliente": string,
  "quantita": number,
  "codice_prodotto": string,
  "data_richiesta": string,
  "data_scadenza": string,
  "note": string,
  "servizi": [
    {
      "nome": string,
      "quantita": number,
      "note": string (optional)
    }
  ]

  The email content is:
  ${context}
}`

export async function POST(req: Request) {
  const context = await req.json()

  console.log(context)

  const result = streamObject({
    model: openai('gpt-4o'),
    schema: responseSchema,
    prompt: getPrompt(context),
  })

  console.log(result)

  return result.toTextStreamResponse()
} 