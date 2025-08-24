import { Duration } from '@/lib/duration'
import {
  getModelClient,
  LLMModel,
  LLMModelConfig,
} from '@/lib/models'
import { toPrompt } from '@/lib/prompt'
import ratelimit from '@/lib/ratelimit'
import { clarificationFormSchema, fragmentSchema as schema } from '@/lib/schema'
import { Templates } from '@/lib/templates'
import { streamObject, LanguageModel, CoreMessage, streamText, convertToModelMessages, UIMessage } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import { z } from 'zod'

export const maxDuration = 300

const rateLimitMaxRequests = process.env.RATE_LIMIT_MAX_REQUESTS
  ? parseInt(process.env.RATE_LIMIT_MAX_REQUESTS)
  : 10
const ratelimitWindow = process.env.RATE_LIMIT_WINDOW
  ? (process.env.RATE_LIMIT_WINDOW as Duration)
  : '1d'

export async function POST(req: Request) {
  const body: any = await req.json()

  // Branch 1: useChat + streamText UI flow
  // Detect UIMessage shape (messages with parts)
  if (
    Array.isArray(body?.messages) &&
    body.messages.length > 0 &&
    typeof body.messages[0] === 'object' &&
    'parts' in body.messages[0]
  ) {
    const uiMessages = body.messages as UIMessage[]

    // Optional: allow passing model/config; otherwise default to OpenAI gpt-4o
    const maybeModel: LLMModel | undefined = body.model
    const maybeConfig: LLMModelConfig | undefined = body.config

    const modelClient: LanguageModel = maybeModel && maybeConfig
      ? (getModelClient(maybeModel, maybeConfig) as LanguageModel)
      : (createOpenAI()(process.env.OPENAI_MODEL || 'gpt-4o') as unknown as LanguageModel)

    // Schema for plan output that matches PlanView props
    const planToolSchema = z.object({
      title: z.string().optional(),
      description: z.string().optional(),
      plan: z.array(
        z.object({
          module: z.object({
            module_name: z.string(),
            submodule_names: z.array(z.string()),
          }),
        }),
      ),
    })

    const result = streamText({
      model: modelClient,
      system: toPrompt({} as Templates),
      messages: convertToModelMessages(uiMessages),
      tools: {
        need_clarification: {
          description:
            'Request a dynamic clarification form with targeted questions for the user.',
          parameters: clarificationFormSchema,
          // Return the form as-is; the client renders the UI component from the tool output
          execute: async (form) => form,
        },
        generate_plan: {
          description:
            'Create a structured learning plan with modules and submodules.',
          parameters: planToolSchema,
          // Return plan data for client-side rendering via PlanView
          execute: async (planData) => planData,
        },
      },
    })

    return result.toUIMessageStreamResponse()
  }

  // Branch 2: existing object streaming flow (default)
  const {
    messages,
    userID,
    teamID,
    template,
    model,
    config,
  }: {
    messages: CoreMessage[]
    userID: string | undefined
    teamID: string | undefined
    template: Templates
    model: LLMModel
    config: LLMModelConfig
  } = body

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
  // console.log('template', template)
  console.log('model', model)
  // console.log('config', config)

  const { model: modelNameString, apiKey: modelApiKey, ...modelParams } = config
  const modelClient = getModelClient(model, config)

  try {
    const stream = await streamObject({
      model: modelClient as LanguageModel,
      schema: schema,
      system: toPrompt(template),
      messages,
      maxRetries: 0, // do not retry on errors
      ...modelParams,
    })

    console.log('stream', stream)

    return stream.toTextStreamResponse()
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
