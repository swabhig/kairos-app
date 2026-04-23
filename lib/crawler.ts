import * as cheerio from "cheerio"
import { scrapeUrl, type ScrapeResult } from "./scrape"

export type CrawlResult = {
  isIndexPage: boolean
  authorName?: string
  articles: Array<{
    url: string
    title: string
    content: string
  }>
  totalFound: number
  totalParsed: number
  errors: string[]
}

const FETCH_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
  "Cache-Control": "no-cache",
  "Sec-Fetch-Dest": "document",
  "Sec-Fetch-Mode": "navigate",
  "Sec-Fetch-Site": "none",
  "Sec-Fetch-User": "?1",
  "Upgrade-Insecure-Requests": "1",
}

/**
 * Detects if a page is an index/archive page and extracts article links.
 */
export async function detectAndExtractLinks(
  url: string
): Promise<{ isIndex: boolean; links: string[]; authorName?: string }> {
  const res = await fetch(url, {
    headers: FETCH_HEADERS,
    redirect: "follow",
    signal: AbortSignal.timeout(15_000),
  })

  if (!res.ok) {
    throw new Error(`Failed to fetch (${res.status})`)
  }

  const html = await res.text()
  const $ = cheerio.load(html)
  const baseUrl = new URL(url)

  // Try to extract author name from common meta tags
  const authorName =
    $('meta[name="author"]').attr("content")?.trim() ||
    $('meta[property="article:author"]').attr("content")?.trim() ||
    $('meta[property="og:site_name"]').attr("content")?.trim() ||
    $('a[rel="author"]').first().text().trim() ||
    undefined

  // Collect all links
  const allLinks: string[] = []
  $("a[href]").each((_, el) => {
    const href = $(el).attr("href")
    if (!href) return

    try {
      const linkUrl = new URL(href, baseUrl.origin)

      // Only same domain
      if (linkUrl.hostname !== baseUrl.hostname) return

      // Skip common non-article paths
      const path = linkUrl.pathname.toLowerCase()
      if (
        path === "/" ||
        path.startsWith("/auth") ||
        path.startsWith("/login") ||
        path.startsWith("/signup") ||
        path.startsWith("/search") ||
        path.startsWith("/tag") ||
        path.startsWith("/category") ||
        path.startsWith("/about") ||
        path.startsWith("/contact") ||
        path.startsWith("/privacy") ||
        path.startsWith("/terms") ||
        path.startsWith("/subscribe") ||
        path.includes("/page/") ||
        path.endsWith(".pdf") ||
        path.endsWith(".xml") ||
        path.endsWith(".json")
      ) {
        return
      }

      // Skip if it's just the base URL with different query/hash
      if (linkUrl.pathname === baseUrl.pathname && linkUrl.pathname === "/") return

      // Looks like an article link (has a path segment)
      const pathSegments = linkUrl.pathname.split("/").filter(Boolean)
      if (pathSegments.length > 0) {
        const cleanUrl = `${linkUrl.origin}${linkUrl.pathname}`
        if (!allLinks.includes(cleanUrl) && cleanUrl !== url) {
          allLinks.push(cleanUrl)
        }
      }
    } catch {
      // Invalid URL, skip
    }
  })

  // Heuristic: if we found many links (5+), it's likely an index page
  const isIndex = allLinks.length >= 5

  // For Medium author pages, extract article links more specifically
  if (baseUrl.hostname.includes("medium.com") || baseUrl.hostname.endsWith(".medium.com")) {
    const mediumLinks: string[] = []
    $("article a[href], [data-testid='post-preview'] a[href], h2 a[href], h3 a[href]").each((_, el) => {
      const href = $(el).attr("href")
      if (!href) return
      try {
        const linkUrl = new URL(href, baseUrl.origin)
        // Medium article URLs typically have a hash ID at the end
        if (linkUrl.pathname.match(/[\w-]+-[a-f0-9]+$/i)) {
          const cleanUrl = `${linkUrl.origin}${linkUrl.pathname}`
          if (!mediumLinks.includes(cleanUrl)) {
            mediumLinks.push(cleanUrl)
          }
        }
      } catch {
        // Skip invalid
      }
    })
    if (mediumLinks.length > 0) {
      return { isIndex: true, links: mediumLinks, authorName }
    }
  }

  // For Substack archive pages
  if (url.includes("/archive") || url.includes("/s/")) {
    const substackLinks: string[] = []
    $('a[href*="/p/"]').each((_, el) => {
      const href = $(el).attr("href")
      if (!href) return
      try {
        const linkUrl = new URL(href, baseUrl.origin)
        const cleanUrl = `${linkUrl.origin}${linkUrl.pathname}`
        if (!substackLinks.includes(cleanUrl)) {
          substackLinks.push(cleanUrl)
        }
      } catch {
        // Skip invalid
      }
    })
    if (substackLinks.length > 0) {
      return { isIndex: true, links: substackLinks, authorName }
    }
  }

  return { isIndex, links: allLinks.slice(0, 30), authorName } // Cap at 30 articles max
}

/**
 * Sleep helper for rate limiting
 */
function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Crawl multiple articles from an index page.
 * Rate-limited to ~1 request per second to be polite.
 */
export async function crawlArticles(
  indexUrl: string,
  onProgress?: (current: number, total: number, title: string) => void
): Promise<CrawlResult> {
  const { isIndex, links, authorName } = await detectAndExtractLinks(indexUrl)

  if (!isIndex || links.length === 0) {
    // Not an index page, just scrape the single URL
    try {
      const result = await scrapeUrl(indexUrl)
      return {
        isIndexPage: false,
        authorName,
        articles: [{ url: indexUrl, title: result.title, content: result.content }],
        totalFound: 1,
        totalParsed: 1,
        errors: [],
      }
    } catch (err) {
      return {
        isIndexPage: false,
        authorName,
        articles: [],
        totalFound: 1,
        totalParsed: 0,
        errors: [err instanceof Error ? err.message : "Failed to parse"],
      }
    }
  }

  const articles: CrawlResult["articles"] = []
  const errors: string[] = []
  const total = links.length

  for (let i = 0; i < links.length; i++) {
    const link = links[i]

    try {
      const result = await scrapeUrl(link)
      articles.push({
        url: link,
        title: result.title,
        content: result.content,
      })

      onProgress?.(i + 1, total, result.title)
    } catch (err) {
      errors.push(`${link}: ${err instanceof Error ? err.message : "Failed"}`)
    }

    // Rate limit: wait 800ms between requests
    if (i < links.length - 1) {
      await sleep(800)
    }
  }

  return {
    isIndexPage: true,
    authorName,
    articles,
    totalFound: total,
    totalParsed: articles.length,
    errors,
  }
}

/**
 * Combine all articles into a single corpus for the AI.
 * Format: each article separated by a clear delimiter.
 */
export function combineArticlesForAI(
  articles: Array<{ title: string; content: string; url: string }>,
  authorName?: string
): string {
  const header = authorName
    ? `This is a collection of ${articles.length} articles by ${authorName}.\n\n`
    : `This is a collection of ${articles.length} articles.\n\n`

  const combined = articles
    .map(
      (article, index) =>
        `--- ARTICLE ${index + 1}: "${article.title}" ---\nSource: ${article.url}\n\n${article.content}`
    )
    .join("\n\n")

  // Cap total content to ~80k chars for model context
  const fullContent = header + combined
  return fullContent.slice(0, 80_000)
}
