import { LoaderIcon } from 'lucide-react'
import { useRef } from 'react'
import { UIMessage } from 'ai'
import { ClarificationForm } from '@/components/clarification-form'
import { MemoryUpdatePanel } from '@/components/memory-update-panel'
import { PlanView } from '@/components/plan-view'
import { ResearchForm } from '@/components/research-form'
import { ClarificationForm as ClarificationFormType } from '@/lib/schema'


export type ChatProps = { 
  messages: UIMessage[]
  status: string
  sendMessage: (message?: any) => Promise<any>
  addToolResult: (result: { tool: string; toolCallId: string; output: any }) => void
}

export const Chat = ({ messages, status, sendMessage, addToolResult }: ChatProps) => {
  const chatContainerRef = useRef<HTMLDivElement>(null) // used for autoscroll 


  return (
    <div
      ref={chatContainerRef}
      className="flex flex-col pb-12 gap-2 overflow-y-auto max-h-full"
    >
      {messages.map((message: UIMessage) => (
        <div
          className={`flex flex-col px-4 shadow-sm whitespace-pre-wrap ${message.role !== 'user' ? 'bg-accent dark:bg-white/5 border text-accent-foreground dark:text-muted-foreground py-4 rounded-2xl gap-4 w-full' : 'bg-gradient-to-b from-black/5 to-black/10 dark:from-black/30 dark:to-black/50 py-2 rounded-xl gap-2 w-fit'} font-serif`}
          key={message.id}
        >
          <div>
            {message.parts?.map((part) => {
              switch (part.type) {
                case 'text':
                  return <span key={`text-${message.id}`}>{part.text}</span>

                case 'tool-need_clarification': {
                  const callId = part.toolCallId
                  switch (part.state) {
                    case 'input-streaming':
                      return (
                        <div key={callId} className="mx-4 mb-2 rounded-2xl border border-gray-200 bg-gray-50/50 dark:bg-gray-950/20 dark:border-gray-800/30 text-gray-600 dark:text-gray-400 ring-1 ring-gray-200/20 shadow-sm p-4">
                          <div className="flex items-center gap-2">
                            <LoaderIcon className="w-4 h-4 animate-spin" />
                            <span className="text-sm">Preparing clarification...</span>
                          </div>
                        </div>
                      )
                    case 'input-available':
                      return (
                        <ClarificationForm
                          key={callId}
                          form={(part as any).input}
                          toolCallId={callId}
                          addToolResult={addToolResult}
                        />
                      )
                    case 'output-available':
                      return (
                        <div key={callId} className="mx-4 mb-2 rounded-2xl border border-green-200 bg-green-50/50 dark:bg-green-950/20 dark:border-green-800/30 ring-1 ring-green-200/20 shadow-sm p-4">
                          <div className="text-sm text-green-600 dark:text-green-400">
                            ✅ Clarification submitted
                          </div>
                        </div>
                      )
                    case 'output-error':
                      return (
                        <div key={callId} className="mx-4 mb-2 rounded-2xl border border-red-200 bg-red-50/50 dark:bg-red-950/20 dark:border-red-800/30 ring-1 ring-red-200/20 shadow-sm p-4">
                          <div className="text-sm text-red-600 dark:text-red-400">{part.errorText}</div>
                        </div>

                      )
                  }
                  break
                }

                case 'tool-update_memory': {
                  const callId = part.toolCallId
                  switch (part.state) {
                    case 'input-streaming':
                    case 'input-available':
                      return (
                        <div key={callId} className="mx-4 mb-2 rounded-2xl border border-gray-200 bg-gray-50/50 dark:bg-gray-950/20 dark:border-gray-800/30 text-gray-600 dark:text-gray-400 ring-1 ring-gray-200/20 shadow-sm p-4">
                          <div className="flex items-center gap-2">
                            <LoaderIcon className="w-4 h-4 animate-spin" />
                            <span className="text-sm">Preparing memory update...</span>
                          </div>
                        </div>
                      )
                    case 'output-available':
                      return (
                        <MemoryUpdatePanel
                          key={callId}
                          memoryUpdate={(part as any).output?.data}
                        />
                      )
                    case 'output-error':
                      return (
                        <div key={callId} className="mx-4 mb-2 rounded-2xl border border-red-200 bg-red-50/50 dark:bg-red-950/20 dark:border-red-800/30 ring-1 ring-red-200/20 shadow-sm p-4">
                          <div className="text-sm text-red-600 dark:text-red-400">{part.errorText}</div>
                        </div>
                      )
                  }
                  break
                }

                case 'tool-generate_plan': {
                  const callId = part.toolCallId
                  switch (part.state) {
                    case 'input-streaming':
                      return (
                        <div key={callId} className="mx-4 mb-2 rounded-2xl border border-gray-200 bg-gray-50/50 dark:bg-gray-950/20 dark:border-gray-800/30 text-gray-600 dark:text-gray-400 ring-1 ring-gray-200/20 shadow-sm p-4">
                          <div className="flex items-center gap-2">
                            <LoaderIcon className="w-4 h-4 animate-spin" />
                            <span className="text-sm">Generating plan...</span>
                          </div>
                        </div>
                      )
                    case 'input-available':
                      return (
                        <PlanView
                          key={callId}
                          plan={(part as any).input}
                          toolCallId={callId}
                          addToolResult={addToolResult}
                        />
                      )
                    case 'output-available':
                      return (
                        <div key={callId} className="mx-4 mb-2 rounded-2xl border border-green-200 bg-green-50/50 dark:bg-green-950/20 dark:border-green-800/30 ring-1 ring-green-200/20 shadow-sm p-4">
                          <div className="text-sm text-green-600 dark:text-green-400">
                            ✅ Plan submitted successfully
                          </div>
                        </div>
                      )
                    case 'output-error':
                      return (
                        <div key={callId} className="mx-4 mb-2 rounded-2xl border border-red-200 bg-red-50/50 dark:bg-red-950/20 dark:border-red-800/30 ring-1 ring-red-200/20 shadow-sm p-4">
                          <div className="text-sm text-red-600 dark:text-red-400">{part.errorText}</div>
                        </div>
                      )
                  }
                  break
                }

                case 'tool-conduct_research': {
                  const callId = part.toolCallId
                  switch (part.state) {
                    case 'input-streaming':
                      return (
                        <div key={callId} className="mx-4 mb-2 rounded-2xl border border-gray-200 bg-gray-50/50 dark:bg-gray-950/20 dark:border-gray-800/30 text-gray-600 dark:text-gray-400 ring-1 ring-gray-200/20 shadow-sm p-4">
                          <div className="flex items-center gap-2">
                            <LoaderIcon className="w-4 h-4 animate-spin" />
                            <span className="text-sm">Preparing research form...</span>
                          </div>
                        </div>
                      )
                    case 'input-available':
                      return (
                        <ResearchForm
                          key={callId}
                          input={(part as any).input}
                          toolCallId={callId}
                          addToolResult={addToolResult}
                        />
                      )

                    case 'output-available': {
                      const out = (part as any).output
                      if (typeof out === 'object') {
                        return (
                          <div key={callId} className="mx-4 mb-2 rounded-2xl border border-green-200 bg-green-50/50 dark:bg-green-950/20 dark:border-green-800/30 ring-1 ring-green-200/20 shadow-sm p-4">
                            <div className="text-sm text-green-600 dark:text-green-400">
                              ✅ Topic submitted
                            </div>
                          </div>
                        )
                      }
                      return (
                        <div key={callId} className="mx-4 mb-2 rounded-2xl border border-green-200 bg-green-50/50 dark:bg-green-950/20 dark:border-green-800/30 ring-1 ring-green-200/20 shadow-sm p-4">
                          <div className="text-sm text-green-600 dark:text-green-400">
                            ✅ Research completed
                          </div>
                          <pre className="mt-2 whitespace-pre-wrap text-sm text-foreground">
                            {out}
                          </pre>
                        </div>
                      )
                    }
                    case 'output-error':
                      return (
                        <div key={callId} className="mx-4 mb-2 rounded-2xl border border-red-200 bg-red-50/50 dark:bg-red-950/20 dark:border-red-800/30 ring-1 ring-red-200/20 shadow-sm p-4">
                          <div className="text-sm text-red-600 dark:text-red-400">{part.errorText}</div>
                        </div>
                      )
                  }
                  break
                }


                default:
                  if (typeof part.type === 'string' && part.type.startsWith('tool-')) {
                    const callId = (part as any).toolCallId
                    return (
                      <div key={callId} className="mx-4 mb-2 p-4 border rounded-lg">
                        <div className="text-sm font-medium">Unknown tool: {part.type.replace('tool-', '')}</div>
                        <pre className="text-xs mt-2 text-gray-600">{JSON.stringify(part, null, 2)}</pre>
                      </div>
                    )
                  }
                  return null
              }
            })}
          </div>
        </div>
      ))}
      {status === 'streaming' && (
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <LoaderIcon strokeWidth={2} className="animate-spin w-4 h-4" />
          <span>Generating...</span>
        </div>
      )}
    </div>
  )
}
