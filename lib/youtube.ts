import { YoutubeTranscript } from "youtube-transcript"

export type YoutubeResult = {
  title: string
  videoId: string
  transcript: string
  author?: string
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

async function fetchWithYoutubeTranscript(videoId: string): Promise<string | null> {
  try {
    const transcriptItems = await YoutubeTranscript.fetchTranscript(videoId, {
      lang: "en",
    })
    
    if (!transcriptItems || transcriptItems.length === 0) {
      return null
    }
    
    const transcript = transcriptItems
      .map((item) => item.text)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim()
    
    return transcript.length > 50 ? transcript : null
  } catch {
    // Try without language preference
    try {
      const transcriptItems = await YoutubeTranscript.fetchTranscript(videoId)
      
      if (!transcriptItems || transcriptItems.length === 0) {
        return null
      }
      
      const transcript = transcriptItems
        .map((item) => item.text)
        .join(" ")
        .replace(/\s+/g, " ")
        .trim()
      
      return transcript.length > 50 ? transcript : null
    } catch {
      return null
    }
  }
}

async function fetchFromInvidious(videoId: string): Promise<string | null> {
  const instances = [
    "https://vid.puffyan.us",
    "https://invidious.nerdvpn.de", 
    "https://inv.riverside.rocks",
    "https://invidious.lunar.icu",
    "https://yt.artemislena.eu",
  ]
  
  for (const instance of instances) {
    try {
      const res = await fetch(`${instance}/api/v1/captions/${videoId}`, {
        signal: AbortSignal.timeout(8000),
      })
      if (!res.ok) continue
      
      const captions = await res.json()
      if (!Array.isArray(captions) || captions.length === 0) continue
      
      const englishCaption = captions.find(
        (c: { language_code?: string }) => 
          c.language_code === "en" || c.language_code?.startsWith("en")
      ) || captions[0]
      
      if (!englishCaption?.url) continue
      
      const captionRes = await fetch(englishCaption.url, {
        signal: AbortSignal.timeout(8000),
      })
      if (!captionRes.ok) continue
      
      const xml = await captionRes.text()
      const textMatches = xml.match(/<text[^>]*>([^<]*)<\/text>/g)
      if (!textMatches) continue
      
      const transcript = textMatches
        .map(t => 
          t.replace(/<[^>]+>/g, "")
           .replace(/&amp;/g, "&")
           .replace(/&lt;/g, "<")
           .replace(/&gt;/g, ">")
           .replace(/&#39;/g, "'")
           .replace(/&quot;/g, '"')
           .replace(/\\n/g, " ")
        )
        .join(" ")
        .replace(/\s+/g, " ")
        .trim()
      
      if (transcript.length > 100) return transcript
    } catch {
      continue
    }
  }
  return null
}

async function fetchFromNoCors(videoId: string): Promise<string | null> {
  try {
    // Try fetching via a CORS proxy service
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(
      `https://www.youtube.com/watch?v=${videoId}`
    )}`
    
    const res = await fetch(proxyUrl, {
      signal: AbortSignal.timeout(15000),
    })
    
    if (!res.ok) return null
    
    const html = await res.text()
    
    // Extract caption tracks from ytInitialPlayerResponse
    const playerMatch = html.match(/ytInitialPlayerResponse\s*=\s*({.+?});/)
    if (!playerMatch) return null
    
    const playerData = JSON.parse(playerMatch[1])
    const captionTracks = playerData?.captions?.playerCaptionsTracklistRenderer?.captionTracks
    
    if (!Array.isArray(captionTracks) || captionTracks.length === 0) return null
    
    // Find English or first available
    const track = captionTracks.find(
      (t: { languageCode?: string }) => t.languageCode === "en"
    ) || captionTracks[0]
    
    if (!track?.baseUrl) return null
    
    // Fetch the caption XML via proxy
    const captionProxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(track.baseUrl)}`
    const captionRes = await fetch(captionProxyUrl, {
      signal: AbortSignal.timeout(10000),
    })
    
    if (!captionRes.ok) return null
    
    const xml = await captionRes.text()
    const textMatches = xml.match(/<text[^>]*>([^<]*)<\/text>/g)
    if (!textMatches) return null
    
    const transcript = textMatches
      .map(t => 
        t.replace(/<[^>]+>/g, "")
         .replace(/&amp;/g, "&")
         .replace(/&#39;/g, "'")
         .replace(/&quot;/g, '"')
         .replace(/\\n/g, " ")
      )
      .join(" ")
      .replace(/\s+/g, " ")
      .trim()
    
    return transcript.length > 100 ? transcript : null
  } catch {
    return null
  }
}

export async function fetchYoutubeTranscript(url: string): Promise<YoutubeResult> {
  const videoId = extractVideoId(url)
  if (!videoId) {
    throw new Error("That doesn't look like a valid YouTube URL.")
  }

  // Try multiple methods in order of reliability
  let transcript: string | null = null
  
  // Method 1: youtube-transcript library
  transcript = await fetchWithYoutubeTranscript(videoId)
  
  // Method 2: Invidious instances
  if (!transcript) {
    transcript = await fetchFromInvidious(videoId)
  }
  
  // Method 3: CORS proxy approach
  if (!transcript) {
    transcript = await fetchFromNoCors(videoId)
  }
  
  if (!transcript || transcript.length < 50) {
    throw new Error(
      "Could not fetch transcript. YouTube blocks cloud server requests for many videos. " +
      "This works best with: (1) Videos with manually-added captions (not auto-generated), " +
      "(2) Educational/conference videos, (3) Podcasts with proper subtitles. " +
      "Most auto-captioned videos from individual creators are restricted."
    )
  }

  // Fetch title and author from oEmbed
  let title = `YouTube video ${videoId}`
  let author: string | undefined
  try {
    const r = await fetch(
      `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`,
      { signal: AbortSignal.timeout(8000) }
    )
    if (r.ok) {
      const data = await r.json() as { title?: string; author_name?: string }
      if (data.title) title = data.title
      if (data.author_name) author = data.author_name
    }
  } catch {
    // ignore - title fallback is fine
  }

  // Cap length for model context
  const capped = transcript.slice(0, 25000)

  return { title, videoId, transcript: capped, author }
}
