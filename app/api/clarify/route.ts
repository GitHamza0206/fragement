import { getModelClient, LLMModel, LLMModelConfig } from '@/lib/models'
import { generateObject, LanguageModel } from 'ai'
import { z } from 'zod'

export const maxDuration = 120

export async function POST(req: Request) {
  const {
    placeholder,
    model,
    config,
  }: {
    placeholder: string
    model: LLMModel
    config: LLMModelConfig
  } = await req.json()

  try {
    const modelClient = getModelClient(model, config)

    const fieldSchema = z.object({
      id: z.string(),
      label: z.string(),
      type: z.enum(['choice', 'boolean', 'text']),
      options: z.array(z.string()).optional(),
      placeholder: z.string().optional(),
    })

    const specSchema = z.object({
      title: z.string(),
      fields: z.array(fieldSchema).max(4),
    })

    const system = [
      'You are designing a short clarification form for a developer tool.',
      'Return JSON only that matches the provided schema.',
      'Constraints:',
      '- Prefer buttons over text inputs.',
      '- For choices, prefer exactly two options when possible (two buttons).',
      '- The form must have at most 4 fields.',
      '- Ask only what is essential to proceed.',
    ].join('\n')

    const prompt = [
      `Inspiration placeholder: "${placeholder}"`,
      'Infer the 1-4 most crucial questions to clarify the task.',
      'Favor boolean or two-choice questions. Use short labels.',
    ].join('\n')

    const { object } = await generateObject({
      model: modelClient as LanguageModel,
      system,
      prompt,
      schema: specSchema,
      temperature: config.temperature ?? 0.2,
    })

    return Response.json({ spec: object })
  } catch (error: any) {
    console.error('clarify error', error)
    return new Response('Failed to generate clarification form.', { status: 500 })
  }
}

