import { Metadata } from "next"
import Link from "next/link"

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
          <img 
            src="/images/verbe-logo.jpg" 
            alt="Verbe logo" 
            className="h-8 w-8 rounded-lg shadow-lg shadow-primary/20"
          />
          <span className="font-mono text-sm font-medium tracking-wide text-foreground">VERBE</span>
        </Link>
        <Link href="/" className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <span aria-hidden="true">&larr;</span> back to home
        </Link>
      </header>

      {/* Content - 50/50 split */}
      <section className="flex flex-1 items-center px-6">
        <div className="mx-auto flex w-full max-w-5xl flex-col md:flex-row">
          
          {/* Left: About Verbe - 50% */}
          <div className="flex flex-1 flex-col justify-center space-y-5 py-8 md:pr-12">
            <h1 className="font-[family-name:var(--font-cursive)] text-5xl text-foreground md:text-6xl">
              Verbe
              <span className="ml-2 text-xs font-normal text-muted-foreground/60">(French: word, to speak)</span>
            </h1>
            <p className="font-[family-name:var(--font-cursive)] text-xl text-primary">
              {'"content into conversation == questions into clarity"'}
            </p>
            <p className="text-lg leading-relaxed text-muted-foreground">
              Paste any newsletter, podcast, or article. Ask questions. Get answers grounded in the content.
            </p>
          </div>

          {/* Divider */}
          <div className="hidden w-px bg-border/40 md:block" />
          <div className="mx-auto my-6 w-24 border-t border-border/40 md:hidden" />

          {/* Right: Swabhi - 50% */}
          <div className="flex flex-1 flex-col items-center justify-center space-y-5 py-8 text-center md:pl-12">
            
            {/* Profile photo */}
            <div className="h-32 w-32 overflow-hidden rounded-full border-2 border-primary/30 shadow-xl">
              <img
                src="/images/swabhi-profile.jpg"
                alt="Swabhi Gupta"
                className="h-full w-full object-cover"
                style={{ objectPosition: "48% 22%", transform: "scale(1.6)" }}
              />
            </div>

            {/* Name */}
            <h2 className="font-[family-name:var(--font-cursive)] text-4xl text-foreground">
              Swabhi Gupta
            </h2>

            {/* Bio */}
            <p className="max-w-sm text-base leading-relaxed text-muted-foreground">
              6+ years in Customer Success. Builder at heart, curious mind, product believer. Passionate about helping customers succeed.
            </p>

            {/* Divider */}
            <div className="w-12 border-t border-border/40" />

            {/* Worked at */}
            <div>
              <p className="mb-1 text-xs uppercase tracking-widest text-muted-foreground/50">Worked at</p>
              <div className="flex flex-wrap justify-center gap-x-3 text-sm text-muted-foreground">
                <a href="https://gupshup.io" target="_blank" rel="noopener noreferrer" className="hover:text-foreground">Gupshup</a>
                <span className="text-border">·</span>
                <a href="https://vidyo.ai" target="_blank" rel="noopener noreferrer" className="hover:text-foreground">vidyo.ai</a>
                <span className="text-border">·</span>
                <a href="https://motherson.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground">Motherson</a>
                <span className="text-border">·</span>
                <a href="https://tracxn.com/d/legal-entities/india/ekeekaran-ventures-private-limited" target="_blank" rel="noopener noreferrer" className="hover:text-foreground">Ekeekaran Ventures</a>
              </div>
            </div>

            {/* Part of */}
            <div>
              <p className="mb-1 text-xs uppercase tracking-widest text-muted-foreground/50">Part of</p>
              <div className="flex flex-wrap justify-center gap-x-3 text-sm text-muted-foreground">
                <a href="https://www.womenofcustomersuccess.com/" target="_blank" rel="noopener noreferrer" className="hover:text-foreground">Women of CS</a>
                <span className="text-border">·</span>
                <a href="https://www.linkedin.com/groups/2877523/" target="_blank" rel="noopener noreferrer" className="hover:text-foreground">CS Network</a>
                <span className="text-border">·</span>
                <a href="https://www.successhubcommunity.com/" target="_blank" rel="noopener noreferrer" className="hover:text-foreground">Success Hub</a>
              </div>
            </div>

            {/* Connect */}
            <div>
              <p className="mb-1 text-xs uppercase tracking-widest text-muted-foreground/50">Connect</p>
              <div className="flex flex-wrap justify-center gap-x-3 text-sm text-muted-foreground">
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

        </div>
      </section>
    </main>
  )
}
