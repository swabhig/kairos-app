"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Progress } from "@/components/ui/progress"
import { Sparkles, Link2, ArrowRight, Loader2, FileText } from "lucide-react"

function isYoutubeUrl(url: string): boolean {
  return /(?:youtube\.com|youtu\.be)/i.test(url)
}

type CreatedConversation = {
  id: string
  title: string
  source_type: "url" | "youtube"
  source_url: string
  source_title: string | null
  created_at: string
}

type CrawlProgress = {
  phase: "detecting" | "found" | "parsing" | "saving" | "single" | "complete"
  message: string
  current?: number
  total?: number
  currentTitle?: string
}

export function SourceInput({ onCreated, userName }: { onCreated: (c: CreatedConversation) => void; userName?: string | null }) {
  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState<CrawlProgress | null>(null)

  const Icon = Link2

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!url.trim()) return
    setLoading(true)
    setError(null)
    setProgress(null)

    try {
      // Check for YouTube URLs and show coming soon message
      if (isYoutubeUrl(url)) {
        throw new Error("Looks like you entered a YouTube link — this feature is coming soon! For now, try pasting an article or blog post instead.")
      }

      // For URLs, use the crawl endpoint with SSE
      const res = await fetch("/api/crawl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Could not parse that URL.")
      }

      // Handle SSE stream
      const reader = res.body?.getReader()
      if (!reader) throw new Error("No response stream")

      const decoder = new TextDecoder()
      let buffer = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split("\n")
        buffer = lines.pop() || ""

        let eventType = ""
        for (const line of lines) {
          if (line.startsWith("event: ")) {
            eventType = line.slice(7)
          } else if (line.startsWith("data: ")) {
            const data = JSON.parse(line.slice(6))
            
            if (eventType === "status") {
              setProgress({
                phase: data.phase,
                message: data.message,
                total: data.total,
              })
            } else if (eventType === "progress") {
              setProgress({
                phase: "parsing",
                message: `Parsing article ${data.current} of ${data.total}...`,
                current: data.current,
                total: data.total,
                currentTitle: data.currentTitle,
              })
            } else if (eventType === "complete") {
              setUrl("")
              setProgress(null)
              onCreated(data.conversation)
              return
            } else if (eventType === "error") {
              throw new Error(data.error)
            }
          }
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.")
      setProgress(null)
    } finally {
      setLoading(false)
    }
  }

  const progressPercent = progress?.current && progress?.total 
    ? Math.round((progress.current / progress.total) * 100) 
    : 0

  return (
    <section className="flex flex-1 flex-col items-center justify-center px-4 py-10 md:px-8">
      <div className="flex w-full max-w-2xl flex-col items-center text-center">
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
          <Sparkles className="h-5 w-5" aria-hidden="true" />
        </div>

        <h1 className="text-balance text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
          {userName ? `${userName.split(" ")[0]}, what do you want to explore today? 👋` : "What do you want to explore today?"}
        </h1>
        <p className="mt-3 max-w-lg text-pretty text-sm leading-relaxed text-muted-foreground md:text-base">
          Paste a blog post or newsletter archive. Verbe will parse all articles and open a conversation.
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
              placeholder="https://newsletter.substack.com/archive or any blog post URL..."
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

        {/* Progress indicator */}
        {progress && (
          <div className="mt-4 w-full space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{progress.message}</span>
              {progress.total && progress.total > 1 && (
                <span className="font-medium text-primary">
                  {Math.round(((progress.current || 0) / progress.total) * 100)}%
                </span>
              )}
            </div>
            {progress.total && progress.total > 1 && (
              <Progress value={progressPercent} className="h-2" />
            )}
            {progress.currentTitle && (
              <p className="truncate text-xs text-muted-foreground">
                {progress.currentTitle}
              </p>
            )}
          </div>
        )}

        {error ? (
          <p className="mt-4 text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}

        <div className="mt-8 grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
          <Hint
            icon={<FileText className="h-3.5 w-3.5" />}
            label="Newsletter archives"
            body="Paste a topic or archive page — we crawl all articles."
          />
          <Hint
            icon={<Link2 className="h-3.5 w-3.5" />}
            label="Single articles"
            body="Or paste any blog post URL for a focused conversation."
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
