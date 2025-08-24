import { LoaderIcon } from 'lucide-react'
import { useEffect, ReactNode, useRef } from 'react'
import { Message } from 'ai'
import { StreamClarificationForm } from '@/components/clarification-form'
import { MemoryUpdatePanel } from '@/components/memory-update-panel'
import { PlanView } from '@/components/plan-view'
import { SurfaceCreator } from '@/components/surface-creator'

export function Chat({
  isLoading,
  messages,
  inlineNode,
  append,
}: {
  isLoading: boolean
  messages: Message[]
  inlineNode?: ReactNode
  append: (message: any) => Promise<string | null | undefined>
}) {
  const chatContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    chatContainerRef.current?.scrollTo({
      top: chatContainerRef.current.scrollHeight,
      behavior: 'smooth'
    })
  }, [messages.length, inlineNode])

  const renderToolInvocation = (toolInvocation: any) => {
    const { toolName, result, state } = toolInvocation

    if (state !== 'result' || !result) {
      return (
        <div key={toolInvocation.toolCallId} className="mx-4 mb-2 rounded-2xl border border-gray-200 bg-gray-50/50 dark:bg-gray-950/20 dark:border-gray-800/30 text-gray-600 dark:text-gray-400 ring-1 ring-gray-200/20 shadow-sm p-4">
          <div className="flex items-center gap-2">
            <LoaderIcon className="w-4 h-4 animate-spin" />
            <span className="text-sm">Processing {toolName}...</span>
          </div>
        </div>
      )
    }

    switch (toolName) {
      case 'need_clarification':
        if (result.type === 'clarification') {
          return (
            <StreamClarificationForm 
              key={toolInvocation.toolCallId}
              form={result.form}
              append={append}
            />
          )
        }
        break

      case 'update_memory':
        if (result.type === 'memory_update') {
          return (
            <MemoryUpdatePanel 
              key={toolInvocation.toolCallId}
              memoryUpdate={result.data}
            />
          )
        }
        break

      case 'generate_plan':
        if (result.type === 'plan') {
          return (
            <PlanView 
              key={toolInvocation.toolCallId}
              title={result.data.title}
              description={result.data.description}
              plan={result.data.plan}
            />
          )
        }
        break

      case 'create_surface':
        if (result.type === 'surface') {
          if (result.success && result.sandboxResult) {
            // Render success state for sandbox
            return (
              <div key={toolInvocation.toolCallId} className="mx-4 mb-2 rounded-2xl border border-green-200 bg-green-50/50 dark:bg-green-950/20 dark:border-green-800/30 ring-1 ring-green-200/20 shadow-sm">
                <div className="px-4 pt-3 pb-2 flex items-start gap-3">
                  <div className="mt-0.5 text-green-600 dark:text-green-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-foreground mb-1">
                      {result.data.title}
                    </div>
                    <div className="text-xs text-green-600 dark:text-green-400 mb-2">
                      ✅ Sandbox created successfully
                    </div>
                    {result.sandboxResult.url && (
                      <div className="bg-white/50 dark:bg-white/5 rounded-lg p-3 border border-green-200/30 dark:border-green-800/30">
                        <div className="text-xs font-medium mb-1 text-green-600 dark:text-green-400">
                          SANDBOX URL
                        </div>
                        <a 
                          href={result.sandboxResult.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-foreground underline hover:no-underline"
                        >
                          {result.sandboxResult.url}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          } else if (!result.success) {
            // Render error state
            return (
              <div key={toolInvocation.toolCallId} className="mx-4 mb-2 rounded-2xl border border-red-200 bg-red-50/50 dark:bg-red-950/20 dark:border-red-800/30 ring-1 ring-red-200/20 shadow-sm">
                <div className="px-4 pt-3 pb-2 flex items-start gap-3">
                  <div className="mt-0.5 text-red-600 dark:text-red-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-foreground mb-1">
                      Failed to create surface
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {result.error || 'Unknown error occurred'}
                    </div>
                  </div>
                </div>
              </div>
            )
          } else {
            // Render other surface types
            return (
              <SurfaceCreator 
                key={toolInvocation.toolCallId}
                surface={result.data}
              />
            )
          }
        }
        break

      default:
        return (
          <div key={toolInvocation.toolCallId} className="mx-4 mb-2 p-4 border rounded-lg">
            <div className="text-sm font-medium">Unknown tool: {toolName}</div>
            <pre className="text-xs mt-2 text-gray-600">{JSON.stringify(result, null, 2)}</pre>
          </div>
        )
    }

    return null
  }

  return (
    <div
      ref={chatContainerRef}
      className="flex flex-col pb-12 gap-2 overflow-y-auto max-h-full"
    >
      {messages.map((message: Message) => (
        <div
          className={`flex flex-col px-4 shadow-sm whitespace-pre-wrap ${message.role !== 'user' ? 'bg-accent dark:bg-white/5 border text-accent-foreground dark:text-muted-foreground py-4 rounded-2xl gap-4 w-full' : 'bg-gradient-to-b from-black/5 to-black/10 dark:from-black/30 dark:to-black/50 py-2 rounded-xl gap-2 w-fit'} font-serif`}
          key={message.id}
        >
          <div>{message.content}</div>
          
          {/* Render tool invocations */}
          {message.toolInvocations && message.toolInvocations.length > 0 && (
            <div className="mt-2 space-y-2">
              {message.toolInvocations.map((toolInvocation: any) => 
                renderToolInvocation(toolInvocation)
              )}
            </div>
          )}
        </div>
      ))}
      {inlineNode && (
        <div className={`flex flex-col px-4 shadow-sm whitespace-pre-wrap bg-accent dark:bg-white/5 border text-accent-foreground dark:text-muted-foreground py-4 rounded-2xl gap-4 w-full font-serif`}>
          {inlineNode}
        </div>
      )}
      {isLoading && (
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <LoaderIcon strokeWidth={2} className="animate-spin w-4 h-4" />
          <span>Generating...</span>
        </div>
      )}
    </div>
  )
}
