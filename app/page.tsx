import { createClient } from "@/lib/supabase/server"
import { Landing } from "@/components/landing"
import { KairosApp } from "@/components/kairos-app"
import { OnboardingWrapper } from "@/components/onboarding-wrapper"

export default async function HomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return <Landing />
  }

  // Check if user has completed onboarding
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  // Show onboarding if not completed
  if (!profile?.onboarding_completed) {
    return <OnboardingWrapper />
  }

  // Load user's saved conversations (RLS keeps this scoped automatically)
  const { data: conversations } = await supabase
    .from("conversations")
    .select("id, title, source_type, source_url, created_at, updated_at")
    .order("updated_at", { ascending: false })
    .limit(50)

  return (
    <KairosApp
      user={{
        id: user.id,
        email: user.email ?? null,
        name: profile.full_name ?? null,
        avatar: (user.user_metadata?.avatar_url as string | undefined) ?? null,
      }}
      initialConversations={conversations ?? []}
    />
  )
}
