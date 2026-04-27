"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Sparkles, Link2, Youtube, ArrowRight, Loader2 } from "lucide-react"

type CreatedConversation = {
  id: string
  title: string
  source_type: "url" | "youtube"
  source_url: string
  source_title: string | null
  created_at: string
}

export function SourceInput({ onCreated }: { onCreated: (c: CreatedConversation) => void }) {
  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isYoutube = /(?:youtube\.com|youtu\.be)/i.test(url)
  const Icon = isYoutube ? Youtube : Link2

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!url.trim()) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      })
      const data = (await res.json()) as { conversation?: CreatedConversation; error?: string }
      if (!res.ok || !data.conversation) {
        throw new Error(data.error || "Could not parse that URL.")
      }
      setUrl("")
      onCreated(data.conversation)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="flex flex-1 flex-col items-center justify-center px-4 py-10 md:px-8">
      <div className="flex w-full max-w-2xl flex-col items-center text-center">
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
          <Sparkles className="h-5 w-5" aria-hidden="true" />
        </div>

        <h1 className="text-balance text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
          What do you want to understand today?
        </h1>
        <p className="mt-3 max-w-lg text-pretty text-sm leading-relaxed text-muted-foreground md:text-base">
          Paste a blog post URL or a YouTube link. Verbe will parse it and open a conversation grounded in the
          source.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 w-full">
          <InputGroup className="h-11">
            <InputGroupAddon>
              <Icon className="h-4 w-4" aria-hidden="true" />
            </InputGroupAddon>
            <InputGroupInput
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/article or https://youtu.be/..."
              required
              disabled={loading}
              aria-label="Source URL"
            />
            <InputGroupAddon align="inline-end">
              <Button type="submit" size="sm" disabled={loading || !url.trim()} className="gap-1.5">
                {loading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                    Parsing
                  </>
                ) : (
                  <>
                    Start
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </>
                )}
              </Button>
            </InputGroupAddon>
          </InputGroup>
        </form>

        {error ? (
          <p className="mt-4 text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}

        <div className="mt-8 grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
          <Hint
            icon={<Link2 className="h-3.5 w-3.5" />}
            label="Articles & blogs"
            body="We extract the main body of the page — essays, posts, long reads."
          />
          <Hint
            icon={<Youtube className="h-3.5 w-3.5" />}
            label="YouTube videos"
            body="We pull the transcript from videos that have captions enabled."
          />
        </div>
      </div>
    </section>
  )
}

function Hint({ icon, label, body }: { icon: React.ReactNode; label: string; body: string }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border bg-card/60 p-4 text-left">
      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-accent text-primary">
        {icon}
      </span>
      <span>
        <span className="block text-sm font-medium text-foreground">{label}</span>
        <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">{body}</span>
      </span>
    </div>
  )
}
