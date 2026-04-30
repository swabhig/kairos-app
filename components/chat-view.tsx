"use client"

import type React from "react"

import { useEffect, useRef, useState, useMemo } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Link2, Youtube, ExternalLink, Send, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ActiveConversation, KairosUser } from "@/components/kairos-app"

function extractAuthorName(conversation: ActiveConversation): string {
  // If we have an explicit author name, use first name only
  if (conversation.author_name) {
    return conversation.author_name.split(" ")[0]
  }
  
  // Try to extract from title (common patterns: "Name - Title", "Title | Name", "Title by Name")
  const title = conversation.source_title || conversation.title || ""
  
  // Pattern: "by Name" at the end
  const byMatch = title.match(/\bby\s+([A-Z][a-z]+)/i)
  if (byMatch) return byMatch[1]
  
  // Pattern: "Name's Newsletter" or "Name's Podcast"
  const possessiveMatch = title.match(/^([A-Z][a-z]+)'s\s/i)
  if (possessiveMatch) return possessiveMatch[1]
  
  // Pattern: "The Name Show" or similar
  const showMatch = title.match(/^The\s+([A-Z][a-z]+)\s+(Show|Podcast|Newsletter)/i)
  if (showMatch) return showMatch[1]
  
  // Fallback: first word if it looks like a name (capitalized, not common words)
  const commonWords = ["the", "a", "an", "how", "what", "why", "when", "where", "top", "best", "new", "your", "my"]
  const firstWord = title.split(/[\s\-|:]+/)[0]
  if (firstWord && /^[A-Z][a-z]+$/.test(firstWord) && !commonWords.includes(firstWord.toLowerCase())) {
    return firstWord
  }
  
  return "Author"
}

export function ChatView({ conversation, user }: { conversation: ActiveConversation; user: KairosUser }) {
  const [input, setInput] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)
  
  const authorName = useMemo(() => extractAuthorName(conversation), [conversation])

  const { messages, sendMessage, status, error } = useChat({
    id: conversation.id,
    messages: conversation.messages,
    transport: new DefaultChatTransport({
      api: "/api/chat",
      prepareSendMessagesRequest: ({ messages }) => ({
        body: { messages, conversationId: conversation.id },
      }),
    }),
  })

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" })
  }, [messages, status])

  const busy = status === "submitted" || status === "streaming"

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const text = input.trim()
    if (!text || busy) return
    setInput("")
    sendMessage({ text })
  }

  const SourceIcon = conversation.source_type === "youtube" ? Youtube : Link2

  const suggestions =
    messages.length === 0
      ? [
          "Summarize the key ideas in 5 bullets.",
          "What's the strongest argument? Any weak spots?",
          "Quote the most important passage and explain why.",
        ]
      : []

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Source header */}
      <div className="shrink-0 border-b border-border bg-card/40 px-4 py-3 md:px-6">
        <div className="mx-auto flex max-w-3xl items-start gap-3">
          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary">
            <SourceIcon className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-sm font-medium text-foreground">{conversation.title}</h2>
            <a
              href={conversation.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <span className="truncate">{conversation.source_url}</span>
              <ExternalLink className="h-3 w-3 shrink-0" aria-hidden="true" />
            </a>
          </div>
          <Link
            href="/"
            className="hidden shrink-0 items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground md:flex"
          >
            <span aria-hidden="true">&larr;</span> home
          </Link>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-8 md:px-6">
          {messages.length === 0 ? (
            <div className="flex flex-col gap-3 rounded-lg border border-dashed border-border bg-card/40 p-5">
              <p className="text-sm leading-relaxed text-muted-foreground">
                {user.name ? `Hey ${user.name.split(" ")[0]}, ask` : "Ask"} {authorName} anything about this {conversation.source_type === "youtube" ? "video" : "article"}.
              </p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => sendMessage({ text: s })}
                    className="rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {messages.map((m) => (
            <MessageBubble key={m.id} message={m} user={user} authorName={authorName} />
          ))}

          {busy && messages[messages.length - 1]?.role === "user" ? (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
              {authorName} is thinking...
            </div>
          ) : null}

          {error ? (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error.message || "Something went wrong."}
            </div>
          ) : null}
        </div>
      </div>

      {/* Composer */}
      <div className="shrink-0 border-t border-border bg-card/40 px-4 py-4 md:px-6">
        <form onSubmit={handleSubmit} className="mx-auto flex max-w-3xl items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSubmit(e as unknown as React.FormEvent)
              }
            }}
            placeholder={`Ask ${authorName} > your question...`}
            rows={1}
            disabled={busy}
            aria-label="Message"
            className="min-h-10 max-h-48 flex-1 resize-none rounded-md border border-input bg-background px-3 py-2.5 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
          />
          <Button type="submit" disabled={busy || !input.trim()} size="icon" aria-label="Send message">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </div>
    </div>
  )
}

function MessageBubble({
  message,
  user,
  authorName,
}: {
  message: { id: string; role: string; parts?: Array<{ type: string; text?: string }> }
  user: KairosUser
  authorName: string
}) {
  const isUser = message.role === "user"
  const text =
    message.parts
      ?.filter((p): p is { type: "text"; text: string } => p.type === "text" && typeof p.text === "string")
      .map((p) => p.text)
      .join("") || ""

  return (
    <div className={cn("flex items-start gap-3", isUser && "flex-row-reverse")}>
      <div
        className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full text-xs font-medium",
          isUser ? "bg-accent text-foreground" : "bg-primary text-primary-foreground",
        )}
        aria-hidden="true"
      >
        {isUser ? (
          user.avatar ? (
            <img src={user.avatar || "/placeholder.svg"} alt="" className="h-full w-full object-cover" />
          ) : (
            (user.name || user.email || "?").slice(0, 1).toUpperCase()
          )
        ) : (
          authorName.slice(0, 1).toUpperCase()
        )}
      </div>
      <div
        className={cn(
          "max-w-[85%] rounded-lg px-4 py-3 text-sm leading-relaxed",
          isUser ? "bg-accent text-foreground" : "bg-card text-card-foreground border border-border",
        )}
      >
        <div className="whitespace-pre-wrap break-words">{text}</div>
      </div>
    </div>
  )
}
