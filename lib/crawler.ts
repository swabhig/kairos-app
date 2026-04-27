import * as cheerio from "cheerio"

export type ArticleLink = {
  url: string
  title: string
}

export type CrawlResult = {
  isIndexPage: boolean
  articles: ArticleLink[]
  mainTitle: string
  siteName?: string
}

export type ParsedArticle = {
  url: string
  title: string
  content: string
  success: boolean
  error?: string
}

const BROWSER_HEADERS = {
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
}

/**
 * Detect if a URL is an archive/index/tag page (vs a single article)
 */
export function isLikelyIndexPage(url: string): boolean {
  const u = new URL(url)
  const path = u.pathname.toLowerCase()
  
  // Substack patterns
  if (u.hostname.includes("substack.com")) {
    if (path.startsWith("/t/") || path === "/" || path === "/archive") return true
    if (!path.startsWith("/p/")) return true // Substack articles are /p/slug
  }
  
  // Medium patterns
  if (u.hostname.includes("medium.com") || u.hostname.endsWith(".medium.com")) {
    if (path === "/" || path.match(/^\/tag\//)) return true
    if (!path.includes("/") || path.split("/").filter(Boolean).length < 2) return true
  }
  
  // Generic patterns
  if (path.match(/\/(archive|articles|posts|blog|news|category|tag|topics?|s\/)/i)) return true
  if (path === "/" || path === "") return true
  
  return false
}

/**
 * Extract article links from an index/archive page
 */
export async function extractArticleLinks(url: string): Promise<CrawlResult> {
  const res = await fetch(url, {
    headers: BROWSER_HEADERS,
    redirect: "follow",
    signal: AbortSignal.timeout(15_000),
  })

  if (!res.ok) {
    throw new Error(`Failed to fetch page (status ${res.status})`)
  }

  const html = await res.text()
  const $ = cheerio.load(html)

  const mainTitle =
    $('meta[property="og:title"]').attr("content")?.trim() ||
    $("title").first().text().trim() ||
    "Archive"

  const siteName = $('meta[property="og:site_name"]').attr("content")?.trim()

  const baseUrl = new URL(url)
  const articles: ArticleLink[] = []
  const seenUrls = new Set<string>()

  // Find article links - prioritize common patterns
  const linkSelectors = [
    // Substack
    'a[data-testid="post-preview-title"]',
    '.post-preview a',
    '.post-preview-title a',
    // Medium
    'article a[data-post-id]',
    'article a[aria-label]',
    // Generic blog patterns
    'article a[href*="/p/"]',
    'article a[href*="/post/"]',
    'article a[href*="/blog/"]',
    '.post-title a',
    '.entry-title a',
    'h2 a[href]',
    'h3 a[href]',
    '.article-link',
    '.post a[href]',
  ]

  for (const selector of linkSelectors) {
    $(selector).each((_, el) => {
      const href = $(el).attr("href")
      if (!href) return

      try {
        const fullUrl = new URL(href, baseUrl).href
        const linkUrl = new URL(fullUrl)
        
        // Only same domain
        if (linkUrl.hostname !== baseUrl.hostname) return
        
        // Skip navigation, tags, archive links
        if (linkUrl.pathname.match(/\/(tag|category|archive|about|contact|subscribe|signin|login)/i)) return
        
        // Skip if already seen
        if (seenUrls.has(fullUrl)) return
        seenUrls.add(fullUrl)

        // Get title from link text or nearby heading
        let title = $(el).text().trim()
        if (!title || title.length < 5) {
          title = $(el).closest("article, .post, .entry").find("h2, h3, .title").first().text().trim()
        }
        if (!title || title.length < 5) {
          title = linkUrl.pathname.split("/").pop()?.replace(/-/g, " ") || "Untitled"
        }

        articles.push({ url: fullUrl, title })
      } catch {
        // Invalid URL, skip
      }
    })
    
    // Stop if we have enough articles
    if (articles.length >= 30) break
  }

  // If no articles found with specific selectors, try generic approach
  if (articles.length === 0) {
    $("a[href]").each((_, el) => {
      const href = $(el).attr("href")
      if (!href) return

      try {
        const fullUrl = new URL(href, baseUrl).href
        const linkUrl = new URL(fullUrl)
        
        if (linkUrl.hostname !== baseUrl.hostname) return
        if (seenUrls.has(fullUrl)) return
        
        // Look for article-like URLs
        if (linkUrl.pathname.match(/\/(p|post|posts|article|articles|blog)\//i) ||
            linkUrl.pathname.match(/\/\d{4}\/\d{2}\//)) { // Date-based URLs
          seenUrls.add(fullUrl)
          
          let title = $(el).text().trim()
          if (!title || title.length < 5) {
            title = linkUrl.pathname.split("/").pop()?.replace(/-/g, " ") || "Untitled"
          }
          
          articles.push({ url: fullUrl, title })
        }
      } catch {
        // Skip
      }
      
      if (articles.length >= 30) return false
    })
  }

  return {
    isIndexPage: articles.length > 1,
    articles: articles.slice(0, 30), // Cap at 30 articles
    mainTitle,
    siteName,
  }
}

/**
 * Parse a single article and extract its content
 */
export async function parseArticle(url: string): Promise<ParsedArticle> {
  try {
    const res = await fetch(url, {
      headers: BROWSER_HEADERS,
      redirect: "follow",
      signal: AbortSignal.timeout(15_000),
    })

    if (!res.ok) {
      return { url, title: "", content: "", success: false, error: `HTTP ${res.status}` }
    }

    const html = await res.text()
    const $ = cheerio.load(html)

    const title =
      $('meta[property="og:title"]').attr("content")?.trim() ||
      $("title").first().text().trim() ||
      "Untitled"

    // Remove non-content elements
    $("script, style, noscript, iframe, nav, footer, header, aside, form, button").remove()
    $('[role="navigation"], [role="banner"], [role="contentinfo"]').remove()

    // Try common article containers
    const candidates = ["article", '[role="main"]', "main", ".post-content", ".entry-content", ".article-body"]
    let text = ""
    for (const selector of candidates) {
      const el = $(selector).first()
      if (el.length) {
        text = el.text()
        if (text.trim().length > 300) break
      }
    }
    if (!text || text.trim().length < 300) {
      text = $("body").text()
    }

    const cleaned = text.replace(/\s+/g, " ").trim()
    
    if (cleaned.length < 100) {
      return { url, title, content: "", success: false, error: "Content too short" }
    }

    // Cap each article at 15k chars
    const capped = cleaned.slice(0, 15_000)

    return { url, title, content: capped, success: true }
  } catch (e) {
    return { url, title: "", content: "", success: false, error: e instanceof Error ? e.message : "Unknown error" }
  }
}

/**
 * Rate-limited delay
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
