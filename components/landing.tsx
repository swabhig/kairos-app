"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Sparkles, Link2, Youtube, MessageSquare, ArrowRight, ChevronDown } from "lucide-react"
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
    <main className="relative flex h-screen flex-col overflow-hidden bg-background">
      {/* Premium grid background */}
      <div 
        aria-hidden="true" 
        className="bg-grid-pattern bg-grid-fade pointer-events-none absolute inset-0 -z-10"
      />
      
      <header className="relative z-10 flex shrink-0 items-center justify-between px-6 py-4 md:px-10">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-lg shadow-primary/20">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
          </div>
          <span className="font-mono text-sm font-medium tracking-wide text-foreground">VERBE</span>
        </div>
        <Button variant="ghost" size="sm" onClick={handleGoogleSignIn} disabled={loading}>
          Sign in
        </Button>
      </header>

      <section className="relative z-10 flex flex-1 flex-col items-center justify-center px-6">
        {/* Ambient glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/3 -z-0 h-[32rem] w-[32rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-primary/20 via-primary/10 to-transparent blur-3xl"
        />

        <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-col items-center text-center">
          <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
            MVP — Blogs & YouTube
          </span>

          <h1 className="flex flex-col items-center gap-2 text-balance tracking-tight text-foreground md:gap-3">
            <span className="text-5xl font-semibold leading-[0.95] md:text-7xl">Chat with</span>
            <span className="relative inline-block font-[family-name:var(--font-cursive)] text-4xl font-normal leading-[1.1] text-primary md:text-6xl">
              <span className="relative z-10 px-2">timeless wisdom</span>
              <span
                aria-hidden="true"
                className="absolute inset-x-0 bottom-1 -z-0 h-3 bg-primary/30 md:bottom-2 md:h-5"
              />
            </span>
          </h1>

          <p className="mt-5 max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground md:text-base">
            Turn any article or video into dialogue.
          </p>

          <div className="mt-8 flex flex-col items-center gap-2">
            <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Sign in to continue
            </span>
            <ChevronDown className="h-4 w-4 animate-bounce text-muted-foreground" />
            <Button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="gap-2.5 bg-foreground px-5 text-background shadow-lg shadow-primary/10 ring-1 ring-border transition-transform hover:-translate-y-0.5 hover:bg-foreground/90"
            >
              <GoogleIcon className="h-4 w-4" />
              {loading ? "Redirecting..." : "Continue with Google"}
            </Button>
            {error ? (
              <p className="text-xs text-destructive" role="alert">
                {error}
              </p>
            ) : null}
          </div>
        </div>

        <div className="mx-auto mt-10 hidden w-full max-w-3xl items-center justify-center gap-3 text-xs text-muted-foreground md:flex">
          <span className="flex items-center gap-1.5">
            <Link2 className="h-3.5 w-3.5 text-primary" />
            Paste URL
          </span>
          <ArrowRight className="h-3.5 w-3.5" />
          <span className="flex items-center gap-1.5">
            <Youtube className="h-3.5 w-3.5 text-primary" />
            We parse it
          </span>
          <ArrowRight className="h-3.5 w-3.5" />
          <span className="flex items-center gap-1.5">
            <MessageSquare className="h-3.5 w-3.5 text-primary" />
            Start chatting
          </span>
        </div>
      </section>

      <footer className="shrink-0 border-t border-border px-6 py-4 text-center text-xs text-muted-foreground md:px-10">
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
