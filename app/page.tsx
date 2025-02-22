'use client'

import { useState } from 'react'
import { experimental_useObject as useObject } from '@ai-sdk/react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { ExtractedData } from '@/lib/types'
import { addDays, format } from 'date-fns'
import { responseSchema } from '@/lib/schema'

export default function Home() {
  const [emailContent, setEmailContent] = useState('')
  // const [result, setResult] = useState<ExtractedData | null>(null)

  const { object, isLoading, submit } = useObject({
    api: '/api/extract',
    schema: responseSchema,
    // onFinish: async (completion) => {
    //   try {
    //     const extractedData = JSON.parse(completion) as ExtractedData

    //     // Process dates
    //     if (!extractedData.data_scadenza && extractedData.data_richiesta) {
    //       const requestDate = new Date(extractedData.data_richiesta.split('/').reverse().join('-'))
    //       const deadlineDate = addDays(requestDate, 21) // 15 working days ≈ 21 calendar days
    //       extractedData.data_scadenza = format(deadlineDate, 'dd/MM/yyyy')
    //     }

    //     // Add default services
    //     const defaultServices = ['Acquisto PCB', 'Acquisto Kit']
    //     defaultServices.forEach(service => {
    //       if (!extractedData.servizi.some(s => s.nome === service)) {
    //         extractedData.servizi.push({
    //           nome: service,
    //           quantita: extractedData.quantita
    //         })
    //       }
    //     })

    //     setResult(extractedData)
    //     toast.success('Email processed successfully')
    //   } catch (error) {
    //     console.error('Error processing result:', error)
    //     toast.error('Failed to process the extracted data')
    //   }
    // },
    onError: (error) => {
      toast.error(error.message || 'An error occurred while processing the email')
    }
  })

  const handleSubmit = async () => {
    if (!emailContent.trim()) {
      toast.error('Please enter email content')
      return
    }

    try {
      console.log(emailContent)
      submit(emailContent)
    } catch (error: unknown) {
      console.error('Error submitting email:', error)
      toast.error('Failed to start processing')
    }
  }

  const handleClear = () => {
    setEmailContent('')
  }

  return (
    <main className="container mx-auto p-4 space-y-8">
      <h1 className="text-3xl font-bold text-center mb-8">Email Data Extractor</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-semibold">Email Content</h2>
          <Textarea
            placeholder="Paste your email content here..."
            className="min-h-[300px]"
            value={emailContent}
            onChange={(e) => setEmailContent(e.target.value)}
          />
          <div className="flex gap-2">
            <Button 
              onClick={handleSubmit} 
              disabled={isLoading || !emailContent.trim()}
            >
              {isLoading ? 'Processing...' : 'Extract Data'}
            </Button>
            <Button 
              variant="outline" 
              onClick={handleClear}
              disabled={isLoading || (!emailContent && !object)}
            >
              Clear
            </Button>
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-semibold">Extracted Data</h2>
          {object ? (
            <pre className="bg-muted p-4 rounded-lg overflow-auto max-h-[500px] text-sm">
              {JSON.stringify(object, null, 2)}
            </pre>
          ) : (
            <div className="text-center text-muted-foreground p-8">
              Processed data will appear here
            </div>
          )}
        </Card>
      </div>
    </main>
  )
}
