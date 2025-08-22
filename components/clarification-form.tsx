'use client'

import { useMemo, useState } from 'react'
import type { ClarificationFormSchema } from '@/lib/schema'
import TextareaAutosize from 'react-textarea-autosize'

export function ClarificationForm({
  title = 'Clarification needed',
  placeholder = 'Add details so I can proceed…',
  visible,
  isLoading = false,
  onSubmit,
  onCancel,
  schema,
}: {
  title?: string
  placeholder?: string
  visible: boolean
  isLoading?: boolean
  onSubmit: (clarification: string) => void
  onCancel?: () => void
  schema?: ClarificationFormSchema
}) {
  const [value, setValue] = useState('')
  const [values, setValues] = useState<Record<string, any>>({})

  if (!visible) return null

  const activeTitle = schema?.title ?? title
  const activeDescription = schema?.description ?? 'The fragment needs more information to continue.'
  const submitLabel = schema?.submit_label ?? 'Send clarification'

  function updateValue(id: string, val: any) {
    setValues((prev) => ({ ...prev, [id]: val }))
  }

  function handleSubmit() {
    if (schema) {
      onSubmit(JSON.stringify(values))
    } else {
      onSubmit(value.trim())
    }
  }

  return (
    <div className="relative mx-4 mb-3 rounded-2xl border border-white/10 bg-black/80 text-white shadow-lg overflow-hidden before:absolute before:inset-0 before:rounded-2xl before:bg-white/20 before:blur-xl before:opacity-30">
      <div className="relative z-10 px-4 pt-4 pb-2">
        <div className="font-semibold text-sm text-[#FF8800]">
          {activeTitle}
        </div>
        <div className="text-xs text-white/70 mt-0.5">
          {activeDescription}
        </div>
      </div>

      <div className="relative z-10 px-4 pb-4 flex flex-col gap-2">
        {!schema && (
          <TextareaAutosize
            minRows={2}
            maxRows={6}
            className="text-normal px-3 py-2 resize-none bg-white/5 backdrop-blur-sm w-full m-0 outline-none rounded-lg text-white placeholder:text-white/50 border border-white/10 focus:ring-2 focus:ring-[#FF8800]/50"
            placeholder={placeholder}
            value={value}
            disabled={isLoading}
            onChange={(e) => setValue(e.target.value)}
          />
        )}

        {schema && (
          <div className="flex flex-col gap-3">
            {schema.fields.map((f) => {
              if (f.type === 'textarea') {
                return (
                  <label key={f.id} className="flex flex-col gap-1">
                    <span className="text-sm text-white/80">{f.label}</span>
                    <TextareaAutosize
                      minRows={3}
                      className="text-normal px-3 py-2 resize-none bg-white/5 backdrop-blur-sm w-full m-0 outline-none rounded-lg text-white placeholder:text-white/50 border border-white/10 focus:ring-2 focus:ring-[#FF8800]/50"
                      placeholder={f.placeholder}
                      disabled={isLoading}
                      onChange={(e) => updateValue(f.id, e.target.value)}
                    />
                    {f.help && <span className="text-xs text-white/50">{f.help}</span>}
                  </label>
                )
              }
              if (f.type === 'select') {
                return (
                  <label key={f.id} className="flex flex-col gap-1">
                    <span className="text-sm text-white/80">{f.label}</span>
                    <select
                      className="px-3 py-2 bg-white/5 backdrop-blur-sm rounded-lg text-white border border-white/10 focus:ring-2 focus:ring-[#FF8800]/50"
                      disabled={isLoading}
                      onChange={(e) => updateValue(f.id, e.target.value)}
                      defaultValue=""
                    >
                      <option value="" disabled hidden>
                        {f.placeholder ?? 'Select an option'}
                      </option>
                      {(f.options ?? []).map((opt) => (
                        <option key={opt.value} value={opt.value} className="text-black">
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    {f.help && <span className="text-xs text-white/50">{f.help}</span>}
                  </label>
                )
              }
              if (f.type === 'radio') {
                return (
                  <fieldset key={f.id} className="flex flex-col gap-2">
                    <legend className="text-sm text-white/80">{f.label}</legend>
                    <div className="flex flex-wrap gap-3">
                      {(f.options ?? []).map((opt) => (
                        <label key={opt.value} className="inline-flex items-center gap-2">
                          <input
                            type="radio"
                            name={f.id}
                            value={opt.value}
                            onChange={(e) => updateValue(f.id, e.target.value)}
                          />
                          <span>{opt.label}</span>
                        </label>
                      ))}
                    </div>
                    {f.help && <span className="text-xs text-white/50">{f.help}</span>}
                  </fieldset>
                )
              }
              if (f.type === 'checkbox') {
                return (
                  <label key={f.id} className="inline-flex items-center gap-2">
                    <input type="checkbox" onChange={(e) => updateValue(f.id, e.target.checked)} />
                    <span className="text-sm text-white/80">{f.label}</span>
                    {f.help && <span className="text-xs text-white/50 ml-2">{f.help}</span>}
                  </label>
                )
              }
              if (f.type === 'number') {
                return (
                  <label key={f.id} className="flex flex-col gap-1">
                    <span className="text-sm text-white/80">{f.label}</span>
                    <input
                      type="number"
                      min={f.min}
                      max={f.max}
                      className="px-3 py-2 bg-white/5 backdrop-blur-sm rounded-lg text-white placeholder:text-white/50 border border-white/10 focus:ring-2 focus:ring-[#FF8800]/50"
                      placeholder={f.placeholder}
                      disabled={isLoading}
                      onChange={(e) => updateValue(f.id, e.target.valueAsNumber)}
                    />
                    {f.help && <span className="text-xs text-white/50">{f.help}</span>}
                  </label>
                )
              }
              // text, email, url default
              return (
                <label key={f.id} className="flex flex-col gap-1">
                  <span className="text-sm text-white/80">{f.label}</span>
                  <input
                    type={f.type === 'email' ? 'email' : f.type === 'url' ? 'url' : 'text'}
                    className="px-3 py-2 bg-white/5 backdrop-blur-sm rounded-lg text-white placeholder:text-white/50 border border-white/10 focus:ring-2 focus:ring-[#FF8800]/50"
                    placeholder={f.placeholder}
                    disabled={isLoading}
                    onChange={(e) => updateValue(f.id, e.target.value)}
                  />
                  {f.help && <span className="text-xs text-white/50">{f.help}</span>}
                </label>
              )
            })}
          </div>
        )}
        <div className="flex gap-2 justify-end">
          {onCancel && (
            <button
              type="button"
              className="px-3 py-1.5 rounded-lg text-sm border border-white/20 text-white/80 hover:bg-white/5 disabled:opacity-50"
              disabled={isLoading}
              onClick={onCancel}
            >
              Cancel
            </button>
          )}
          <button
            type="button"
            className="px-3 py-1.5 rounded-lg text-sm bg-[#FF8800] text-black hover:bg-[#FF8800]/90 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={
              isLoading || (!schema && value.trim().length === 0)
            }
            onClick={handleSubmit}
          >
            {submitLabel}
          </button>
        </div>
      </div>
    </div>
  )
}


