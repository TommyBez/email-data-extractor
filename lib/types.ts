export interface Service {
  nome: string
  quantita: number
  note?: string
}

export interface ExtractedData {
  oggetto: string
  richiedente: string
  cliente: string
  quantita: number
  codice_prodotto: string
  data_richiesta: string
  data_scadenza: string
  note: string
  servizi: Service[]
}

export interface ExtractionResponse {
  success: boolean
  data?: ExtractedData
  error?: string
} 