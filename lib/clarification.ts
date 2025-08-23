export type GeneratedFormField = {
  id: string
  label: string
  type: 'choice' | 'boolean' | 'text'
  options?: string[]
  placeholder?: string
}

export type GeneratedFormSpec = {
  title: string
  fields: GeneratedFormField[]
  code?: string
}


