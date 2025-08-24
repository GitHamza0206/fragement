'use client'

import { useState } from 'react'
import { useChat } from '@ai-sdk/react'
import { DynamicClarificationForm } from '@/components/clarification-form'
import { PlanView } from '@/components/plan-view'

export default function ChatPage() {
  const [input, setInput] = useState('')

  const { messages, sendMessage } = useChat({
    api: '/api/chat',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
    sendMessage({ text: input })
    setInput('')
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      {messages.map((message) => (
        <div key={message.id} className="space-y-2">
          <div className="text-xs text-muted-foreground">
            {message.role === 'user' ? 'User:' : 'AI:'}
          </div>
          <div className="space-y-2">
            {message.parts.map((part, index) => {
              if (part.type === 'text') {
                return (
                  <div key={index} className="text-foreground">
                    {part.text}
                  </div>
                )
              }

              // need_clarification tool UI
              if (part.type === 'tool-need_clarification') {
                switch (part.state) {
                  case 'input-available':
                    return (
                      <div key={index} className="text-sm text-muted-foreground">
                        Preparing clarification form...
                      </div>
                    )
                  case 'output-available': {
                    const form = part.output
                    return (
                      <DynamicClarificationForm
                        key={index}
                        form={form}
                        visible={true}
                        isLoading={false}
                        onSubmit={(answers) => {
                          // Send the answers back as a user message; the server will continue
                          const asText = `Clarification answers: ${JSON.stringify(answers)}`
                          sendMessage({ text: asText })
                        }}
                        onCancel={() => {}}
                      />
                    )
                  }
                  case 'output-error':
                    return (
                      <div key={index} className="text-sm text-red-600">
                        Error: {part.errorText}
                      </div>
                    )
                }
              }

              // generate_plan tool UI
              if (part.type === 'tool-generate_plan') {
                switch (part.state) {
                  case 'input-available':
                    return (
                      <div key={index} className="text-sm text-muted-foreground">
                        Generating learning plan...
                      </div>
                    )
                  case 'output-available': {
                    const { title, description, plan } = part.output || {}
                    return (
                      <PlanView
                        key={index}
                        title={title}
                        description={description}
                        plan={plan}
                      />
                    )
                  }
                  case 'output-error':
                    return (
                      <div key={index} className="text-sm text-red-600">
                        Error: {part.errorText}
                      </div>
                    )
                }
              }

              return null
            })}
          </div>
        </div>
      ))}

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          className="flex-1 border rounded px-3 py-2 bg-background text-foreground"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
        />
        <button type="submit" className="px-4 py-2 rounded bg-primary text-primary-foreground">
          Send
        </button>
      </form>
    </div>
  )
}

