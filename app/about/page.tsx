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
          <Link href="/about" className="text-sm text-foreground">About</Link>
          <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground">Pricing</Link>
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">Sign in</Link>
        </nav>
      </header>

      <section className="flex flex-1 flex-col items-center justify-center px-6 py-16 md:px-10">
        <div className="mx-auto w-full max-w-md text-center">
          
          {/* Minimal Cursive Text */}
          <p className="mb-16 font-[family-name:var(--font-cursive)] text-2xl leading-relaxed text-muted-foreground md:text-3xl">
            content into conversation<br />
            questions into clarity
          </p>

          {/* Profile */}
          <div className="flex flex-col items-center gap-4">
            <div className="h-20 w-20 overflow-hidden rounded-full border-2 border-primary/30 shadow-lg">
              <img 
                src="https://media.licdn.com/dms/image/v2/D5603AQFcOO1_yEbNdA/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1719558571157?e=1753920000&v=beta&t=7JQB8U5MInrVrMZiIZlMpK3_JY2bRnR5Bt3G3M_UYJY" 
                alt="Swabhi Gupta"
                className="h-full w-full object-cover"
              />
            </div>
            
            <p className="font-[family-name:var(--font-cursive)] text-xl text-foreground">
              Swabhi Gupta
            </p>

            <div className="flex gap-4 text-xs text-muted-foreground">
              <a href="https://linkedin.com/in/swabhi-gupta" target="_blank" rel="noopener noreferrer" className="hover:text-foreground">LinkedIn</a>
              <a href="https://twitter.com/guptaswabhi" target="_blank" rel="noopener noreferrer" className="hover:text-foreground">Twitter</a>
              <a href="https://github.com/swabhig" target="_blank" rel="noopener noreferrer" className="hover:text-foreground">GitHub</a>
            </div>

            <p className="mt-2 text-xs text-muted-foreground">
              <a href="https://gupshup.io" target="_blank" rel="noopener noreferrer" className="hover:text-foreground">Gupshup</a>
              {" · "}
              <a href="https://vidyo.ai" target="_blank" rel="noopener noreferrer" className="hover:text-foreground">vidyo.ai</a>
              {" · "}
              <a href="https://motherson.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground">Motherson</a>
            </p>
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
