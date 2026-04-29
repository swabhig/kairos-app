import { createClient } from "@/lib/supabase/server"
import { isLikelyIndexPage, extractArticleLinks, parseArticle, delay } from "@/lib/crawler"
import { scrapeUrl } from "@/lib/scrape"

export const dynamic = "force-dynamic"
export const maxDuration = 60 // Allow up to 60 seconds for crawling

/**
 * Crawl endpoint with Server-Sent Events for progress updates.
 * Detects index pages and crawls multiple articles.
 */
export async function POST(req: Request) {
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

  // Set up SSE stream
  const encoder = new TextEncoder()
  const stream = new TransformStream()
  const writer = stream.writable.getWriter()

  const sendEvent = async (event: string, data: unknown) => {
    await writer.write(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`))
  }

  // Process in background
  ;(async () => {
    try {
      // Check if this looks like an index page
      const likelyIndex = isLikelyIndexPage(url)
      
      if (likelyIndex) {
        await sendEvent("status", { message: "Detecting article links...", phase: "detecting" })
        
        const crawlResult = await extractArticleLinks(url)
        
        if (crawlResult.isIndexPage && crawlResult.articles.length > 0) {
          await sendEvent("status", { 
            message: `Found ${crawlResult.articles.length} articles. Starting to parse...`, 
            phase: "found",
            total: crawlResult.articles.length 
          })

          const parsedArticles: Array<{ title: string; content: string; url: string }> = []
          let successCount = 0

          for (let i = 0; i < crawlResult.articles.length; i++) {
            const article = crawlResult.articles[i]
            
            await sendEvent("progress", { 
              current: i + 1, 
              total: crawlResult.articles.length,
              currentTitle: article.title 
            })

            const parsed = await parseArticle(article.url)
            
            if (parsed.success && parsed.content) {
              parsedArticles.push({
                title: parsed.title,
                content: parsed.content,
                url: article.url,
              })
              successCount++
            }

            // Rate limiting - 800ms between requests
            if (i < crawlResult.articles.length - 1) {
              await delay(800)
            }
          }

          if (parsedArticles.length === 0) {
            await sendEvent("error", { error: "Could not parse any articles from this page." })
            await writer.close()
            return
          }

          await sendEvent("status", { 
            message: `Parsed ${successCount} articles. Creating conversation...`, 
            phase: "saving" 
          })

          // Combine all article content with clear separators
          const combinedContent = parsedArticles
            .map((a, i) => `--- Article ${i + 1}: ${a.title} ---\n\n${a.content}`)
            .join("\n\n\n")
            .slice(0, 80_000) // Cap total at 80k chars

          const mainTitle = crawlResult.siteName 
            ? `${crawlResult.mainTitle} (${crawlResult.articles.length} articles from ${crawlResult.siteName})`
            : `${crawlResult.mainTitle} (${crawlResult.articles.length} articles)`

          // Create conversation
          const { data, error } = await supabase
            .from("conversations")
            .insert({
              user_id: user.id,
              title: mainTitle,
              source_type: "url",
              source_url: url,
              source_title: mainTitle,
              source_content: combinedContent,
              author_name: crawlResult.authorName || null,
              messages: [],
            })
            .select("id, title, source_type, source_url, source_title, author_name, created_at")
            .single()

          if (error) {
            await sendEvent("error", { error: "Could not save conversation." })
            await writer.close()
            return
          }

          await sendEvent("complete", { 
            conversation: data,
            articleCount: parsedArticles.length 
          })
          await writer.close()
          return
        }
      }

      // Fall back to single article parsing
      await sendEvent("status", { message: "Parsing article...", phase: "single" })

      const page = await scrapeUrl(url)

      const { data, error } = await supabase
        .from("conversations")
        .insert({
          user_id: user.id,
          title: page.title,
          source_type: "url",
          source_url: url,
          source_title: page.title,
          source_content: page.content,
          author_name: page.author || null,
          messages: [],
        })
        .select("id, title, source_type, source_url, source_title, author_name, created_at")
        .single()

      if (error) {
        await sendEvent("error", { error: "Could not save conversation." })
        await writer.close()
        return
      }

      await sendEvent("complete", { conversation: data, articleCount: 1 })
      await writer.close()
    } catch (e) {
      const message = e instanceof Error ? e.message : "Something went wrong."
      await sendEvent("error", { error: message })
      await writer.close()
    }
  })()

  return new Response(stream.readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  })
}
