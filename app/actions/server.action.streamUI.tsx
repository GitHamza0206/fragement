import { createAI, getMutableAIState, streamUI } from 'ai/rsc';
import { ReactNode } from 'react';
import { Code, X } from 'lucide-react';
import { getModelClient, type LLMModel, type LLMModelConfig } from '@/lib/models';
import { StreamClarificationForm } from '@/components/clarification-form'
import { PlanView } from '@/components/plan-view'
import { MemoryUpdatePanel } from '@/components/memory-update-panel'
import { SurfaceCreator } from '@/components/surface-creator'
import { clarificationFormSchema, planSchema, memoryUpdateSchema, createSurfaceSchema } from '@/lib/schema';
import type { ClarificationForm, PlanSchema, MemoryUpdate, CreateSurface } from '@/lib/schema';
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
      },

      create_surface: {
        description: 'Create an interactive learning surface (sandbox, whiteboard, quiz, etc.) for hands-on learning experience.',
        parameters: createSurfaceSchema,
        generate: async (surfaceData: CreateSurface) => {
          // Handle sandbox surfaces by calling /api/sandbox
          if (surfaceData.surface_type === 'sandbox') {
            try {
              // Make server-to-server API call
              const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/sandbox`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  surface_type: surfaceData.surface_type,
                  title: surfaceData.title,
                  content: surfaceData.content,
                  modality: surfaceData.modality,
                  description: surfaceData.description,
                }),
              })

              if (response.ok) {
                const sandboxData = await response.json()
                return (
                  <div className="mx-4 mb-2 rounded-2xl border border-green-200 bg-green-50/50 dark:bg-green-950/20 dark:border-green-800/30 ring-1 ring-green-200/20 shadow-sm">
                    <div className="px-4 pt-3 pb-2 flex items-start gap-3">
                      <div className="mt-0.5 text-green-600 dark:text-green-400">
                        <Code className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-foreground mb-1">
                          {surfaceData.title}
                        </div>
                        {surfaceData.description && (
                          <div className="text-sm text-muted-foreground mb-2">
                            {surfaceData.description}
                          </div>
                        )}
                        <div className="text-xs text-green-600 dark:text-green-400 mb-2">
                          ✅ Sandbox created successfully
                        </div>
                        {sandboxData.url && (
                          <div className="bg-white/50 dark:bg-white/5 rounded-lg p-3 border border-green-200/30 dark:border-green-800/30 mb-3">
                            <div className="text-xs font-medium mb-1 text-green-600 dark:text-green-400">
                              SANDBOX URL
                            </div>
                            <a 
                              href={sandboxData.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-foreground underline hover:no-underline"
                            >
                              {sandboxData.url}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              } else {
                // API call failed, show error state
                return (
                  <div className="mx-4 mb-2 rounded-2xl border border-red-200 bg-red-50/50 dark:bg-red-950/20 dark:border-red-800/30 ring-1 ring-red-200/20 shadow-sm">
                    <div className="px-4 pt-3 pb-2 flex items-start gap-3">
                      <div className="mt-0.5 text-red-600 dark:text-red-400">
                        <X className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-foreground mb-1">
                          Failed to create sandbox
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Unable to connect to sandbox API. Please try again.
                        </div>
                      </div>
                    </div>
                  </div>
                )
              }
            } catch (error) {
              // Network error, show error state
              return (
                <div className="mx-4 mb-2 rounded-2xl border border-red-200 bg-red-50/50 dark:bg-red-950/20 dark:border-red-800/30 ring-1 ring-red-200/20 shadow-sm">
                  <div className="px-4 pt-3 pb-2 flex items-start gap-3">
                    <div className="mt-0.5 text-red-600 dark:text-red-400">
                      <X className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-foreground mb-1">
                        Connection error
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Could not reach sandbox service: {error instanceof Error ? error.message : 'Unknown error'}
                      </div>
                    </div>
                  </div>
                </div>
              )
            }
          }

          // For other surface types, use the original component
          return <SurfaceCreator surface={surfaceData} />
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