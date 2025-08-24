import { Duration } from '@/lib/duration'
import {
  getModelClient,
  LLMModel,
  LLMModelConfig,
} from '@/lib/models'
import ratelimit from '@/lib/ratelimit'
import { clarificationFormSchema, planSchema, memoryUpdateSchema, createSurfaceSchema } from '@/lib/schema'
import type { ClarificationForm, PlanSchema, MemoryUpdate, CreateSurface } from '@/lib/schema'
import { streamText, LanguageModel, CoreMessage } from 'ai'
import { MainSystemPrompt } from '@/lib/prompt'
export const maxDuration = 300

const rateLimitMaxRequests = process.env.RATE_LIMIT_MAX_REQUESTS
  ? parseInt(process.env.RATE_LIMIT_MAX_REQUESTS)
  : 10
const ratelimitWindow = process.env.RATE_LIMIT_WINDOW
  ? (process.env.RATE_LIMIT_WINDOW as Duration)
  : '1d'

export async function POST(req: Request) {
  const {
    messages,
    userID,
    teamID,
    model,
    config,
  }: {
    messages: CoreMessage[]
    userID: string | undefined
    teamID: string | undefined
    model: LLMModel
    config: LLMModelConfig
  } = await req.json()

  const limit = !config.apiKey
    ? await ratelimit(
        req.headers.get('x-forwarded-for'), 
        rateLimitMaxRequests,
        ratelimitWindow,
      )
    : false

  if (limit) {
    return new Response('You have reached your request limit for the day.', {
      status: 429,
      headers: {
        'X-RateLimit-Limit': limit.amount.toString(),
        'X-RateLimit-Remaining': limit.remaining.toString(),
        'X-RateLimit-Reset': limit.reset.toString(),
      },
    })
  }

  console.log('userID', userID)
  console.log('teamID', teamID)
  console.log('model', model)

  const { model: modelNameString, apiKey: modelApiKey, ...modelParams } = config
  const modelClient = getModelClient(model, config)

  try {
    const result = await streamText({
      model: modelClient as LanguageModel,
      system: MainSystemPrompt(),
      messages,
      maxRetries: 0, // do not retry on errors
      maxSteps: 5,
      tools: {
        need_clarification: {
          description: 'Render a simple clarification form when the user query needs more clarification.',
          parameters: clarificationFormSchema,
          execute: async (form: ClarificationForm) => {
            return {
              type: 'clarification',
              form,
            }
          },
        },
        update_memory: {
          description: 'Save important user information for future sessions, with user consent.',
          parameters: memoryUpdateSchema,
          execute: async (memoryData: MemoryUpdate) => {
            return {
              type: 'memory_update',
              data: memoryData,
            }
          },
        },
        generate_plan: {
          description: 'Generate a structured learning plan when the AI has enough information to create modules and submodules.',
          parameters: planSchema,
          execute: async (planData: PlanSchema) => {
            return {
              type: 'plan',
              data: planData,
            }
          },
        },
        create_surface: {
          description: 'Create an interactive learning surface (sandbox, whiteboard, quiz, etc.) for hands-on learning experience.',
          parameters: createSurfaceSchema,
          execute: async (surfaceData: CreateSurface) => {
            // Handle sandbox surfaces by calling /api/sandbox
            if (surfaceData.surface_type === 'sandbox') {
              try {
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
                  return {
                    type: 'surface',
                    data: surfaceData,
                    sandboxResult: sandboxData,
                    success: true,
                  }
                } else {
                  return {
                    type: 'surface',
                    data: surfaceData,
                    error: 'Failed to create sandbox',
                    success: false,
                  }
                }
              } catch (error) {
                return {
                  type: 'surface',
                  data: surfaceData,
                  error: error instanceof Error ? error.message : 'Unknown error',
                  success: false,
                }
              }
            }

            // For other surface types
            return {
              type: 'surface',
              data: surfaceData,
              success: true,
            }
          },
        },
      },
      ...modelParams,
    })

    return result.toDataStreamResponse()
    
  } catch (error: any) {
    const isRateLimitError =
      error && (error.statusCode === 429 || error.message.includes('limit'))
    const isOverloadedError =
      error && (error.statusCode === 529 || error.statusCode === 503)
    const isAccessDeniedError =
      error && (error.statusCode === 403 || error.statusCode === 401)

    if (isRateLimitError) {
      return new Response(
        'The provider is currently unavailable due to request limit. Try using your own API key.',
        {
          status: 429,
        },
      )
    }

    if (isOverloadedError) {
      return new Response(
        'The provider is currently unavailable. Please try again later.',
        {
          status: 529,
        },
      )
    }

    if (isAccessDeniedError) {
      return new Response(
        'Access denied. Please make sure your API key is valid.',
        {
          status: 403,
        },
      )
    }

    console.error('Error:', error)

    return new Response(
      'An unexpected error has occurred. Please try again later.',
      {
        status: 500,
      },
    )
  }
}
