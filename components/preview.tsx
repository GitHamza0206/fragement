import { DeployDialog } from './deploy-dialog'
import { FragmentCode } from './fragment-code'
import { FragmentPreview } from './fragment-preview'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { ChevronsRight, LoaderCircle } from 'lucide-react'
import { useState } from 'react'
import { UIMessage } from 'ai'

export type PreviewProps = {
  messages: UIMessage[]
  status: string
  sendMessage: (message?: any) => Promise<any>
  addToolResult: (result: { tool: string; toolCallId: string; output: any }) => void
  teamID?: string
  accessToken?: string
}

export const Preview = ({ 
  messages, 
  status, 
  sendMessage, 
  addToolResult,
  teamID,
  accessToken
}: PreviewProps) => {
  const [selectedTab, setSelectedTab] = useState<'code' | 'fragment'>('code')
  const isChatLoading = status === 'streaming'

  return (
    <div className="absolute md:relative z-10 top-0 left-0 shadow-2xl md:rounded-tl-3xl md:rounded-bl-3xl md:border-l md:border-y bg-popover h-full w-full overflow-auto">
      {/* Render messages with tool results - similar to chat.tsx */}
      <div className="flex flex-col pb-4 gap-2 overflow-y-auto max-h-full">
        {messages.map((message: UIMessage) => (
          <div key={message.id}>
            {message.parts?.map((part) => {
              switch (part.type) {
                case 'tool-setup_surface': {
                  const callId = part.toolCallId
                  switch (part.state) {
                    case 'input-streaming':
                    case 'input-available':
                      return (
                        <div key={callId} className="mx-4 mb-2 rounded-2xl border border-gray-200 bg-gray-50/50 dark:bg-gray-950/20 dark:border-gray-800/30 text-gray-600 dark:text-gray-400 ring-1 ring-gray-200/20 shadow-sm p-4">
                          <div className="flex items-center gap-2">
                            <LoaderCircle className="w-4 h-4 animate-spin" />
                            <span className="text-sm">Creating surface...</span>
                          </div>
                        </div>
                      )
                    case 'output-available': {
                      const out = (part as any).output
                      if (out?.success && out?.sandboxResult) {
                        return (
                          <div key={callId} className="mx-4 mb-2 rounded-2xl border border-green-200 bg-green-50/50 dark:bg-green-950/20 dark:border-green-800/30 ring-1 ring-green-200/20 shadow-sm">
                            <div className="px-4 pt-3 pb-2">
                              <div className="text-sm font-semibold text-foreground mb-1">
                                ✅ Surface created successfully
                              </div>
                              {out?.sandboxResult?.url && (
                                <a 
                                  href={out.sandboxResult.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-sm text-blue-600 dark:text-blue-400 underline"
                                >
                                  View in sandbox →
                                </a>
                              )}
                            </div>
                          </div>
                        )
                      }
                      
                      // Show preview tabs for surface data
                      if (out?.data) {
                        return (
                          <div key={callId} className="mx-4 mb-2">
                            <Tabs
                              value={selectedTab}
                              onValueChange={(value) => setSelectedTab(value as 'code' | 'fragment')}
                              className="w-full"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <TabsList className="px-1 py-0 border h-8">
                                  <TabsTrigger
                                    className="font-normal text-xs py-1 px-2 gap-1 flex items-center"
                                    value="code"
                                  >
                                    {isChatLoading && (
                                      <LoaderCircle
                                        strokeWidth={3}
                                        className="h-3 w-3 animate-spin"
                                      />
                                    )}
                                    Code
                                  </TabsTrigger>
                                  <TabsTrigger
                                    disabled={!out?.sandboxResult}
                                    className="font-normal text-xs py-1 px-2 gap-1 flex items-center"
                                    value="fragment"
                                  >
                                    Preview
                                  </TabsTrigger>
                                </TabsList>
                                
                                {out?.sandboxResult && out.sandboxResult.template !== 'code-interpreter-v1' && teamID && accessToken && (
                                  <DeployDialog
                                    url={out.sandboxResult.url!}
                                    sbxId={out.sandboxResult.sbxId!}
                                    teamID={teamID}
                                    accessToken={accessToken}
                                  />
                                )}
                              </div>
                              
                              <div className="border rounded-lg overflow-hidden">
                                <TabsContent value="code" className="m-0 min-h-[300px]">
                                  {out?.data?.content ? (
                                    <FragmentCode
                                      files={[
                                        {
                                          name: out.data.title || 'surface.code',
                                          content: out.data.content,
                                        },
                                      ]}
                                    />
                                  ) : (
                                    <div className="h-[300px] flex items-center justify-center p-8">
                                      <div className="text-center space-y-4 max-w-md">
                                        <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center mx-auto">
                                          <svg 
                                            className="w-8 h-8 text-muted-foreground" 
                                            fill="none" 
                                            stroke="currentColor" 
                                            viewBox="0 0 24 24"
                                          >
                                            <path 
                                              strokeLinecap="round" 
                                              strokeLinejoin="round" 
                                              strokeWidth={2} 
                                              d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" 
                                            />
                                          </svg>
                                        </div>
                                        <div>
                                          <h3 className="font-medium text-foreground mb-2">Code Preview</h3>
                                          <p className="text-sm text-muted-foreground">
                                            Generated code will appear here when surfaces are created.
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </TabsContent>
                                
                                <TabsContent value="fragment" className="m-0 min-h-[300px]">
                                  {out?.sandboxResult ? (
                                    <FragmentPreview result={out.sandboxResult} />
                                  ) : (
                                    <div className="h-[300px] flex items-center justify-center p-8">
                                      <div className="text-center space-y-4 max-w-md">
                                        <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center mx-auto">
                                          <svg 
                                            className="w-8 h-8 text-muted-foreground" 
                                            fill="none" 
                                            stroke="currentColor" 
                                            viewBox="0 0 24 24"
                                          >
                                            <path 
                                              strokeLinecap="round" 
                                              strokeLinejoin="round" 
                                              strokeWidth={2} 
                                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
                                            />
                                            <path 
                                              strokeLinecap="round" 
                                              strokeLinejoin="round" 
                                              strokeWidth={2} 
                                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" 
                                            />
                                          </svg>
                                        </div>
                                        <div>
                                          <h3 className="font-medium text-foreground mb-2">Live Preview</h3>
                                          <p className="text-sm text-muted-foreground">
                                            Interactive preview will appear here when a surface is running.
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </TabsContent>
                              </div>
                            </Tabs>
                          </div>
                        )
                      }
                      return null
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
                  return null
              }
            })}
          </div>
        ))}
        
        {status === 'streaming' && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground mx-4">
            <LoaderCircle strokeWidth={2} className="animate-spin w-4 h-4" />
            <span>Processing...</span>
          </div>
        )}
      </div>
    </div>
  )
}