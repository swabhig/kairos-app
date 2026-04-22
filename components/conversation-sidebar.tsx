"use client"

import { Button } from "@/components/ui/button"
import { Plus, Sparkles, Link2, Youtube, Trash2, Loader2 } from "lucide-react"
import { UserMenu } from "@/components/user-menu"
import type { KairosUser } from "@/components/kairos-app"
import { cn } from "@/lib/utils"

export type ConversationSummary = {
  id: string
  title: string
  source_type: "url" | "youtube"
  source_url: string
  created_at: string
  updated_at: string
}

export function ConversationSidebar({
  user,
  conversations,
  activeId,
  loadingId,
  onSelect,
  onNew,
  onDelete,
}: {
  user: KairosUser
  conversations: ConversationSummary[]
  activeId: string | null
  loadingId: string | null
  onSelect: (id: string) => void
  onNew: () => void
  onDelete: (id: string) => void
}) {
  return (
    <aside className="hidden w-72 shrink-0 flex-col border-r border-border bg-sidebar md:flex">
      <div className="flex items-center gap-2 px-4 py-5">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
        </div>
        <span className="font-mono text-sm tracking-wide text-sidebar-foreground">KAIROS</span>
      </div>

      <div className="px-3">
        <Button onClick={onNew} className="w-full justify-start gap-2" variant="secondary" size="sm">
          <Plus className="h-4 w-4" aria-hidden="true" />
          New conversation
        </Button>
      </div>

      <div className="mt-4 px-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">Saved</div>

      <nav className="mt-2 flex-1 overflow-y-auto px-2 pb-4" aria-label="Saved conversations">
        {conversations.length === 0 ? (
          <div className="px-3 py-6 text-xs leading-relaxed text-muted-foreground">
            Your parsed articles and videos will appear here.
          </div>
        ) : (
          <ul className="flex flex-col gap-1">
            {conversations.map((c) => {
              const Icon = c.source_type === "youtube" ? Youtube : Link2
              const isActive = c.id === activeId
              const isLoading = c.id === loadingId
              return (
                <li key={c.id}>
                  <div
                    className={cn(
                      "group flex items-start gap-2 rounded-md px-2 py-2 transition-colors",
                      isActive ? "bg-accent" : "hover:bg-accent/60",
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => onSelect(c.id)}
                      className="flex flex-1 items-start gap-2 text-left"
                    >
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center text-primary">
                        {isLoading ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                        ) : (
                          <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="line-clamp-2 text-sm leading-snug text-sidebar-foreground">{c.title}</span>
                        <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                          {new URL(c.source_url).hostname.replace(/^www\./, "")}
                        </span>
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        if (confirm("Delete this conversation?")) onDelete(c.id)
                      }}
                      aria-label="Delete conversation"
                      className="opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </nav>

      <div className="border-t border-sidebar-border p-2">
        <UserMenu user={user} />
      </div>
    </aside>
  )
}
