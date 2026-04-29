import { Metadata } from "next"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { MessageCircle, Sparkles, Check } from "lucide-react"

export const metadata: Metadata = {
  title: "Pricing — Verbe",
  description: "Verbe is currently in beta. All feedback is welcome.",
}

export default function PricingPage() {
  return (
    <main className="relative flex min-h-screen flex-col bg-background">
      {/* Premium grid background */}
      <div 
        aria-hidden="true" 
        className="bg-grid-pattern bg-grid-fade pointer-events-none absolute inset-0 -z-10"
      />
      
      <SiteHeader />

      <section className="flex flex-1 flex-col items-center justify-center px-6 py-16 md:px-10">
        <div className="mx-auto w-full max-w-xl text-center">
          {/* Beta Badge */}
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            <Sparkles className="h-4 w-4" />
            Beta Phase
          </span>

          <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            Free during beta
          </h1>
          
          <p className="mb-8 text-lg text-muted-foreground">
            Verbe is currently in beta. We&apos;re building in public and your feedback shapes the product.
          </p>

          {/* Features */}
          <div className="mb-10 rounded-lg border border-border bg-card/50 p-6 text-left">
            <h3 className="mb-4 font-semibold text-foreground">What&apos;s included:</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-muted-foreground">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                Unlimited article and YouTube parsing
              </li>
              <li className="flex items-start gap-3 text-sm text-muted-foreground">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                Multi-article indexing (crawl entire archives)
              </li>
              <li className="flex items-start gap-3 text-sm text-muted-foreground">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                AI-powered conversations grounded in content
              </li>
              <li className="flex items-start gap-3 text-sm text-muted-foreground">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                Conversation history saved to your account
              </li>
            </ul>
          </div>

          {/* Feedback CTA */}
          <div className="rounded-lg border border-dashed border-primary/50 bg-primary/5 p-6">
            <h3 className="mb-2 font-semibold text-foreground">All feedback is welcome!</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Help us build something useful. Share your thoughts, bugs, or feature requests.
            </p>
            <a
              href="https://wa.me/919810040184"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-[#25D366] px-5 py-2.5 text-sm font-medium text-white shadow-lg transition-transform hover:-translate-y-0.5 hover:bg-[#22c55e]"
            >
              <MessageCircle className="h-4 w-4" />
              Chat on WhatsApp — real & quick
            </a>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}
