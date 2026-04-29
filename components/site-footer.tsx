import Link from "next/link"
import { Sparkles } from "lucide-react"

export function SiteFooter() {
  return (
    <footer className="shrink-0 border-t border-border bg-background px-6 py-6 md:px-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 md:flex-row">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-primary to-primary/70 text-primary-foreground">
            <Sparkles className="h-3 w-3" aria-hidden="true" />
          </div>
          <span className="font-mono text-xs tracking-wide text-muted-foreground">VERBE</span>
        </div>
        
        <div className="flex items-center gap-6 text-xs text-muted-foreground">
          <Link href="/about" className="transition-colors hover:text-foreground">
            About
          </Link>
          <Link href="/pricing" className="transition-colors hover:text-foreground">
            Pricing
          </Link>
          <a
            href="https://wa.me/919810040184"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-foreground"
          >
            Feedback
          </a>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          An effort to give back to the CS community.
        </p>
      </div>
    </footer>
  )
}
