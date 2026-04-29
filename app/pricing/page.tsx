import { Metadata } from "next"
import Link from "next/link"
import { Sparkles, MessageCircle } from "lucide-react"

export const metadata: Metadata = {
  title: "Pricing — Verbe",
  description: "Verbe is currently in beta. All feedback is welcome.",
}

export default function PricingPage() {
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
          <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground">About</Link>
          <Link href="/pricing" className="text-sm text-foreground">Pricing</Link>
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">Sign in</Link>
        </nav>
      </header>

      <section className="flex flex-1 flex-col items-center justify-center px-6 py-16 md:px-10">
        <div className="mx-auto w-full max-w-md text-center">
          
          <p className="mb-8 font-[family-name:var(--font-cursive)] text-3xl text-foreground md:text-4xl">
            beta
          </p>
          
          <p className="mb-10 font-[family-name:var(--font-cursive)] text-xl text-muted-foreground">
            free while we build
          </p>

          <a
            href="https://wa.me/919810040184"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-2.5 text-sm text-white transition-transform hover:-translate-y-0.5"
          >
            <MessageCircle className="h-4 w-4" />
            feedback welcome
          </a>
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
