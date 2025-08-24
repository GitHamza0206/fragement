import { createAI, getMutableAIState, streamUI } from 'ai/rsc';
import { ReactNode } from 'react';
import { openai } from '@ai-sdk/openai';
import { getModelClient, type LLMModel, type LLMModelConfig } from '@/lib/models';
import { StreamClarificationForm } from '@/components/clarification-form'
import { clarificationFormSchema } from '@/lib/schema';
import type { ClarificationForm } from '@/lib/schema';
import { MainSystemPrompt } from '@/lib/prompt';

type ServerMessage = { role: 'user' | 'assistant'; content: string };
type ConversationState = {
  messages: ServerMessage[];
  model?: LLMModel;
  config?: LLMModelConfig;
};

export type AIState = ConversationState;

export type UIMessage = {
  id: string;
  role: 'user' | 'assistant';
  display: ReactNode;
};

export type UIState = UIMessage[];

export type SendMessageInput = {
  text: string;
  model?: LLMModel;
  config?: LLMModelConfig;
};

export async function setModelConfig(input: { model: LLMModel; config: LLMModelConfig }): Promise<void> {
  'use server';

  const history = getMutableAIState<typeof AI>();
  const previous = (history.get() ?? { messages: [] }) as AIState;
  history.update({
    ...previous,
    model: input.model,
    config: input.config,
  });
}

export async function sendMessage(input: SendMessageInput): Promise<UIMessage> {
  'use server';

  const history = getMutableAIState<typeof AI>();
  const previous = (history.get() ?? { messages: [] }) as AIState;
  const nextState: AIState = {
    messages: [...(previous.messages ?? []), { role: 'user', content: input.text }],
    model: input.model ?? previous.model,
    config: input.config ?? previous.config,
  };
  history.update(nextState);

  const modelToUse = nextState.model;
  const configToUse = nextState.config;
  if (!modelToUse || !configToUse) {
    throw new Error('Model/config not set. Provide them on the first call.');
  }

  const result = await streamUI({
    model: (getModelClient(modelToUse, configToUse) as any),
    messages: nextState.messages,
    text: ({ content, done }: { content: string; done: boolean }) => {
      if (done) {
        const current = (history.get() ?? { messages: [] }) as AIState;
        history.done({
          ...current,
          messages: [...(current.messages ?? []), { role: 'assistant', content }],
        });
      }

      return <div>{content}</div>;
    },
    system: MainSystemPrompt(),
    tools: {
      need_clarification: {
        description: 'Render a simple clarification form  when the user query need more clarification.',
        parameters: clarificationFormSchema,
        generate: async (form: ClarificationForm) => {
          return <StreamClarificationForm form={form} />
        },
      },
    },
  });

  return {
    id: typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2),
    role: 'assistant',
    display: result.value,
  };
}

export const AI = createAI<AIState, UIState>({
  initialAIState: { messages: [] },
  initialUIState: [],
  actions: { sendMessage, setModelConfig },
});