import type { FragmentSchema } from '@/lib/schema'
import { CheckCircle2, ListTree } from 'lucide-react'

export function PlanView({
  title,
  description,
  plan,
}: {
  title?: string
  description?: string
  plan: FragmentSchema['plan'] | undefined
}) {
  const hasContent = Array.isArray(plan) && plan.length > 0

  return (
    <section className="w-full rounded-2xl border bg-accent/30 dark:bg-white/5 text-accent-foreground dark:text-muted-foreground ring-1 ring-primary/10 shadow-sm">
      <header className="px-4 pt-4 pb-2 flex items-start gap-2">
        <div className="mt-0.5 text-primary">
          <ListTree className="w-5 h-5" />
        </div>
        <div className="flex-1">
          {title && (
            <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          )}
          {description && (
            <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
          )}
        </div>
      </header>

      <div className="px-4 pb-4">
        {!hasContent ? (
          <p className="text-sm text-muted-foreground">No plan available yet.</p>
        ) : (
          <ol className="space-y-3">
            {plan!.map((item, index) => {
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
                      <div className="text-sm font-medium text-foreground">
                        {moduleName}
                      </div>
                      {submodules.length > 0 && (
                        <ul className="mt-2 space-y-1">
                          {submodules.map((sub, i) => (
                            <li key={`${moduleName}-sub-${i}`} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 text-primary/70" />
                              <span>{sub}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </li>
              )
            })}
          </ol>
        )}
      </div>
    </section>
  )
}


