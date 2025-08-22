import { LanguageModel, streamObject } from 'ai'
import { getModelClient, LLMModel, LLMModelConfig } from '@/lib/models'
import { clarificationFormSchema } from '@/lib/schema'
import { CoreMessage } from 'ai'

export const maxDuration = 120

export async function POST(req: Request) {
  const {
    messages,
    model,
    config,
  }: {
    messages: CoreMessage[]
    model: LLMModel
    config: LLMModelConfig
  } = await req.json()

  const modelClient = getModelClient(model, config)

  const system = `You are generating a concise, targeted clarification form as JSON matching a provided schema.
The form should contain only the most important questions needed to proceed with code generation.
Prefer select/radio with clear options when possible. Use helpful labels and placeholders.
Always return a small number of fields (1-5).`

  try {
    const stream = await streamObject({
      model: modelClient as LanguageModel,
      schema: clarificationFormSchema,
      system,
      messages,
      maxRetries: 0,
    })

    return stream.toTextStreamResponse()
  } catch (error: any) {
    console.error('Clarify error:', error)
    return new Response('Failed to generate clarification form', { status: 500 })
  }
}


