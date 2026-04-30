import { Metadata } from "next"
import Link from "next/link"
import { Sparkles } from "lucide-react"

export const metadata: Metadata = {
  title: "About — Verbe",
  description: "Learn about Verbe and the thought behind it.",
}

export default function AboutPage() {
  return (
    <main className="relative flex min-h-screen flex-col bg-background">
      <div 
        aria-hidden="true" 
        className="bg-grid-pattern bg-grid-fade pointer-events-none absolute inset-0 -z-10"
      />
      
      {/* Header */}
      <header className="relative z-50 flex shrink-0 items-center justify-between px-6 py-4 md:px-10">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-lg shadow-primary/20">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
          </div>
          <span className="font-mono text-sm font-medium tracking-wide text-foreground">VERBE</span>
        </Link>
        <nav className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground">
            <span aria-hidden="true">&larr;</span> back to home
          </Link>
        </nav>
      </header>

      <section className="flex flex-1 flex-col items-center justify-center px-6 py-16 md:px-10">
        <div className="mx-auto w-full max-w-lg text-center">
          
          {/* Quote */}
          <p className="mb-16 font-[family-name:var(--font-cursive)] text-xl text-muted-foreground md:text-2xl">
            {'"content into conversation == questions into clarity"'}
          </p>

          {/* Profile */}
          <div className="flex flex-col items-center gap-5">
            <div className="h-40 w-40 overflow-hidden rounded-full border-3 border-primary/30 shadow-2xl md:h-48 md:w-48">
              <img 
                src="/images/swabhi-profile.jpg" 
                alt="Swabhi Gupta"
                className="scale-[2.5] object-cover"
                style={{ objectPosition: "center 28%" }}
              />
            </div>
            
            <h2 className="font-[family-name:var(--font-cursive)] text-4xl text-foreground md:text-5xl">
              Swabhi Gupta
            </h2>

            {/* Bio */}
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              Customer Success professional with 6+ years in SaaS. Builder at heart, curious mind, and community advocate. Passionate about products, customers, and meaningful conversations.
            </p>

            {/* Social Links */}
            <div className="flex gap-5 text-sm text-muted-foreground">
              <a href="https://linkedin.com/in/swabhi-gupta" target="_blank" rel="noopener noreferrer" className="hover:text-foreground">LinkedIn</a>
              <a href="https://twitter.com/guptaswabhi" target="_blank" rel="noopener noreferrer" className="hover:text-foreground">Twitter</a>
              <a href="https://github.com/swabhig" target="_blank" rel="noopener noreferrer" className="hover:text-foreground">GitHub</a>
            </div>

            {/* Companies */}
            <p className="text-xs text-muted-foreground">
              <a href="https://gupshup.io" target="_blank" rel="noopener noreferrer" className="hover:text-foreground">Gupshup</a>
              {" · "}
              <a href="https://vidyo.ai" target="_blank" rel="noopener noreferrer" className="hover:text-foreground">vidyo.ai</a>
              {" · "}
              <a href="https://motherson.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground">Motherson</a>
            </p>

            {/* CS Communities */}
            <div className="mt-6 border-t border-border/50 pt-6">
              <p className="mb-2 text-xs uppercase tracking-wider text-muted-foreground/60">Member of</p>
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <a href="https://www.womenofcustomersuccess.com/" target="_blank" rel="noopener noreferrer" className="hover:text-foreground">Women of Customer Success</a>
                <span className="text-border">·</span>
                <a href="https://www.linkedin.com/groups/2877523/" target="_blank" rel="noopener noreferrer" className="hover:text-foreground">CS Network</a>
                <span className="text-border">·</span>
                <a href="https://www.successhubcommunity.com/" target="_blank" rel="noopener noreferrer" className="hover:text-foreground">Success Hub</a>
                <span className="text-border">·</span>
                <a href="https://womenofcs.carrd.co/" target="_blank" rel="noopener noreferrer" className="hover:text-foreground">WomenOfCS</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="shrink-0 px-6 py-4 text-center text-xs text-muted-foreground md:px-10">
        For feedback, connect on{" "}
        <a href="https://wa.me/919810040184" target="_blank" rel="noopener noreferrer" className="text-foreground underline underline-offset-4 hover:text-primary">WhatsApp</a>
      </footer>
    </main>
  )
}
