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

async function fetchTranscriptFromInvidious(videoId: string): Promise<string | null> {
  const instances = [
    "https://vid.puffyan.us",
    "https://invidious.nerdvpn.de",
    "https://inv.riverside.rocks",
  ]
  
  for (const instance of instances) {
    try {
      const res = await fetch(`${instance}/api/v1/captions/${videoId}`, {
        signal: AbortSignal.timeout(8000),
      })
      if (!res.ok) continue
      
      const captions = await res.json()
      if (!Array.isArray(captions) || captions.length === 0) continue
      
      // Find English captions
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
      // Extract text from XML
      const textMatches = xml.match(/<text[^>]*>([^<]*)<\/text>/g)
      if (!textMatches) continue
      
      const transcript = textMatches
        .map(t => t.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#39;/g, "'").replace(/&quot;/g, '"'))
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

async function fetchTranscriptDirect(videoId: string): Promise<string | null> {
  try {
    // Try to get transcript from YouTube's timedtext API
    const url = `https://www.youtube.com/watch?v=${videoId}`
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
      signal: AbortSignal.timeout(10000),
    })
    
    if (!res.ok) return null
    
    const html = await res.text()
    
    // Try to extract captions URL from the page
    const captionsMatch = html.match(/"captionTracks":\s*(\[.*?\])/s)
    if (!captionsMatch) return null
    
    const captionTracks = JSON.parse(captionsMatch[1])
    if (!Array.isArray(captionTracks) || captionTracks.length === 0) return null
    
    // Find English or first available
    const track = captionTracks.find(
      (t: { languageCode?: string }) => t.languageCode === "en"
    ) || captionTracks[0]
    
    if (!track?.baseUrl) return null
    
    const captionRes = await fetch(track.baseUrl, {
      signal: AbortSignal.timeout(8000),
    })
    if (!captionRes.ok) return null
    
    const xml = await captionRes.text()
    const textMatches = xml.match(/<text[^>]*>([^<]*)<\/text>/g)
    if (!textMatches) return null
    
    const transcript = textMatches
      .map(t => t.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&#39;/g, "'"))
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

  // Try multiple methods
  let transcript = await fetchTranscriptDirect(videoId)
  
  if (!transcript) {
    transcript = await fetchTranscriptFromInvidious(videoId)
  }
  
  if (!transcript || transcript.length < 50) {
    throw new Error("Could not fetch a transcript for this video. It may not have captions enabled, or captions may be auto-generated and restricted.")
  }

  // Best-effort title and author fetch from oEmbed
  let title = `YouTube video ${videoId}`
  let author: string | undefined
  try {
    const r = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`, {
      signal: AbortSignal.timeout(8000),
    })
    if (r.ok) {
      const data = await r.json() as { title?: string; author_name?: string }
      if (data.title) title = data.title
      if (data.author_name) author = data.author_name
    }
  } catch {
    // ignore — title fallback is fine
  }

  // Cap length for model context
  const capped = transcript.slice(0, 25000)

  return { title, videoId, transcript: capped, author }
}
