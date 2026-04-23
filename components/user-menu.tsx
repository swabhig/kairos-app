"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut } from "lucide-react"
import type { KairosUser } from "@/components/kairos-app"

export function UserMenu({ user, compact = false }: { user: KairosUser; compact?: boolean }) {
  const [loading, setLoading] = useState(false)

  async function handleSignOut() {
    setLoading(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = "/"
  }

  const initials = (user.name || user.email || "?").slice(0, 1).toUpperCase()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={
            compact
              ? "h-9 gap-2 px-2"
              : "h-auto w-full justify-start gap-3 rounded-md px-2 py-2 text-left hover:bg-accent"
          }
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/20 text-xs font-medium text-primary">
            {user.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.avatar || "/placeholder.svg"} alt="" className="h-full w-full object-cover" />
            ) : (
              initials
            )}
          </span>
          {!compact ? (
            <span className="flex min-w-0 flex-col">
              <span className="truncate text-sm text-foreground">{user.name ?? user.email ?? "Signed in"}</span>
              {user.email && user.name ? (
                <span className="truncate text-xs text-muted-foreground">{user.email}</span>
              ) : null}
            </span>
          ) : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="truncate">{user.email ?? user.name}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} disabled={loading}>
          <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
