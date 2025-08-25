import { useState } from 'react'
import type { PlanSchema } from '@/lib/schema'
import { CheckCircle2, ListTree, Plus, Minus, Edit2, Check, X } from 'lucide-react'

interface PlanFormProps {
  plan: PlanSchema
  toolCallId: string
  addToolResult: (result: {
    tool: string;
    toolCallId: string;
    output: any;
  }) => void
}

export function PlanView({
  plan,
  toolCallId,
  addToolResult,
}: PlanFormProps) {
  const [editedPlan, setEditedPlan] = useState(plan)
  const [isEditing, setIsEditing] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [showFeedback, setShowFeedback] = useState(false)
  
  const hasContent = Array.isArray(editedPlan.plan) && editedPlan.plan.length > 0

  const handleApprovePlan = () => {
    addToolResult({
      tool: 'generate_plan',
      toolCallId,
      output: {
        action: 'approved',
        plan: editedPlan
      }
    })
  }

  const handleRequestChanges = () => {
    if (!feedback.trim()) return
    addToolResult({
      tool: 'generate_plan',
      toolCallId,
      output: {
        action: 'request_changes',
        feedback: feedback.trim(),
        plan: editedPlan
      }
    })
  }

  const handleSubmitModified = () => {
    addToolResult({
      tool: 'generate_plan',
      toolCallId,
      output: {
        action: 'modified',
        plan: editedPlan
      }
    })
  }

  return (
    <section className="w-full rounded-2xl border bg-accent/30 dark:bg-white/5 text-accent-foreground dark:text-muted-foreground ring-1 ring-primary/10 shadow-sm">
      <header className="px-4 pt-4 pb-2 flex items-start justify-between">
        <div className="flex items-start gap-2">
          <div className="mt-0.5 text-primary">
            <ListTree className="w-5 h-5" />
          </div>
          <div className="flex-1">
            {isEditing ? (
              <input
                type="text"
                className="text-sm font-semibold bg-background/50 border rounded px-2 py-1 text-foreground"
                value={editedPlan.title || ''}
                onChange={(e) => setEditedPlan({...editedPlan, title: e.target.value})}
                placeholder="Plan title..."
              />
            ) : (
              <h3 className="text-sm font-semibold text-foreground">{editedPlan.title}</h3>
            )}
            {isEditing ? (
              <textarea
                className="text-xs bg-background/50 border rounded px-2 py-1 mt-1 w-full text-muted-foreground"
                value={editedPlan.description || ''}
                onChange={(e) => setEditedPlan({...editedPlan, description: e.target.value})}
                placeholder="Plan description..."
                rows={2}
              />
            ) : (
              editedPlan.description && (
                <p className="text-xs text-muted-foreground mt-0.5">{editedPlan.description}</p>
              )
            )}
          </div>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="text-primary hover:bg-primary/10 p-1 rounded"
        >
          {isEditing ? <Check className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
        </button>
      </header>

      <div className="px-4 pb-4">
        {!hasContent ? (
          <p className="text-sm text-muted-foreground">No plan available yet.</p>
        ) : (
          <ol className="space-y-3">
            {editedPlan.plan!.map((item, index) => {
              const moduleName = item?.module?.module_name || `Module ${index + 1}`
              const submodules = item?.module?.submodule_names || []

              return (
                <li
                  key={`${moduleName}-${index}`}
                  className="rounded-xl border bg-background/40 dark:bg-white/5 p-3"
                >
                  <div className="flex items-start gap-2">
                    <span className="inline-flex items-center justify-center shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary text-[11px] font-semibold">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      {isEditing ? (
                        <input
                          type="text"
                          className="text-sm font-medium bg-background/50 border rounded px-2 py-1 text-foreground w-full"
                          value={moduleName}
                          onChange={(e) => {
                            const newPlan = [...editedPlan.plan!]
                            newPlan[index] = {
                              module: {
                                module_name: e.target.value,
                                submodule_names: submodules
                              }
                            }
                            setEditedPlan({...editedPlan, plan: newPlan})
                          }}
                        />
                      ) : (
                        <div className="text-sm font-medium text-foreground">
                          {moduleName}
                        </div>
                      )}
                      
                      {submodules.length > 0 && (
                        <ul className="mt-2 space-y-1">
                          {submodules.map((sub, i) => (
                            <li key={`${moduleName}-sub-${i}`} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 text-primary/70" />
                              {isEditing ? (
                                <div className="flex-1 flex gap-1">
                                  <input
                                    type="text"
                                    className="text-sm bg-background/50 border rounded px-2 py-0.5 flex-1"
                                    value={sub}
                                    onChange={(e) => {
                                      const newPlan = [...editedPlan.plan!]
                                      const newSubmodules = [...submodules]
                                      newSubmodules[i] = e.target.value
                                      newPlan[index] = {
                                        module: {
                                          module_name: moduleName,
                                          submodule_names: newSubmodules
                                        }
                                      }
                                      setEditedPlan({...editedPlan, plan: newPlan})
                                    }}
                                  />
                                  <button
                                    onClick={() => {
                                      const newPlan = [...editedPlan.plan!]
                                      const newSubmodules = submodules.filter((_, idx) => idx !== i)
                                      newPlan[index] = {
                                        module: {
                                          module_name: moduleName,
                                          submodule_names: newSubmodules
                                        }
                                      }
                                      setEditedPlan({...editedPlan, plan: newPlan})
                                    }}
                                    className="text-red-500 hover:bg-red-500/10 p-0.5 rounded"
                                  >
                                    <Minus className="w-3 h-3" />
                                  </button>
                                </div>
                              ) : (
                                <span>{sub}</span>
                              )}
                            </li>
                          ))}
                          {isEditing && (
                            <li className="flex items-center gap-2 text-sm">
                              <div className="w-3.5 h-3.5" />
                              <button
                                onClick={() => {
                                  const newPlan = [...editedPlan.plan!]
                                  const newSubmodules = [...submodules, 'New submodule']
                                  newPlan[index] = {
                                    module: {
                                      module_name: moduleName,
                                      submodule_names: newSubmodules
                                    }
                                  }
                                  setEditedPlan({...editedPlan, plan: newPlan})
                                }}
                                className="text-primary hover:bg-primary/10 p-1 rounded flex items-center gap-1"
                              >
                                <Plus className="w-3 h-3" />
                                <span>Add submodule</span>
                              </button>
                            </li>
                          )}
                        </ul>
                      )}
                      
                      {isEditing && submodules.length === 0 && (
                        <button
                          onClick={() => {
                            const newPlan = [...editedPlan.plan!]
                            newPlan[index] = {
                              module: {
                                module_name: moduleName,
                                submodule_names: ['New submodule']
                              }
                            }
                            setEditedPlan({...editedPlan, plan: newPlan})
                          }}
                          className="text-primary hover:bg-primary/10 p-1 rounded flex items-center gap-1 mt-2"
                        >
                          <Plus className="w-3 h-3" />
                          <span className="text-xs">Add submodule</span>
                        </button>
                      )}
                    </div>
                    
                    {isEditing && (
                      <button
                        onClick={() => {
                          const newPlan = editedPlan.plan!.filter((_, idx) => idx !== index)
                          setEditedPlan({...editedPlan, plan: newPlan})
                        }}
                        className="text-red-500 hover:bg-red-500/10 p-1 rounded"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </li>
              )
            })}
            
            {isEditing && (
              <li>
                <button
                  onClick={() => {
                    const newPlan = [...editedPlan.plan!, {
                      module: {
                        module_name: 'New Module',
                        submodule_names: []
                      }
                    }]
                    setEditedPlan({...editedPlan, plan: newPlan})
                  }}
                  className="w-full text-primary hover:bg-primary/10 p-3 rounded-xl border border-dashed border-primary/30 flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Module</span>
                </button>
              </li>
            )}
          </ol>
        )}
        
        {/* Action Buttons */}
        <div className="mt-4 flex gap-2 flex-wrap">
          <button
            onClick={handleApprovePlan}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            Approve Plan
          </button>
          
          <button
            onClick={() => setShowFeedback(!showFeedback)}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Request Changes
          </button>
          
          {isEditing && (
            <button
              onClick={handleSubmitModified}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              Submit Modified Plan
            </button>
          )}
        </div>
        
        {/* Feedback textarea */}
        {showFeedback && (
          <div className="mt-3 space-y-2">
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Please describe what changes you'd like to see in the plan..."
              className="w-full p-3 border rounded-lg bg-background/50 text-foreground placeholder:text-muted-foreground"
              rows={3}
            />
            <button
              onClick={handleRequestChanges}
              disabled={!feedback.trim()}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium"
            >
              Submit Feedback
            </button>
          </div>
        )}
      </div>
    </section>
  )
}


