import { Metadata } from "next"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { MessageCircle } from "lucide-react"

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
      
      <SiteHeader />

      <section className="flex flex-1 flex-col items-center justify-center px-6 py-16 md:px-10">
        <div className="mx-auto w-full max-w-xl text-center">
          <h1 className="mb-6 font-[family-name:var(--font-cursive)] text-5xl text-foreground md:text-6xl">
            Beta
          </h1>
          
          <p className="mb-10 font-[family-name:var(--font-cursive)] text-2xl text-muted-foreground md:text-3xl">
            free while we build in public
          </p>

          <div className="rounded-lg border border-dashed border-primary/50 bg-primary/5 p-8">
            <p className="mb-6 font-[family-name:var(--font-cursive)] text-xl text-foreground">
              all feedback is welcome
            </p>
            <a
              href="https://wa.me/919810040184"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-sm font-medium text-white shadow-lg transition-transform hover:-translate-y-0.5 hover:bg-[#22c55e]"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp — real & quick
            </a>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}
