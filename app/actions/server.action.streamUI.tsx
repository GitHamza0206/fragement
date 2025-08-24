import { createAI, getMutableAIState, streamUI } from 'ai/rsc';
import { ReactNode } from 'react';
import { openai } from '@ai-sdk/openai';
import { getModelClient, type LLMModel, type LLMModelConfig } from '@/lib/models';
import { clarificationFormSchema } from '@/lib/schema';
import type { ClarificationForm } from '@/lib/schema';
import { MainSystemPrompt } from '@/lib/prompt';

type ServerMessage = { role: 'user' | 'assistant'; content: string };

export type AIState = ServerMessage[];

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
  const previousHistory = (history.get() ?? []) as AIState;
  history.update([
    ...previousHistory,
    { role: 'user', content: input.text },
  ]);

  const result = await streamUI({
    model: (getModelClient(input.model, input.config) as any),
    messages: [...previousHistory, { role: 'user', content: input.text }],
    text: ({ content, done }: { content: string; done: boolean }) => {
      if (done) {
        const current = (history.get() ?? []) as AIState;
        history.done([...current, { role: 'assistant', content }]);
      }

      return <div>{content}</div>;
    },
    system: MainSystemPrompt(),
    tools: {
      need_clarification: {
        description: 'Render a simple clarification form  when the user query need more clarification.',
        parameters: clarificationFormSchema,
        generate: async (form: ClarificationForm) => {
          return (
            <div className="mx-4 mb-2 rounded-2xl border border-primary/20 bg-accent/30 dark:bg-white/5 text-accent-foreground dark:text-muted-foreground ring-1 ring-primary/10 shadow-sm">
              <div className="px-3 pt-3 pb-2">
                <div className="font-medium text-sm text-foreground">
                  {form.title ?? 'Clarification needed'}
                </div>
                {form.description && (
                  <div className="text-xs text-muted-foreground mt-0.5">{form.description}</div>
                )}
                {form.context && (
                  <div className="text-xs text-muted-foreground mt-0.5">{form.context}</div>
                )}
              </div>
              <div className="px-3 pb-3 space-y-3">
                {(form.questions ?? []).map((q: ClarificationForm['questions'][number]) => (
                  <div key={q.id} className="space-y-1">
                    <div className="text-sm font-medium text-foreground">{q.question}</div>
                  </div>
                ))}
                <div className="text-xs text-muted-foreground">Please provide the requested details above.</div>
              </div>
            </div>
          );
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
  initialAIState: [],
  initialUIState: [],
  actions: { sendMessage },
});