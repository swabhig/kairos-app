"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Sparkles, Link2, Youtube, ArrowRight, Loader2 } from "lucide-react"
import { Progress } from "@/components/ui/progress"

type CreatedConversation = {
  id: string
  title: string
  source_type: "url" | "youtube"
  source_url: string
  source_title: string | null
  created_at: string
}

type CrawlProgress = {
  current: number
  total: number
  message: string
}

export function SourceInput({ onCreated }: { onCreated: (c: CreatedConversation) => void }) {
  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState<CrawlProgress | null>(null)
  const [error, setError] = useState<string | null>(null)

  const isYoutube = /(?:youtube\.com|youtu\.be)/i.test(url)
  const Icon = isYoutube ? Youtube : Link2

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!url.trim()) return
    setLoading(true)
    setError(null)
    setProgress(null)

    try {
      const res = await fetch("/api/crawl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      })

      if (!res.body) {
        throw new Error("No response body")
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split("\n\n")
        buffer = lines.pop() || ""

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6))

              if (data.type === "progress") {
                setProgress({
                  current: data.current,
                  total: data.total,
                  message: data.message,
                })
              } else if (data.type === "complete") {
                setUrl("")
                setProgress(null)
                onCreated(data.conversation)
                return
              } else if (data.type === "error") {
                throw new Error(data.error)
              }
            } catch (parseErr) {
              // Skip malformed JSON
              if (parseErr instanceof Error && parseErr.message !== "error") {
                throw parseErr
              }
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

  const progressPercent = progress?.total ? Math.round((progress.current / progress.total) * 100) : 0

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
          Paste an author page, blog post, or YouTube link. Kairos will index all their content so you can chat with
          their ideas.
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
              placeholder="https://author.medium.com or https://youtu.be/..."
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

        {progress && (
          <div className="mt-4 w-full space-y-2">
            <Progress value={progressPercent} className="h-2" />
            <p className="text-xs text-muted-foreground">{progress.message}</p>
          </div>
        )}

        {error ? (
          <p className="mt-4 text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}

        <div className="mt-8 grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
          <Hint
            icon={<Link2 className="h-3.5 w-3.5" />}
            label="Author pages & blogs"
            body="We detect index pages and crawl all articles to build a full corpus."
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
