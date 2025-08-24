'use client'

import { useState } from 'react'
import { Code, Layers, Play } from 'lucide-react'
import type { CreateSurface } from '@/lib/schema'

export function SurfaceCreator({
  surface,
}: {
  surface: CreateSurface
}) {
  const [isLoading, setIsLoading] = useState(false)

  const handleOpenSurface = async () => {
    setIsLoading(true)
    try {
      // Call /api/sandbox to open the code editor
      const response = await fetch('/api/sandbox', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          surface_type: surface.surface_type,
          title: surface.title,
          content: surface.content,
          modality: surface.modality,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        // Handle successful surface creation
        console.log('Surface created:', data)
        
        // If it's a sandbox, potentially open in a new window or iframe
        if (surface.surface_type === 'sandbox' && data.url) {
          window.open(data.url, '_blank')
        }
      } else {
        console.error('Failed to create surface:', response.statusText)
      }
    } catch (error) {
      console.error('Error creating surface:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getSurfaceIcon = () => {
    switch (surface.surface_type) {
      case 'sandbox':
        return <Code className="w-5 h-5" />
      case 'whiteboard':
        return <Layers className="w-5 h-5" />
      default:
        return <Play className="w-5 h-5" />
    }
  }

  const getSurfaceColor = () => {
    switch (surface.surface_type) {
      case 'sandbox':
        return 'border-green-200 bg-green-50/50 dark:bg-green-950/20 dark:border-green-800/30 text-green-600 dark:text-green-400'
      case 'whiteboard':
        return 'border-purple-200 bg-purple-50/50 dark:bg-purple-950/20 dark:border-purple-800/30 text-purple-600 dark:text-purple-400'
      case 'quiz':
        return 'border-orange-200 bg-orange-50/50 dark:bg-orange-950/20 dark:border-orange-800/30 text-orange-600 dark:text-orange-400'
      default:
        return 'border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-800/30 text-blue-600 dark:text-blue-400'
    }
  }

  return (
    <div className={`mx-4 mb-2 rounded-2xl border ring-1 shadow-sm ${getSurfaceColor()}`}>
      <div className="px-4 pt-3 pb-2 flex items-start gap-3">
        <div className="mt-0.5">
          {getSurfaceIcon()}
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold text-foreground mb-1">
            {surface.title}
          </div>
          {surface.description && (
            <div className="text-sm text-muted-foreground mb-2">
              {surface.description}
            </div>
          )}
          <div className="text-xs text-muted-foreground mb-3">
            {surface.context}
          </div>
          
          {surface.content && (
            <div className="bg-white/50 dark:bg-white/5 rounded-lg p-3 border border-current/20 mb-3">
              <div className="text-xs font-medium mb-2 opacity-70">
                {surface.surface_type.toUpperCase()} CONTENT
              </div>
              <div className="text-sm text-foreground font-mono whitespace-pre-wrap">
                {surface.content.length > 200 
                  ? surface.content.substring(0, 200) + '...' 
                  : surface.content
                }
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="px-4 pb-3 flex gap-2 justify-end">
        <button
          type="button"
          className="px-4 py-2 rounded-lg text-sm bg-current text-white hover:opacity-90 disabled:opacity-60 flex items-center gap-2 font-medium"
          disabled={isLoading}
          onClick={handleOpenSurface}
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            getSurfaceIcon()
          )}
          {isLoading ? 'Creating...' : `Open ${surface.surface_type}`}
        </button>
      </div>
    </div>
  )
}