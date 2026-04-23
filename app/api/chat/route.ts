import { convertToModelMessages, streamText, type UIMessage } from "ai"
import { createClient } from "@/lib/supabase/server"

export const maxDuration = 60

type ChatBody = {
  messages: UIMessage[]
  conversationId: string
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return new Response("Unauthorized", { status: 401 })
  }

  const { messages, conversationId } = (await req.json()) as ChatBody
  if (!conversationId) {
    return new Response("Missing conversationId", { status: 400 })
  }

  // Load the conversation (RLS restricts to owner)
  const { data: convo, error } = await supabase
    .from("conversations")
    .select("id, title, source_type, source_url, source_title, source_content")
    .eq("id", conversationId)
    .single()

  if (error || !convo) {
    return new Response("Conversation not found", { status: 404 })
  }

  // Load user profile for personalization
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, company, role_at_company")
    .eq("id", user.id)
    .single()

  const userName = profile?.full_name ?? "there"
  const userContext = profile?.company
    ? `The user${profile.full_name ? ` (${profile.full_name})` : ""} is ${profile.role_at_company || "a professional"}${profile.company ? ` at ${profile.company}` : ""}.`
    : ""

  const sourceLabel = convo.source_type === "youtube" ? "YouTube video transcript" : "article(s)"
  const systemPrompt = `You are Verbe, a warm and thoughtful conversational guide. The user's name is ${userName}. ${userContext}

They have provided the following ${sourceLabel} and want to explore the ideas with you.

Source title: ${convo.source_title ?? convo.title}
Source URL: ${convo.source_url}

--- SOURCE CONTENT ---
${convo.source_content ?? ""}
--- END SOURCE CONTENT ---

Guidelines:
- Ground every answer in the source content above. Quote or paraphrase specific passages when useful.
- If the user asks something that is not covered by the source, say so plainly, then offer your best thoughtful perspective.
- Be concise, direct, and curious. Ask a clarifying question when it helps.
- Use markdown for structure (short headings, bullet lists, bold for emphasis) when it aids readability.`

  const result = streamText({
    model: "google/gemini-2.0-flash",
    system: systemPrompt,
    messages: await convertToModelMessages(messages),
  })

  return result.toUIMessageStreamResponse({
    originalMessages: messages,
    onFinish: async ({ messages: finalMessages }) => {
      // Persist the updated transcript
      await supabase
        .from("conversations")
        .update({
          messages: finalMessages,
          updated_at: new Date().toISOString(),
        })
        .eq("id", conversationId)
    },
  })
}
