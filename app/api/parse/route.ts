import { createClient } from "@/lib/supabase/server"
import { scrapeUrl } from "@/lib/scrape"
import { fetchYoutubeTranscript, extractVideoId } from "@/lib/youtube"

export const dynamic = "force-dynamic"

function looksLikeYoutube(url: string) {
  try {
    const u = new URL(url)
    return u.hostname === "youtu.be" || u.hostname.endsWith("youtube.com")
  } catch {
    return false
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return Response.json({ error: "Not signed in" }, { status: 401 })
    }

    const { url } = (await req.json()) as { url?: string }
    if (!url || typeof url !== "string") {
      return Response.json({ error: "A URL is required." }, { status: 400 })
    }

    let parsedUrl: URL
    try {
      parsedUrl = new URL(url)
    } catch {
      return Response.json({ error: "Please enter a valid URL including https://" }, { status: 400 })
    }
    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      return Response.json({ error: "Only http(s) URLs are supported." }, { status: 400 })
    }

    const isYoutube = looksLikeYoutube(url) && !!extractVideoId(url)
    const sourceType: "url" | "youtube" = isYoutube ? "youtube" : "url"

    let title: string
    let content: string

    if (isYoutube) {
      const yt = await fetchYoutubeTranscript(url)
      title = yt.title
      content = yt.transcript
    } else {
      const page = await scrapeUrl(url)
      title = page.title
      content = page.content
    }

    // Create the conversation row (RLS enforces user_id match)
    const { data, error } = await supabase
      .from("conversations")
      .insert({
        user_id: user.id,
        title,
        source_type: sourceType,
        source_url: url,
        source_title: title,
        source_content: content,
        messages: [],
      })
      .select("id, title, source_type, source_url, source_title, created_at")
      .single()

    if (error) {
      console.log("[v0] parse insert error:", error.message)
      return Response.json({ error: "Could not save conversation." }, { status: 500 })
    }

    return Response.json({ conversation: data })
  } catch (e) {
    const message = e instanceof Error ? e.message : "Something went wrong parsing that source."
    return Response.json({ error: message }, { status: 400 })
  }
}
