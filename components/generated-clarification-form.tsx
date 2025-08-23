'use client'

import React, { useMemo } from 'react'
import type { GeneratedFormSpec as Spec, GeneratedFormField as Field } from '@/lib/clarification'

export function GeneratedClarificationForm({
  spec,
  onSubmit,
}: {
  spec: Spec
  onSubmit: (values: Record<string, string | boolean>) => void
}) {
  const initial = useMemo(() => {
    const acc: Record<string, string | boolean> = {}
    spec.fields.forEach((f) => {
      if (f.type === 'boolean') acc[f.id] = false
      else acc[f.id] = ''
    })
    return acc
  }, [spec])

  const [values, setValues] = React.useState<Record<string, string | boolean>>(initial)

  return (
    <div className="mx-4 mb-2 rounded-xl border bg-amber-500/10 text-amber-700 dark:text-amber-300">
      <div className="px-3 pt-3 pb-2">
        <div className="font-medium text-sm text-amber-700 dark:text-amber-300">
          {spec.title}
        </div>
        <div className="text-xs text-amber-600/80 dark:text-amber-400/80 mt-0.5">
          The fragment needs more information to continue.
        </div>
      </div>
      <div className="px-3 pb-3 flex flex-col gap-3">
        {spec.fields.map((field) => {
          if (field.type === 'boolean') {
            const v = Boolean(values[field.id])
            return (
              <div key={field.id} className="flex flex-col gap-1">
                <label className="text-sm">{field.label}</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className={`px-3 py-1.5 rounded-lg text-sm border ${v ? 'bg-amber-500 text-white' : 'bg-transparent text-amber-700 dark:text-amber-300'}`}
                    aria-pressed={v}
                    onClick={() => setValues({ ...values, [field.id]: true })}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    className={`px-3 py-1.5 rounded-lg text-sm border ${!v ? 'bg-amber-500 text-white' : 'bg-transparent text-amber-700 dark:text-amber-300'}`}
                    aria-pressed={!v}
                    onClick={() => setValues({ ...values, [field.id]: false })}
                  >
                    No
                  </button>
                </div>
              </div>
            )
          }

          if (field.type === 'choice' && field.options && field.options.length > 0) {
            const v = String(values[field.id] || '')
            const opts = field.options.slice(0, 2)
            return (
              <div key={field.id} className="flex flex-col gap-1">
                <label className="text-sm">{field.label}</label>
                <div className="flex gap-2">
                  {opts.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      className={`px-3 py-1.5 rounded-lg text-sm border ${v === opt ? 'bg-amber-500 text-white' : 'bg-transparent text-amber-700 dark:text-amber-300'}`}
                      aria-pressed={v === opt}
                      onClick={() => setValues({ ...values, [field.id]: opt })}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            )
          }

          // Fallback minimal text input (still within max 4 fields)
          return (
            <div key={field.id} className="flex flex-col gap-1">
              <label className="text-sm" htmlFor={field.id}>{field.label}</label>
              <input
                id={field.id}
                type="text"
                className="px-3 py-1.5 rounded-lg text-sm border bg-white/60 dark:bg-white/5 text-amber-900 dark:text-amber-200 placeholder:text-amber-700/60"
                placeholder={field.placeholder}
                value={String(values[field.id] || '')}
                onChange={(e) => setValues({ ...values, [field.id]: e.target.value })}
              />
            </div>
          )
        })}

        <div className="flex gap-2 justify-end">
          <button
            type="button"
            className="px-3 py-1.5 rounded-lg text-sm bg-amber-500 text-white"
            onClick={() => onSubmit(values)}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  )
}


