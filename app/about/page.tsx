import { Metadata } from "next"
import Link from "next/link"
import { Sparkles } from "lucide-react"

export const metadata: Metadata = {
  title: "About — Verbe",
  description: "Learn about Verbe and the thought behind it.",
}

export default function AboutPage() {
  return (
    <main className="relative flex h-screen flex-col overflow-hidden bg-background">
      <div
        aria-hidden="true"
        className="bg-grid-pattern bg-grid-fade pointer-events-none absolute inset-0 -z-10"
      />

      {/* Header */}
      <header className="flex shrink-0 items-center justify-between px-6 py-4 md:px-10">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-lg shadow-primary/20">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
          </div>
          <span className="font-mono text-sm font-medium tracking-wide text-foreground">VERBE</span>
        </Link>
        <Link href="/" className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <span aria-hidden="true">&larr;</span> back to home
        </Link>
      </header>

      {/* Content - two column layout */}
      <section className="flex flex-1 items-center justify-center px-6">
        <div className="flex w-full max-w-4xl flex-col gap-12 md:flex-row md:items-center md:gap-16">
          
          {/* Left: About Verbe */}
          <div className="flex-1 space-y-6">
            <h1 className="font-[family-name:var(--font-cursive)] text-5xl text-foreground md:text-6xl">
              Verbe
            </h1>
            <p className="font-[family-name:var(--font-cursive)] text-xl text-primary">
              {'"content into conversation == questions into clarity"'}
            </p>
            <div className="space-y-4 text-base leading-relaxed text-muted-foreground">
              <p>
                Verbe turns any newsletter, podcast, or article into a conversation. 
                Paste a link, ask questions, and get answers grounded in the content.
              </p>
              <p>
                No more skimming. No more losing insights. 
                Just clarity from the content you care about.
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="hidden h-48 w-px bg-border/60 md:block" />
          <div className="mx-auto w-24 border-t border-border/60 md:hidden" />

          {/* Right: Built by */}
          <div className="flex flex-col items-center space-y-4 text-center md:w-64">
            <p className="text-xs uppercase tracking-widest text-muted-foreground/60">Built by</p>
            
            {/* Profile photo */}
            <div className="h-24 w-24 overflow-hidden rounded-full border-2 border-primary/30 shadow-lg">
              <img
                src="/images/swabhi-profile.jpg"
                alt="Swabhi Gupta"
                className="h-full w-full object-cover"
                style={{ objectPosition: "48% 18%", transform: "scale(1.6)" }}
              />
            </div>

            {/* Name */}
            <h2 className="font-[family-name:var(--font-cursive)] text-3xl text-foreground">
              Swabhi Gupta
            </h2>

            {/* Quick bio */}
            <p className="text-sm text-muted-foreground">
              CS leader & builder
            </p>

            {/* Companies & Communities inline */}
            <div className="space-y-2 text-xs text-muted-foreground">
              <p>
                <span className="text-muted-foreground/50">at </span>
                <a href="https://gupshup.io" target="_blank" rel="noopener noreferrer" className="hover:text-foreground">Gupshup</a>
                {" · "}
                <a href="https://vidyo.ai" target="_blank" rel="noopener noreferrer" className="hover:text-foreground">vidyo.ai</a>
                {" · "}
                <a href="https://motherson.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground">Motherson</a>
              </p>
              <p>
                <span className="text-muted-foreground/50">in </span>
                <a href="https://www.womenofcustomersuccess.com/" target="_blank" rel="noopener noreferrer" className="hover:text-foreground">Women of CS</a>
                {" · "}
                <a href="https://www.linkedin.com/groups/2877523/" target="_blank" rel="noopener noreferrer" className="hover:text-foreground">CS Network</a>
              </p>
            </div>

            {/* Connect */}
            <div className="flex gap-4 pt-2 text-sm text-muted-foreground">
              <a href="https://linkedin.com/in/swabhi-gupta" target="_blank" rel="noopener noreferrer" className="hover:text-foreground">LinkedIn</a>
              <a href="https://twitter.com/guptaswabhi" target="_blank" rel="noopener noreferrer" className="hover:text-foreground">Twitter</a>
              <a href="https://github.com/swabhig" target="_blank" rel="noopener noreferrer" className="hover:text-foreground">GitHub</a>
            </div>
          </div>

        </div>
      </section>
    </main>
  )
}
