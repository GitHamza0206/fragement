'use client'

import { useState } from 'react'
import { Brain, Check, X } from 'lucide-react'
import type { MemoryUpdate } from '@/lib/schema'

export function MemoryUpdatePanel({
  memoryUpdate,
}: {
  memoryUpdate: MemoryUpdate
}) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  const handleAccept = async () => {
    setIsProcessing(true)
    try {
      // TODO: Implement actual memory storage (localStorage, supabase, etc.)
      console.log('Storing memory:', memoryUpdate)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setIsDismissed(true)
    } catch (error) {
      console.error('Failed to store memory:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRefuse = () => {
    setIsDismissed(true)
  }

  if (isDismissed) {
    return null
  }

  return (
    <div className="mx-4 mb-2 rounded-2xl border border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-800/30 text-foreground ring-1 ring-blue-200/20 shadow-sm">
      <div className="px-4 pt-3 pb-2 flex items-start gap-3">
        <div className="mt-0.5 text-blue-600 dark:text-blue-400">
          <Brain className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold text-foreground mb-1">
            Remember this for future sessions?
          </div>
          <div className="text-sm text-muted-foreground mb-2">
            {memoryUpdate.context}
          </div>
          <div className="bg-white/50 dark:bg-white/5 rounded-lg p-3 border border-blue-200/30 dark:border-blue-800/30">
            <div className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">
              {memoryUpdate.key}
            </div>
            <div className="text-sm text-foreground">
              {memoryUpdate.value}
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 pb-3 flex gap-2 justify-end">
        <button
          type="button"
          className="px-3 py-1.5 rounded-lg text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-60 flex items-center gap-1"
          disabled={isProcessing}
          onClick={handleRefuse}
        >
          <X className="w-3.5 h-3.5" />
          Don&apos;t save
        </button>
        <button
          type="button"
          className="px-3 py-1.5 rounded-lg text-sm bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 flex items-center gap-1"
          disabled={isProcessing}
          onClick={handleAccept}
        >
          {isProcessing ? (
            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Check className="w-3.5 h-3.5" />
          )}
          {isProcessing ? 'Saving...' : 'Remember this'}
        </button>
      </div>
    </div>
  )
}