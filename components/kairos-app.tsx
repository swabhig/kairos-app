"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { ConversationSidebar, type ConversationSummary } from "@/components/conversation-sidebar"
import { SourceInput } from "@/components/source-input"
import { ChatView } from "@/components/chat-view"
import { UserMenu } from "@/components/user-menu"
import type { UIMessage } from "ai"

export type KairosUser = {
  id: string
  email: string | null
  name: string | null
  avatar: string | null
}

export type ActiveConversation = {
  id: string
  title: string
  source_type: "url" | "youtube"
  source_url: string
  source_title: string | null
  author_name: string | null
  messages: UIMessage[]
}

export function KairosApp({
  user,
  initialConversations,
}: {
  user: KairosUser
  initialConversations: ConversationSummary[]
}) {
  const [conversations, setConversations] = useState<ConversationSummary[]>(initialConversations)
  const [active, setActive] = useState<ActiveConversation | null>(null)
  const [loadingConvoId, setLoadingConvoId] = useState<string | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  async function handleSelect(id: string) {
    if (active?.id === id) return
    setLoadingConvoId(id)
    try {
      const res = await fetch(`/api/conversations/${id}`)
      if (!res.ok) throw new Error("Failed to load conversation")
      const { conversation } = (await res.json()) as {
        conversation: {
          id: string
          title: string
          source_type: "url" | "youtube"
          source_url: string
          source_title: string | null
          author_name: string | null
          messages: UIMessage[]
        }
      }
      setActive({
        id: conversation.id,
        title: conversation.title,
        source_type: conversation.source_type,
        source_url: conversation.source_url,
        source_title: conversation.source_title,
        author_name: conversation.author_name,
        messages: conversation.messages ?? [],
      })
    } catch (e) {
      console.log("[v0] failed to load conversation", e)
    } finally {
      setLoadingConvoId(null)
    }
  }

  function handleNew() {
    setActive(null)
  }

  async function handleDelete(id: string) {
    const prev = conversations
    setConversations((c) => c.filter((x) => x.id !== id))
    if (active?.id === id) setActive(null)
    try {
      const res = await fetch(`/api/conversations/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
    } catch {
      setConversations(prev) // rollback
    }
  }

  function handleCreated(convo: {
    id: string
    title: string
    source_type: "url" | "youtube"
    source_url: string
    source_title: string | null
    author_name: string | null
    created_at: string
  }) {
    const summary: ConversationSummary = {
      id: convo.id,
      title: convo.title,
      source_type: convo.source_type,
      source_url: convo.source_url,
      created_at: convo.created_at,
      updated_at: convo.created_at,
    }
    setConversations((c) => [summary, ...c])
    setActive({
      id: convo.id,
      title: convo.title,
      source_type: convo.source_type,
      source_url: convo.source_url,
      source_title: convo.source_title,
      author_name: convo.author_name,
      messages: [],
    })
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile menu backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Sidebar Overlay */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 transform border-r border-border bg-sidebar transition-transform md:hidden ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <ConversationSidebar
          user={user}
          conversations={conversations}
          activeId={active?.id ?? null}
          loadingId={loadingConvoId}
          onSelect={(id) => {
            handleSelect(id)
            setMobileMenuOpen(false)
          }}
          onNew={() => {
            handleNew()
            setMobileMenuOpen(false)
          }}
          onDelete={handleDelete}
        />
      </div>

      {/* Desktop Sidebar - Always visible */}
      <ConversationSidebar
        user={user}
        conversations={conversations}
        activeId={active?.id ?? null}
        loadingId={loadingConvoId}
        onSelect={handleSelect}
        onNew={handleNew}
        onDelete={handleDelete}
      />

      <main className="flex min-h-0 flex-1 flex-col">
        {/* Mobile header */}
        <header className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3 md:px-6 md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <Link href="/" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
            <span aria-hidden="true">&larr;</span> home
          </Link>
          <UserMenu user={user} compact />
        </header>

        {active ? (
          <ChatView key={active.id} conversation={active} user={user} />
        ) : (
          <SourceInput onCreated={handleCreated} userName={user.name} />
        )}
      </main>
    </div>
  )
}
