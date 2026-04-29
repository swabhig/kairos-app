import { Metadata } from "next"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

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
      
      <SiteHeader />

      <section className="flex flex-1 flex-col items-center justify-center px-6 py-16 md:px-10">
        <div className="mx-auto w-full max-w-2xl text-center">
          <h1 className="mb-10 font-[family-name:var(--font-cursive)] text-5xl text-foreground md:text-6xl">
            Verbe
          </h1>
          
          <div className="mb-16 space-y-4 font-[family-name:var(--font-cursive)] text-2xl leading-relaxed text-muted-foreground md:text-3xl">
            <p>content into conversation</p>
            <p>questions into clarity</p>
            <p>readers into thinkers</p>
          </div>

          {/* About Creator */}
          <div className="flex flex-col items-center gap-6">
            <div className="h-24 w-24 overflow-hidden rounded-full border-2 border-primary/30 shadow-lg">
              <img 
                src="https://media.licdn.com/dms/image/v2/D5603AQFcOO1_yEbNdA/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1719558571157?e=1753920000&v=beta&t=7JQB8U5MInrVrMZiIZlMpK3_JY2bRnR5Bt3G3M_UYJY" 
                alt="Swabhi Gupta"
                className="h-full w-full object-cover"
              />
            </div>
            
            <div>
              <h2 className="font-[family-name:var(--font-cursive)] text-2xl text-foreground">
                Swabhi Gupta
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">builder, CS professional</p>
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              <a
                href="https://linkedin.com/in/swabhi-gupta"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-border px-4 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
              >
                LinkedIn
              </a>
              <a
                href="https://twitter.com/guptaswabhi"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-border px-4 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
              >
                Twitter
              </a>
              <a
                href="https://github.com/swabhig"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-border px-4 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
              >
                GitHub
              </a>
            </div>

            <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs text-muted-foreground">
              <span>Previously:</span>
              <a href="https://gupshup.io" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-foreground">Gupshup</a>
              <span>·</span>
              <a href="https://quso.ai" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-foreground">quso.ai</a>
              <span>·</span>
              <a href="https://motherson.com" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-foreground">Motherson</a>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}
