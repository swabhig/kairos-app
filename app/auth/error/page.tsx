import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

export default function AuthErrorPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
          <AlertTriangle className="h-6 w-6 text-destructive" aria-hidden="true" />
        </div>
        <h1 className="mb-2 text-xl font-semibold text-foreground text-balance">Authentication error</h1>
        <p className="mb-6 text-sm leading-relaxed text-muted-foreground text-pretty">
          Something went wrong while signing you in. Please try again.
        </p>
        <Button asChild className="w-full">
          <Link href="/">Return home</Link>
        </Button>
      </div>
    </main>
  )
}
