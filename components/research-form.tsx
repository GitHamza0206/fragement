'use client'

import { useState } from 'react'
import type { ConductResearch } from '@/lib/schema'

interface ResearchFormProps {
  input: ConductResearch
  toolCallId: string
  addToolResult: (result: {
    tool: string
    toolCallId: string
    output: any
  }) => void
}

export const ResearchForm = ({ input, toolCallId, addToolResult }: ResearchFormProps) => {
  const [topic, setTopic] = useState(input.topic || '')
  const isValid = topic.trim().length > 0

  return (
    <div className="mx-4 mb-2 rounded-2xl border border-primary/20 bg-accent/30 dark:bg-white/5 text-accent-foreground dark:text-muted-foreground ring-1 ring-primary/10 shadow-sm">
      <div className="px-3 pt-3 pb-2">
        <div className="font-medium text-sm">Deep Research</div>
        <div className="text-xs text-muted-foreground mt-0.5">
          Conduct deep research on the topic to draft a detailed course outline.
        </div>
      </div>

      <div className="px-3 pb-3 space-y-3">
        <div className="space-y-1">
          <label className="text-sm font-medium text-foreground">Topic</label>
          <input
            type="text"
            className="text-normal px-3 py-2 bg-white/90 dark:bg-white/5 border w-full outline-none rounded-lg text-foreground placeholder:text-muted-foreground"
            placeholder="Enter research topic..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
        </div>

        <div className="flex gap-2 justify-end pt-2">
          <button
            type="button"
            className="px-3 py-1.5 rounded-lg text-sm bg-primary/90 text-primary-foreground hover:bg-primary disabled:opacity-60"
            disabled={!isValid}
            onClick={() => {
              addToolResult({
                tool: 'conduct_research',
                toolCallId,
                output: { topic: topic.trim() },
              })
            }}
          >
            Submit Research
          </button>
        </div>
      </div>
    </div>
  )
}