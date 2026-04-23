'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sparkles, ArrowRight, User, Building2 } from 'lucide-react'

interface OnboardingProps {
  onComplete: () => void
}

const ANIMALS = [
  { id: 'fox', label: 'Fox', emoji: '🦊' },
  { id: 'owl', label: 'Owl', emoji: '🦉' },
  { id: 'lion', label: 'Lion', emoji: '🦁' },
  { id: 'wolf', label: 'Wolf', emoji: '🐺' },
  { id: 'eagle', label: 'Eagle', emoji: '🦅' },
  { id: 'shark', label: 'Shark', emoji: '🦈' },
  { id: 'bear', label: 'Bear', emoji: '🐻' },
  { id: 'elephant', label: 'Elephant', emoji: '🐘' },
]

export function Onboarding({ onComplete }: OnboardingProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    fullName: '',
    company: '',
    roleAtCompany: '',
    avatar: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.fullName.trim()) {
      setError('Please enter your name')
      return
    }

    if (!formData.avatar) {
      setError('Please select an avatar')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName.trim(),
          company: formData.company.trim() || null,
          roleAtCompany: formData.roleAtCompany.trim() || null,
          avatar: formData.avatar,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to save profile')
      }

      onComplete()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }))
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-6">
      {/* Premium grid background */}
      <div aria-hidden="true" className="bg-grid-pattern bg-grid-fade pointer-events-none absolute inset-0 -z-10" />

      {/* Ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 -z-0 h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-primary/20 via-primary/10 to-transparent blur-3xl"
      />

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-lg shadow-primary/20">
            <Sparkles className="h-6 w-6" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Welcome to Kairos</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Tell us a bit about yourself so we can personalize your experience.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="flex items-center gap-2 text-sm">
              <User className="h-3.5 w-3.5 text-muted-foreground" />
              Your name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="fullName"
              type="text"
              placeholder="John Doe"
              value={formData.fullName}
              onChange={handleChange('fullName')}
              className="h-11"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company" className="flex items-center gap-2 text-sm">
              <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
              Company
            </Label>
            <Input
              id="company"
              type="text"
              placeholder="e.g. Acme Inc."
              value={formData.company}
              onChange={handleChange('company')}
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="roleAtCompany" className="text-sm">Your designation</Label>
            <Input
              id="roleAtCompany"
              type="text"
              placeholder="e.g. Product Manager, Senior Engineer"
              value={formData.roleAtCompany}
              onChange={handleChange('roleAtCompany')}
              className="h-11"
            />
          </div>

          {/* Avatar Picker */}
          <div className="space-y-3">
            <Label className="text-sm">
              Choose your avatar <span className="text-destructive">*</span>
            </Label>
            <div className="grid grid-cols-4 gap-2">
              {ANIMALS.map((animal) => (
                <button
                  key={animal.id}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, avatar: animal.id }))}
                  className={`flex h-14 items-center justify-center rounded-lg border-2 transition-all ${
                    formData.avatar === animal.id
                      ? 'border-primary bg-primary/10'
                      : 'border-border bg-card hover:border-border/80'
                  }`}
                  title={animal.label}
                >
                  <span className="text-2xl">{animal.emoji}</span>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full gap-2 bg-foreground text-background hover:bg-foreground/90"
          >
            {loading ? 'Saving...' : 'Continue to Kairos'}
            {!loading && <ArrowRight className="h-4 w-4" />}
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          This info helps us understand our community better.
        </p>
      </div>
    </main>
  )
}
