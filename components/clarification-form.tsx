'use client'

import { useState } from 'react'
import TextareaAutosize from 'react-textarea-autosize'
import { ClarificationForm as ClarificationFormType, ClarificationQuestion } from '@/lib/schema'
import { useActions, useUIState } from 'ai/rsc'
import type { LLMModel, LLMModelConfig } from '@/lib/models'

// New: client-side streamed form that calls the server action via useActions
export function StreamClarificationForm({
  form,
  model,
  config,
  isLoading = false,
}: {
  form: ClarificationFormType
  model: LLMModel
  config: LLMModelConfig
  isLoading?: boolean
}) {
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const { sendMessage } = useActions()
  const [_, setUIState] = useUIState()

  const renderField = (question: ClarificationQuestion) => {
    const value = answers[question.id]

    switch (question.type) {
      case 'text':
        return (
          <TextareaAutosize
            minRows={2}
            maxRows={6}
            className="text-normal px-3 py-2 resize-none ring-0 bg-white/90 dark:bg-white/5 border w-full m-0 outline-none rounded-lg text-foreground placeholder:text-muted-foreground"
            placeholder={question.placeholder || 'Enter your answer...'}
            value={value || ''}
            disabled={isLoading}
            onChange={(e) => setAnswers({ ...answers, [question.id]: e.target.value })}
          />
        )

      case 'number':
        return (
          <input
            type="number"
            className="text-normal px-3 py-2 bg-white/90 dark:bg-white/5 border w-full m-0 outline-none rounded-lg text-foreground placeholder:text-muted-foreground"
            placeholder={question.placeholder || 'Enter a number...'}
            value={value || ''}
            min={question.validation?.min}
            max={question.validation?.max}
            disabled={isLoading}
            onChange={(e) => setAnswers({ ...answers, [question.id]: e.target.value })}
          />
        )

      case 'select':
        return (
          <select
            className="text-normal px-3 py-2 bg-white/90 dark:bg-white/5 border w-full m-0 outline-none rounded-lg text-foreground"
            value={value || ''}
            disabled={isLoading}
            onChange={(e) => setAnswers({ ...answers, [question.id]: e.target.value })}
          >
            <option value="">Select an option...</option>
            {question.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        )

      case 'multiselect':
        return (
          <div className="space-y-2">
            {question.options?.map((option) => (
              <label key={option} className="flex items-center space-x-2 text-foreground">
                <input
                  type="checkbox"
                  checked={(value || []).includes(option)}
                  disabled={isLoading}
                  onChange={(e) => {
                    const current = value || []
                    if (e.target.checked) {
                      setAnswers({ ...answers, [question.id]: [...current, option] })
                    } else {
                      setAnswers({ ...answers, [question.id]: current.filter((v: string) => v !== option) })
                    }
                  }}
                />
                <span className="text-sm">{option}</span>
              </label>
            ))}
          </div>
        )

      case 'boolean':
        return (
          <label className="flex items-center space-x-2 text-foreground">
            <input
              type="checkbox"
              checked={value || false}
              disabled={isLoading}
              onChange={(e) => setAnswers({ ...answers, [question.id]: e.target.checked })}
            />
            <span className="text-sm">Yes</span>
          </label>
        )

      default:
        return null
    }
  }

  const isValid = form.questions.every(
    (q) => !q.required || (answers[q.id] !== undefined && answers[q.id] !== '' && answers[q.id] !== null)
  )

  return (
    <div className="mx-4 mb-2 rounded-2xl border border-primary/20 bg-accent/30 dark:bg-white/5 text-accent-foreground dark:text-muted-foreground ring-1 ring-primary/10 shadow-sm">
      <div className="px-3 pt-3 pb-2">
        <div className="font-medium text-sm text-foreground">
          {form.title}
        </div>
        {form.description && (
          <div className="text-xs text-muted-foreground mt-0.5">
            {form.description}
          </div>
        )}
        <div className="text-xs text-muted-foreground mt-0.5">
          {form.context}
        </div>
      </div>

      <div className="px-3 pb-3 space-y-3">
        {form.questions.map((question) => (
          <div key={question.id} className="space-y-1">
            <label className="text-sm font-medium text-foreground">
              {question.question}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {renderField(question)}
          </div>
        ))}

        <div className="flex gap-2 justify-end pt-2">
          <button
            type="button"
            className="px-3 py-1.5 rounded-lg text-sm bg-primary/90 text-primary-foreground hover:bg-primary disabled:opacity-60"
            disabled={isLoading || !isValid}
            onClick={async () => {
              const ui = await sendMessage({
                text: `Clarification answers: ${JSON.stringify(answers)}`,
                model,
                config,
              })
              setUIState((prev: any[]) => ([...(prev ?? []), ui]))
            }}
          >
            Submit Clarification
          </button>
        </div>
      </div>
    </div>
  )
}
// removed legacy ClarificationForm



