"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Sparkles, Link2, Youtube, MessageSquare, ArrowRight } from "lucide-react"
import { GoogleIcon } from "@/components/google-icon"

export function Landing() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleGoogleSignIn() {
    setLoading(true)
    setError(null)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ?? `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not sign in with Google.")
      setLoading(false)
    }
  }

  return (
    <main className="relative flex min-h-screen flex-col bg-background">
      <header className="flex items-center justify-between px-6 py-5 md:px-10">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
          </div>
          <span className="font-mono text-sm tracking-wide text-foreground">KAIROS</span>
        </div>
        <Button variant="ghost" size="sm" onClick={handleGoogleSignIn} disabled={loading}>
          Sign in
        </Button>
      </header>

      <section className="relative flex flex-1 flex-col items-center justify-center px-6 py-20 md:py-28">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/3 -z-0 h-[32rem] w-[32rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl"
        />

        <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-col items-center text-center">
          <span className="mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
            MVP — Blogs & YouTube
          </span>

          <h1 className="flex flex-col items-center gap-3 text-balance tracking-tight text-foreground md:gap-4">
            <span className="text-6xl font-semibold leading-[0.95] md:text-8xl">Chat with</span>
            <span className="relative inline-block font-[family-name:var(--font-cursive)] text-5xl font-normal leading-[1.1] text-primary md:text-7xl">
              <span className="relative z-10 px-2">timeless wisdom</span>
              <span
                aria-hidden="true"
                className="absolute inset-x-0 bottom-2 -z-0 h-4 bg-primary/30 md:bottom-3 md:h-6"
              />
            </span>
          </h1>

          <p className="mt-8 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground md:text-lg">
            Turn any article or video into dialogue.
          </p>

          <div className="mt-12 flex flex-col items-center gap-4">
            <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Sign in to continue
            </span>
            <Button
              onClick={handleGoogleSignIn}
              disabled={loading}
              size="lg"
              className="gap-3 bg-foreground px-6 text-background shadow-lg shadow-primary/10 ring-1 ring-border transition-transform hover:-translate-y-0.5 hover:bg-foreground/90"
            >
              <GoogleIcon className="h-4 w-4" />
              {loading ? "Redirecting to Google..." : "Continue with Google"}
            </Button>
            {error ? (
              <p className="text-xs text-destructive" role="alert">
                {error}
              </p>
            ) : null}
          </div>
        </div>

        <ol className="mx-auto mt-20 flex w-full max-w-4xl flex-col items-stretch gap-4 md:flex-row md:items-center md:gap-2">
          <Step
            number="01"
            icon={<Link2 className="h-4 w-4" />}
            title="Paste a source"
            body="A blog URL or YouTube link with captions."
          />
          <StepArrow />
          <Step
            number="02"
            icon={<Youtube className="h-4 w-4" />}
            title="We parse it"
            body="Article text or transcript, ready to explore."
          />
          <StepArrow />
          <Step
            number="03"
            icon={<MessageSquare className="h-4 w-4" />}
            title="Start the dialogue"
            body="Ask, summarize, counter-argue — grounded in the source."
          />
        </ol>
      </section>

      <footer className="border-t border-border px-6 py-6 text-center text-xs text-muted-foreground md:px-10">
        An effort to give back to the CS community. For feedback, connect on{" "}
        <a
          href="https://wa.me/919810040184"
          target="_blank"
          rel="noopener noreferrer"
          className="text-foreground underline underline-offset-4 hover:text-primary"
        >
          WhatsApp
        </a>
        .
      </footer>
    </main>
  )
}

function Step({
  number,
  icon,
  title,
  body,
}: {
  number: string
  icon: React.ReactNode
  title: string
  body: string
}) {
  return (
    <li className="flex flex-1 flex-col gap-3 rounded-lg border border-border bg-card p-5 text-left">
      <div className="flex items-center justify-between">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent text-primary">{icon}</div>
        <span className="font-mono text-xs text-muted-foreground">{number}</span>
      </div>
      <h3 className="text-sm font-medium text-foreground">{title}</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
    </li>
  )
}

function StepArrow() {
  return (
    <li
      aria-hidden="true"
      className="flex shrink-0 items-center justify-center text-muted-foreground md:px-1"
    >
      <ArrowRight className="h-5 w-5 rotate-90 md:rotate-0" />
    </li>
  )
}
