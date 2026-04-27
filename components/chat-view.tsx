"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { Button } from "@/components/ui/button"
import { Link2, Youtube, ExternalLink, Send, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ActiveConversation, KairosUser } from "@/components/kairos-app"

export function ChatView({ conversation, user }: { conversation: ActiveConversation; user: KairosUser }) {
  const [input, setInput] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)

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
    // Auto-scroll to bottom as new tokens stream in
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
      {/* Source header — fixed, never scrolls */}
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
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-8 md:px-6">
          {messages.length === 0 ? (
            <div className="flex flex-col gap-3 rounded-lg border border-dashed border-border bg-card/40 p-5">
              <p className="text-sm leading-relaxed text-muted-foreground">
                Ask anything about this {conversation.source_type === "youtube" ? "video" : "article"}. Every answer
                will be grounded in the content you provided.
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
            <MessageBubble key={m.id} message={m} user={user} />
          ))}

          {busy && messages[messages.length - 1]?.role === "user" ? (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
              Verbe is thinking...
            </div>
          ) : null}

          {error ? (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error.message || "Something went wrong."}
            </div>
          ) : null}
        </div>
      </div>

      {/* Composer — fixed, never scrolls */}
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
            placeholder="Ask Verbe about this source..."
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
}: {
  message: { id: string; role: string; parts?: Array<{ type: string; text?: string }> }
  user: KairosUser
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
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.avatar || "/placeholder.svg"} alt="" className="h-full w-full object-cover" />
          ) : (
            (user.name || user.email || "?").slice(0, 1).toUpperCase()
          )
        ) : (
          "V"
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
