"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function OnboardingWrapper() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <OnboardingForm />
    </div>
  )
}

function OnboardingForm() {
  const [fullName, setFullName] = useState("")
  const [company, setCompany] = useState("")
  const [role, setRole] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setError("Not authenticated")
        return
      }

      const { error: err } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          company,
          role,
          onboarding_completed: true,
        })
        .eq("id", user.id)

      if (err) {
        setError(err.message)
      } else {
        // Reload to show main app
        window.location.href = "/"
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Welcome to Verbe 👋</h1>
        <p className="text-sm text-muted-foreground">
          Tell us a bit about yourself to get started
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Full Name</label>
          <Input
            type="text"
            placeholder="Your name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Company</label>
          <Input
            type="text"
            placeholder="Where do you work?"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Role / Designation</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            required
          >
            <option value="">Select your role</option>
            <option value="customer_success">Customer Success</option>
            <option value="account_manager">Account Manager</option>
            <option value="sales">Sales</option>
            <option value="marketing">Marketing</option>
            <option value="product">Product</option>
            <option value="engineering">Engineering</option>
            <option value="founder">Founder</option>
            <option value="other">Other</option>
          </select>
        </div>

        {error && <div className="text-sm text-destructive">{error}</div>}

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Setting up..." : "Continue"}
        </Button>
      </form>
    </div>
  )
}
