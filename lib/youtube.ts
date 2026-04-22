import { YoutubeTranscript } from "youtube-transcript"

export type YoutubeResult = {
  title: string
  videoId: string
  transcript: string
}

export function extractVideoId(url: string): string | null {
  try {
    const u = new URL(url)
    if (u.hostname === "youtu.be") {
      return u.pathname.slice(1) || null
    }
    if (u.hostname.includes("youtube.com")) {
      if (u.pathname === "/watch") return u.searchParams.get("v")
      const shortsMatch = u.pathname.match(/^\/shorts\/([\w-]+)/)
      if (shortsMatch) return shortsMatch[1]
      const embedMatch = u.pathname.match(/^\/embed\/([\w-]+)/)
      if (embedMatch) return embedMatch[1]
    }
    return null
  } catch {
    return null
  }
}

export async function fetchYoutubeTranscript(url: string): Promise<YoutubeResult> {
  const videoId = extractVideoId(url)
  if (!videoId) {
    throw new Error("That doesn't look like a valid YouTube URL.")
  }

  let segments: Array<{ text: string }> = []
  try {
    segments = await YoutubeTranscript.fetchTranscript(videoId)
  } catch (e) {
    throw new Error("Could not fetch a transcript for this video. It may not have captions enabled.")
  }

  const transcript = segments
    .map((s) => s.text)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim()

  if (!transcript || transcript.length < 50) {
    throw new Error("The transcript for this video was too short to analyze.")
  }

  // Best-effort title fetch from oEmbed (no API key needed)
  let title = `YouTube video ${videoId}`
  try {
    const r = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`, {
      signal: AbortSignal.timeout(8_000),
    })
    if (r.ok) {
      const data = (await r.json()) as { title?: string }
      if (data.title) title = data.title
    }
  } catch {
    // ignore — title fallback is fine
  }

  // Cap length for model context
  const capped = transcript.slice(0, 25_000)

  return { title, videoId, transcript: capped }
}
