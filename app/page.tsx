'use client'

import { useState } from 'react'
import { experimental_useObject as useObject } from '@ai-sdk/react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { responseSchema } from '@/lib/schema'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

interface AISettings {
  model: 'gpt-4o' | 'gpt-4' | 'gpt-3.5-turbo' | 'gpt-4o-mini'
  temperature: number
}

export default function Home() {
  const [emailContent, setEmailContent] = useState('')
  const [settings, setSettings] = useState<AISettings>({
    model: 'gpt-4o',
    temperature: 0.7
  })

  const { object, isLoading, submit } = useObject({
    api: '/api/extract',
    schema: responseSchema,
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
      submit({
        content: emailContent,
        settings
      })
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
        <div className="space-y-4">
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

          <Card className="p-6 space-y-6">
            <h2 className="text-xl font-semibold">AI Settings</h2>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Model</Label>
                <Select
                  value={settings.model}
                  onValueChange={(value) => setSettings(prev => ({ ...prev, model: value as 'gpt-4o' | 'gpt-4' }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                    <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
                    <SelectItem value="gpt-4">GPT-4</SelectItem>
                    <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Temperature</Label>
                  <span className="text-sm text-muted-foreground">
                    {settings.temperature}
                  </span>
                </div>
                <Slider
                  value={[settings.temperature]}
                  min={0}
                  max={2}
                  step={0.1}
                  onValueChange={([value]) => 
                    setSettings(prev => ({ ...prev, temperature: value }))
                  }
                />
                <p className="text-sm text-muted-foreground">
                  Controls randomness: 0 is focused, 2 is more creative
                </p>
              </div>
            </div>
          </Card>
        </div>

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
