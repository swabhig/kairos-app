import * as cheerio from "cheerio"

export type ArticleLink = {
  url: string
  title: string
  author?: string
}

export type CrawlResult = {
  isIndexPage: boolean
  articles: ArticleLink[]
  mainTitle: string
  siteName?: string
  authorName?: string
}

export type ParsedArticle = {
  url: string
  title: string
  content: string
  author?: string
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
}

/**
 * Detect if a URL is an archive/index/tag page
 */
export function isLikelyIndexPage(url: string): boolean {
  const u = new URL(url)
  const path = u.pathname.toLowerCase()
  
  // Substack patterns
  if (u.hostname.includes("substack.com")) {
    if (path.startsWith("/t/") || path === "/" || path.startsWith("/archive")) return true
    if (!path.startsWith("/p/")) return true
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
 * Try to get articles from Substack RSS feed (more complete than HTML scraping)
 */
async function trySubstackRSS(url: string): Promise<CrawlResult | null> {
  try {
    const u = new URL(url)
    if (!u.hostname.includes("substack.com")) return null
    
    // Build RSS feed URL
    const feedUrl = `https://${u.hostname}/feed`
    
    const res = await fetch(feedUrl, {
      headers: { "User-Agent": BROWSER_HEADERS["User-Agent"] },
      signal: AbortSignal.timeout(10_000),
    })
    
    if (!res.ok) return null
    
    const xml = await res.text()
    const $ = cheerio.load(xml, { xmlMode: true })
    
    const channelTitle = $("channel > title").first().text().trim()
    const authorName = $("channel > dc\\:creator, channel > author").first().text().trim() ||
                       channelTitle.replace(/ on Substack$/i, "").trim()
    
    const articles: ArticleLink[] = []
    
    $("item").each((_, el) => {
      const title = $(el).find("title").text().trim()
      const link = $(el).find("link").text().trim()
      
      if (title && link && link.includes("/p/")) {
        articles.push({ url: link, title, author: authorName })
      }
    })
    
    if (articles.length === 0) return null
    
    return {
      isIndexPage: true,
      articles: articles.slice(0, 50), // RSS typically has 50+ articles
      mainTitle: channelTitle || "Newsletter Archive",
      siteName: u.hostname.replace(".substack.com", ""),
      authorName,
    }
  } catch {
    return null
  }
}

/**
 * Extract article links from an index/archive page
 */
export async function extractArticleLinks(url: string): Promise<CrawlResult> {
  // Try RSS first for Substack (gets more articles)
  const rssResult = await trySubstackRSS(url)
  if (rssResult && rssResult.articles.length > 0) {
    return rssResult
  }
  
  // Fall back to HTML scraping
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
  
  // Try to extract author name
  const authorName = 
    $('meta[name="author"]').attr("content")?.trim() ||
    $('meta[property="article:author"]').attr("content")?.trim() ||
    $(".author-name, .byline-name, [rel='author']").first().text().trim() ||
    siteName?.replace(/ on Substack$/i, "").trim()

  const baseUrl = new URL(url)
  const articles: ArticleLink[] = []
  const seenUrls = new Set<string>()

  const linkSelectors = [
    'a[data-testid="post-preview-title"]',
    '.post-preview a',
    '.post-preview-title a',
    'article a[data-post-id]',
    'article a[aria-label]',
    'article a[href*="/p/"]',
    'article a[href*="/post/"]',
    '.post-title a',
    '.entry-title a',
    'h2 a[href]',
    'h3 a[href]',
  ]

  for (const selector of linkSelectors) {
    $(selector).each((_, el) => {
      const href = $(el).attr("href")
      if (!href) return

      try {
        const fullUrl = new URL(href, baseUrl).href
        const linkUrl = new URL(fullUrl)
        
        if (linkUrl.hostname !== baseUrl.hostname) return
        if (linkUrl.pathname.match(/\/(tag|category|archive|about|contact|subscribe|signin|login)/i)) return
        if (seenUrls.has(fullUrl)) return
        seenUrls.add(fullUrl)

        let title = $(el).text().trim()
        if (!title || title.length < 5) {
          title = $(el).closest("article, .post, .entry").find("h2, h3, .title").first().text().trim()
        }
        if (!title || title.length < 5) {
          title = linkUrl.pathname.split("/").pop()?.replace(/-/g, " ") || "Untitled"
        }

        articles.push({ url: fullUrl, title, author: authorName })
      } catch {
        // Skip invalid URLs
      }
    })
    
    if (articles.length >= 50) break
  }

  return {
    isIndexPage: articles.length > 1,
    articles: articles.slice(0, 50),
    mainTitle,
    siteName,
    authorName,
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
    
    const author = 
      $('meta[name="author"]').attr("content")?.trim() ||
      $('meta[property="article:author"]').attr("content")?.trim() ||
      $(".author-name, .byline-name, [rel='author']").first().text().trim()

    $("script, style, noscript, iframe, nav, footer, header, aside, form, button").remove()
    $('[role="navigation"], [role="banner"], [role="contentinfo"]').remove()

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

    const capped = cleaned.slice(0, 15_000)

    return { url, title, content: capped, author, success: true }
  } catch (e) {
    return { url, title: "", content: "", success: false, error: e instanceof Error ? e.message : "Unknown error" }
  }
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
