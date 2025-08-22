'use client'

import { useState } from 'react'
import TextareaAutosize from 'react-textarea-autosize'

export function ClarificationForm({
  title = 'Clarification needed',
  placeholder = 'Add details so I can proceed…',
  visible,
  isLoading = false,
  onSubmit,
  onCancel,
}: {
  title?: string
  placeholder?: string
  visible: boolean
  isLoading?: boolean
  onSubmit: (clarification: string) => void
  onCancel?: () => void
}) {
  const [value, setValue] = useState('')

  if (!visible) return null

  return (
    <div className="mx-4 mb-2 rounded-xl border bg-amber-500/10 text-amber-500">
      <div className="px-3 pt-3 pb-2">
        <div className="font-medium text-sm text-amber-600 dark:text-amber-400">
          {title}
        </div>
        <div className="text-xs text-amber-600/80 dark:text-amber-400/80 mt-0.5">
          The fragment needs more information to continue.
        </div>
      </div>

      <div className="px-3 pb-3 flex flex-col gap-2">
        <TextareaAutosize
          minRows={2}
          maxRows={6}
          className="text-normal px-3 py-2 resize-none ring-0 bg-white/60 dark:bg-white/5 w-full m-0 outline-none rounded-lg text-amber-900 dark:text-amber-200 placeholder:text-amber-700/60"
          placeholder={placeholder}
          value={value}
          disabled={isLoading}
          onChange={(e) => setValue(e.target.value)}
        />
        <div className="flex gap-2 justify-end">
          {onCancel && (
            <button
              type="button"
              className="px-3 py-1.5 rounded-lg text-sm border border-amber-500/30 text-amber-700 dark:text-amber-300"
              disabled={isLoading}
              onClick={onCancel}
            >
              Cancel
            </button>
          )}
          <button
            type="button"
            className="px-3 py-1.5 rounded-lg text-sm bg-amber-500 text-white disabled:opacity-50"
            disabled={isLoading || value.trim().length === 0}
            onClick={() => onSubmit(value.trim())}
          >
            Send clarification
          </button>
        </div>
      </div>
    </div>
  )
}


