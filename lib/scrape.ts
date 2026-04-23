import * as cheerio from "cheerio"

export type ScrapeResult = {
  title: string
  content: string
  siteName?: string
}

/**
 * Fetch a URL and extract the main article text using cheerio.
 * Strips scripts, nav, footer, ads, etc. Good enough for MVP blog parsing.
 */
export async function scrapeUrl(url: string): Promise<ScrapeResult> {
  const res = await fetch(url, {
    headers: {
      // Use a real browser UA. Sites like Medium block anything that
      // self-identifies as a bot.
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
      "Cache-Control": "no-cache",
      "Sec-Fetch-Dest": "document",
      "Sec-Fetch-Mode": "navigate",
      "Sec-Fetch-Site": "none",
      "Sec-Fetch-User": "?1",
      "Upgrade-Insecure-Requests": "1",
    },
    redirect: "follow",
    // Cap the request so we don't hang forever
    signal: AbortSignal.timeout(15_000),
  })

  if (!res.ok) {
    if (res.status === 403 || res.status === 401) {
      throw new Error(
        `This site blocked the request (${res.status}). Try a direct article URL instead of a profile or index page.`,
      )
    }
    throw new Error(`Failed to fetch URL (status ${res.status})`)
  }

  const html = await res.text()
  const $ = cheerio.load(html)

  // Grab title
  const title =
    $('meta[property="og:title"]').attr("content")?.trim() ||
    $('meta[name="twitter:title"]').attr("content")?.trim() ||
    $("title").first().text().trim() ||
    "Untitled"

  const siteName = $('meta[property="og:site_name"]').attr("content")?.trim()

  // Remove non-content elements
  $("script, style, noscript, iframe, nav, footer, header, aside, form, button").remove()
  $('[role="navigation"], [role="banner"], [role="contentinfo"], [aria-hidden="true"]').remove()

  // Try common article containers first, fall back to body
  const candidates = ["article", '[role="main"]', "main", ".post", ".entry-content", ".article-body", "#content"]
  let text = ""
  for (const selector of candidates) {
    const el = $(selector).first()
    if (el.length) {
      text = el.text()
      if (text.trim().length > 400) break
    }
  }
  if (!text || text.trim().length < 400) {
    text = $("body").text()
  }

  // Collapse whitespace
  const cleaned = text.replace(/\s+/g, " ").trim()

  if (cleaned.length < 100) {
    throw new Error("Could not extract enough content from this page. Try a different URL.")
  }

  // Cap to roughly 25k chars so we don't blow the model context
  const capped = cleaned.slice(0, 25_000)

  return { title, content: capped, siteName }
}
