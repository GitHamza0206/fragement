import { LoaderIcon } from 'lucide-react'
import type { UIMessage } from '@/app/actions/server.action.streamUI'
import { useEffect, ReactNode } from 'react'
import { useUIState } from 'ai/rsc'

export function Chat({
  isLoading,
  inlineNode,
}: {
  isLoading: boolean
  inlineNode?: ReactNode
}) {
  const [uiMessages] = useUIState()
  useEffect(() => {
    const chatContainer = document.getElementById('chat-container')
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight
    }
  }, [JSON.stringify(uiMessages), inlineNode ? 1 : 0])

  const conversation = (uiMessages || []) as UIMessage[]

  return (
    <div
      id="chat-container"
      className="flex flex-col pb-12 gap-2 overflow-y-auto max-h-full"
    >
      {conversation.map((message: UIMessage, index: number) => (
        <div
          className={`flex flex-col px-4 shadow-sm whitespace-pre-wrap ${message.role !== 'user' ? 'bg-accent dark:bg-white/5 border text-accent-foreground dark:text-muted-foreground py-4 rounded-2xl gap-4 w-full' : 'bg-gradient-to-b from-black/5 to-black/10 dark:from-black/30 dark:to-black/50 py-2 rounded-xl gap-2 w-fit'} font-serif`}
          key={index}
        >
          {message.display}
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
