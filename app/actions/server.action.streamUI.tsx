import { createAI, getMutableAIState, streamUI } from 'ai/rsc';
import { ReactNode } from 'react';
import { getModelClient, type LLMModel, type LLMModelConfig } from '@/lib/models';
import { StreamClarificationForm } from '@/components/clarification-form'
import { PlanView } from '@/components/plan-view'
import { MemoryUpdatePanel } from '@/components/memory-update-panel'
import { clarificationFormSchema, planSchema, memoryUpdateSchema } from '@/lib/schema';
import type { ClarificationForm, PlanSchema, MemoryUpdate } from '@/lib/schema';
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
  model: LLMModel;
  config: LLMModelConfig;
};


export async function sendMessage(input: SendMessageInput): Promise<UIMessage> {
  'use server';

  const history = getMutableAIState<typeof AI>();
  const previous = (history.get() ?? { messages: [] }) as AIState;
  const nextState: AIState = {
    messages: [...(previous.messages ?? []), { role: 'user', content: input.text }],
    model: input.model,
    config: input.config,
  };
  history.update(nextState);

  const result = await streamUI({
    model: (getModelClient(input.model, input.config) as any),
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
          return <StreamClarificationForm form={form} model={input.model} config={input.config} />
        },
      },

      update_memory: {
        description: 'Save important user information for future sessions, with user consent.',
        parameters: memoryUpdateSchema,
        generate: async (memoryData: MemoryUpdate) => {
          return <MemoryUpdatePanel memoryUpdate={memoryData} />
        },
      },
      
      generate_plan: {
        description: 'Generate a structured learning plan when the AI has enough information to create modules and submodules.',
        parameters: planSchema,
        generate: async (planData: PlanSchema) => {
          return <PlanView title={planData.title} description={planData.description} plan={planData.plan} />
        },
      }
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
  actions: { sendMessage },
});