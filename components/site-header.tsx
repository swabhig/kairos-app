"use client"

import Link from "next/link"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Sparkles, Menu, X } from "lucide-react"
import { GoogleIcon } from "@/components/google-icon"

export function SiteHeader() {
  const [loading, setLoading] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  async function handleGoogleSignIn() {
    setLoading(true)
    try {
      const supabase = createClient()
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
    } catch {
      setLoading(false)
    }
  }

  return (
    <header className="relative z-50 flex shrink-0 items-center justify-between px-6 py-4 md:px-10">
      <Link href="/" className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-lg shadow-primary/20">
          <Sparkles className="h-4 w-4" aria-hidden="true" />
        </div>
        <span className="font-mono text-sm font-medium tracking-wide text-foreground">VERBE</span>
      </Link>

      {/* Desktop Navigation */}
      <nav className="hidden items-center gap-6 md:flex">
        <Link 
          href="/about" 
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          About
        </Link>
        <Link 
          href="/pricing" 
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          Pricing
        </Link>
        <Button 
          onClick={handleGoogleSignIn} 
          disabled={loading}
          size="sm"
          className="gap-2 bg-foreground text-background hover:bg-foreground/90"
        >
          <GoogleIcon className="h-3.5 w-3.5" />
          {loading ? "..." : "Sign in"}
        </Button>
      </nav>

      {/* Mobile Menu Button */}
      <button
        className="flex items-center justify-center md:hidden"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label="Toggle menu"
      >
        {mobileMenuOpen ? (
          <X className="h-5 w-5 text-foreground" />
        ) : (
          <Menu className="h-5 w-5 text-foreground" />
        )}
      </button>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="absolute left-0 right-0 top-full border-b border-border bg-background px-6 py-4 md:hidden">
          <nav className="flex flex-col gap-4">
            <Link 
              href="/about" 
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </Link>
            <Link 
              href="/pricing" 
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              Pricing
            </Link>
            <Button 
              onClick={handleGoogleSignIn} 
              disabled={loading}
              size="sm"
              className="w-full gap-2 bg-foreground text-background hover:bg-foreground/90"
            >
              <GoogleIcon className="h-3.5 w-3.5" />
              {loading ? "..." : "Sign in"}
            </Button>
          </nav>
        </div>
      )}
    </header>
  )
}
