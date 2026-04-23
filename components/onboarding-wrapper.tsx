"use client"

import { useRouter } from "next/navigation"
import { Onboarding } from "@/components/onboarding"

export function OnboardingWrapper() {
  const router = useRouter()

  const handleComplete = () => {
    router.refresh()
  }

  return <Onboarding onComplete={handleComplete} />
}
