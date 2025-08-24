'use server'

import React, { ReactNode } from 'react'
import {
  createAI,
  createStreamableValue,
  getMutableAIState,
  streamUI,
} from 'ai/rsc'
import { CoreMessage, LanguageModel, generateId } from 'ai'
import { z } from 'zod'

import { getModelClient, LLMModel, LLMModelConfig } from '@/lib/models'
import { toPrompt } from '@/lib/prompt'
import { Templates } from '@/lib/templates'
import { clarificationFormSchema } from '@/lib/schema'
    // Note: Avoid importing client components with interactive props into RSC stream UI

function TextStreamMessage({ content }: { content: any }) {
  return (
    <div className="whitespace-pre-wrap text-sm leading-6">{content}</div>
  )
}

type UIState = Array<ReactNode>

type AIState = {
  chatId: string
  messages: Array<CoreMessage>
}

const sendMessage = async ({
  text,
  template,
  model,
  config,
}: {
  text: string
  template: Templates
  model: LLMModel
  config: LLMModelConfig
}) => {
  'use server'

  const state = getMutableAIState('messages')

  state.update([...(state.get() as CoreMessage[]), { role: 'user', content: text }])

  const contentStream = createStreamableValue('')
  const TextStream = <TextStreamMessage content={contentStream.value} />

  const lm = getModelClient(model, config) as LanguageModel

  const { value } = await streamUI({
    model: lm,
    system: toPrompt(template),
    messages: (state.get() as CoreMessage[]) ?? [],

    text: async function* ({ content, done }) {
      if (done) {
        state.done([
          ...(state.get() as CoreMessage[]),
          { role: 'assistant', content },
        ])
        contentStream.done()
      } else {
        contentStream.update(content)
      }

      return TextStream
    },

    tools: {
      renderClarificationNotice: {
        description: 'Render a non-interactive clarification notice (no event handlers)',
        parameters: z.object({
          form: clarificationFormSchema,
        }),
        generate: async function* ({ form }) {
          return (
            <div className="mx-4 mb-2 rounded-xl border bg-amber-500/10 text-amber-500">
              <div className="px-3 pt-3 pb-2">
                <div className="font-medium text-sm text-amber-600 dark:text-amber-400">
                  {form.title}
                </div>
                {form.description && (
                  <div className="text-xs text-amber-600/80 dark:text-amber-400/80 mt-0.5">
                    {form.description}
                  </div>
                )}
                <div className="text-xs text-amber-600/80 dark:text-amber-400/80 mt-0.5">
                  {form.context}
                </div>
              </div>
            </div>
          )
        },
      },
    },
  })

  return value
}

export const AI = createAI<AIState, UIState>({
  initialAIState: {
    chatId: generateId(),
    messages: [],
  },
  initialUIState: [],
  actions: {
    sendMessage,
  },
})

export type AIActions = {
  sendMessage: (args: {
    text: string
    template: Templates
    model: LLMModel
    config: LLMModelConfig
  }) => Promise<any>
}


