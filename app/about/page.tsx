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

      {/* Content - vertically centered, no scroll */}
      <section className="flex flex-1 flex-col items-center justify-center px-4 text-center sm:px-6">
        <div className="w-full max-w-2xl space-y-7">

          {/* Quote */}
          <p className="font-[family-name:var(--font-cursive)] text-xl text-muted-foreground sm:text-2xl">
            {'"content into conversation == questions into clarity"'}
          </p>

          {/* Profile photo - zoomed in on face */}
          <div className="mx-auto h-32 w-32 overflow-hidden rounded-full border-2 border-primary/30 shadow-2xl sm:h-40 sm:w-40">
            <img
              src="/images/swabhi-profile.jpg"
              alt="Swabhi Gupta"
              className="h-full w-full object-cover"
              style={{ objectPosition: "center 25%", transform: "scale(1.4)" }}
            />
          </div>

          {/* Name */}
          <h2 className="font-[family-name:var(--font-cursive)] text-5xl text-foreground sm:text-6xl md:text-7xl">
            Swabhi Gupta
          </h2>

          {/* Bio */}
          <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
            CS leader, builder at heart, curious mind. Passionate about turning customer conversations into clarity — and products into habits.
          </p>

          {/* Divider */}
          <div className="border-t border-border/40" />

          {/* Companies */}
          <div>
            <p className="mb-2 text-xs uppercase tracking-widest text-muted-foreground/50 sm:text-sm">Worked at</p>
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm text-muted-foreground sm:text-base">
              <a href="https://gupshup.io" target="_blank" rel="noopener noreferrer" className="hover:text-foreground">Gupshup</a>
              <span className="text-border">·</span>
              <a href="https://vidyo.ai" target="_blank" rel="noopener noreferrer" className="hover:text-foreground">vidyo.ai</a>
              <span className="text-border">·</span>
              <a href="https://motherson.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground">Motherson</a>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-border/40" />

          {/* Communities */}
          <div>
            <p className="mb-2 text-xs uppercase tracking-widest text-muted-foreground/50 sm:text-sm">Part of</p>
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm text-muted-foreground sm:text-base">
              <a href="https://www.womenofcustomersuccess.com/" target="_blank" rel="noopener noreferrer" className="hover:text-foreground">Women of CS</a>
              <span className="text-border">·</span>
              <a href="https://www.linkedin.com/groups/2877523/" target="_blank" rel="noopener noreferrer" className="hover:text-foreground">CS Network</a>
              <span className="text-border">·</span>
              <a href="https://www.successhubcommunity.com/" target="_blank" rel="noopener noreferrer" className="hover:text-foreground">Success Hub</a>
              <span className="text-border">·</span>
              <a href="https://womenofcs.carrd.co/" target="_blank" rel="noopener noreferrer" className="hover:text-foreground">WomenOfCS</a>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-border/40" />

          {/* Connect */}
          <div>
            <p className="mb-2 text-xs uppercase tracking-widest text-muted-foreground/50 sm:text-sm">Connect with me</p>
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm text-muted-foreground sm:text-base">
              <a href="https://linkedin.com/in/swabhi-gupta" target="_blank" rel="noopener noreferrer" className="hover:text-foreground">LinkedIn</a>
              <span className="text-border">·</span>
              <a href="https://twitter.com/guptaswabhi" target="_blank" rel="noopener noreferrer" className="hover:text-foreground">Twitter</a>
              <span className="text-border">·</span>
              <a href="https://github.com/swabhig" target="_blank" rel="noopener noreferrer" className="hover:text-foreground">GitHub</a>
              <span className="text-border">·</span>
              <a href="https://wa.me/919810040184" target="_blank" rel="noopener noreferrer" className="hover:text-foreground">WhatsApp</a>
            </div>
          </div>

        </div>
      </section>
    </main>
  )
}
