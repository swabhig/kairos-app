import { createClient } from "@/lib/supabase/server"
import { crawlArticles, combineArticlesForAI } from "@/lib/crawler"
import { fetchYoutubeTranscript, extractVideoId } from "@/lib/youtube"

export const dynamic = "force-dynamic"
export const maxDuration = 60 // Allow up to 60 seconds for crawling

function looksLikeYoutube(url: string) {
  try {
    const u = new URL(url)
    return u.hostname === "youtu.be" || u.hostname.endsWith("youtube.com")
  } catch {
    return false
  }
}

export async function POST(req: Request) {
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
      }

      try {
        const supabase = await createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          send({ type: "error", error: "Not signed in" })
          controller.close()
          return
        }

        const { url } = (await req.json()) as { url?: string }
        if (!url || typeof url !== "string") {
          send({ type: "error", error: "A URL is required." })
          controller.close()
          return
        }

        let parsedUrl: URL
        try {
          parsedUrl = new URL(url)
        } catch {
          send({ type: "error", error: "Please enter a valid URL including https://" })
          controller.close()
          return
        }

        if (!["http:", "https:"].includes(parsedUrl.protocol)) {
          send({ type: "error", error: "Only http(s) URLs are supported." })
          controller.close()
          return
        }

        const isYoutube = looksLikeYoutube(url) && !!extractVideoId(url)

        if (isYoutube) {
          // YouTube: simple single fetch
          send({ type: "progress", current: 0, total: 1, message: "Fetching YouTube transcript..." })

          try {
            const yt = await fetchYoutubeTranscript(url)

            const { data, error } = await supabase
              .from("conversations")
              .insert({
                user_id: user.id,
                title: yt.title,
                source_type: "youtube",
                source_url: url,
                source_title: yt.title,
                source_content: yt.transcript,
                messages: [],
              })
              .select("id, title, source_type, source_url, source_title, created_at")
              .single()

            if (error) {
              send({ type: "error", error: "Could not save conversation." })
            } else {
              send({ type: "complete", conversation: data, articlesCount: 1 })
            }
          } catch (err) {
            send({ type: "error", error: err instanceof Error ? err.message : "Failed to fetch transcript" })
          }

          controller.close()
          return
        }

        // Web URL: use crawler
        send({ type: "progress", current: 0, total: 1, message: "Detecting content type..." })

        const result = await crawlArticles(url, (current, total, title) => {
          send({
            type: "progress",
            current,
            total,
            message: `Parsing article ${current} of ${total}: "${title.slice(0, 50)}..."`,
          })
        })

        if (result.articles.length === 0) {
          send({
            type: "error",
            error:
              result.errors.length > 0
                ? result.errors[0]
                : "Could not extract any content from this page. Try a direct article URL.",
          })
          controller.close()
          return
        }

        // Combine all articles for the AI
        const combinedContent = combineArticlesForAI(result.articles, result.authorName)

        // Create title based on whether it's an index or single article
        const title = result.isIndexPage
          ? result.authorName
            ? `${result.authorName}'s Articles (${result.articles.length})`
            : `${result.articles.length} Articles from ${parsedUrl.hostname}`
          : result.articles[0].title

        const { data, error } = await supabase
          .from("conversations")
          .insert({
            user_id: user.id,
            title,
            source_type: "url",
            source_url: url,
            source_title: title,
            source_content: combinedContent,
            messages: [],
          })
          .select("id, title, source_type, source_url, source_title, created_at")
          .single()

        if (error) {
          send({ type: "error", error: "Could not save conversation." })
        } else {
          send({
            type: "complete",
            conversation: data,
            articlesCount: result.articles.length,
            isIndex: result.isIndexPage,
            authorName: result.authorName,
          })
        }
      } catch (e) {
        send({
          type: "error",
          error: e instanceof Error ? e.message : "Something went wrong.",
        })
      }

      controller.close()
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  })
}
