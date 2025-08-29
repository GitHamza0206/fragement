import { Duration } from '@/lib/duration'
import {
  getModelClient,
  LLMModel,
  LLMModelConfig,
} from '@/lib/models'
import ratelimit from '@/lib/ratelimit'
import { clarificationFormSchema, planSchema, memoryUpdateSchema, createSurfaceSchema, conductResearchSchema } from '@/lib/schema'
import type { ClarificationForm, PlanSchema, MemoryUpdate, CreateSurface, ConductResearch } from '@/lib/schema'
//import { streamText, ModelMessage, convertToModelMessages, UIMessage, tool, generateText } from 'ai'
import { LanguageModelV2 } from '@ai-sdk/provider'
import { DeepResearchPrompt, MainSystemPrompt } from '@/lib/prompt'
import { openai } from '@ai-sdk/openai'
import * as ai from 'ai';

import { wrapAISDK } from 'langsmith/experimental/vercel';
import {  ModelMessage, convertToModelMessages, UIMessage, tool } from 'ai'

const { generateText, streamText, generateObject, streamObject,  } =
  wrapAISDK(ai);




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
    messages: UIMessage[]
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
      model: modelClient as LanguageModelV2,
      system: MainSystemPrompt(),
      messages: convertToModelMessages(messages) as ModelMessage[],
      tools: {
        // need_clarification: {
        //   description: 'Render a simple clarification form when the user query needs more clarification.',
        //   inputSchema: clarificationFormSchema,
        // },
        // update_memory: {
        //   description: 'Save important user information for future sessions, with user consent.',
        //   inputSchema: memoryUpdateSchema,
        // },
        // generate_plan: {
        //   description: 'Generate a structured learning plan when the AI has enough information to create modules and submodules.',
        //   inputSchema: planSchema,
        // },
        conduct_research: tool({
          description: 'Conduct deep research to generate the course outline plan that will be used to draft the right exercises.',
          inputSchema: conductResearchSchema,
          execute: async ({ topic }) => {
            const response = await generateText({
              model: openai("gpt-4o"), 
              prompt: DeepResearchPrompt(topic),
              tools: {
                web_search_preview: openai.tools.webSearchPreview({}),
              }
            })
            return response.text
          },
        }),
        setup_surface: tool({
          description: 'use this tool when you want to setup the learning surface (code editor, quiz, whiteboard, gallery, timeline, explain_block)',
          inputSchema: createSurfaceSchema,
          execute: async ({ surface_type, title, description, content, modality, context, sandboxTemplate }) => {
            return {
              surface_type,
              title,
              description,
              content,
              modality,
              context,
              sandboxTemplate,
            };
          },
        }),

      },
      ...modelParams,
    })

    return result.toUIMessageStreamResponse();
    
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
