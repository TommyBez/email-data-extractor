import { z } from "zod";

export const responseSchema = z.object({
    oggetto: z.string(),
    richiedente: z.string(),
    cliente: z.string(),
    quantita: z.number(),
    codice_prodotto: z.string(),
    data_richiesta: z.string(),
    data_scadenza: z.string(),
    note: z.string(),
    servizi: z.array(z.object({
      nome: z.string(),
      quantita: z.number(),
      note: z.string().optional()
    }))
  })