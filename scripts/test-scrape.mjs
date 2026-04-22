import * as cheerio from "cheerio"

const urls = [
  "https://ravsterd.medium.com/",
  "https://www.thecscafe.com/s/customer-success-news",
  "https://www.lennysnewsletter.com/archive?sort=top",
]

const headers = {
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

function extract(html) {
  const $ = cheerio.load(html)
  const title =
    $('meta[property="og:title"]').attr("content") ||
    $("title").text().trim() ||
    ""
  $("script, style, noscript, svg, nav, footer, header, aside, form, iframe").remove()
  const article = $("article").first()
  const main = $("main").first()
  const root = article.length ? article : main.length ? main : $("body")
  let text = root.text().replace(/\s+/g, " ").trim()
  if (text.length > 1200) text = text.slice(0, 1200) + "…"
  return { title, length: root.text().length, preview: text }
}

for (const url of urls) {
  console.log("\n========================================")
  console.log("URL:", url)
  try {
    const res = await fetch(url, { headers, redirect: "follow" })
    console.log("Status:", res.status)
    if (!res.ok) {
      console.log("Body snippet:", (await res.text()).slice(0, 300))
      continue
    }
    const html = await res.text()
    const { title, length, preview } = extract(html)
    console.log("Title:", title)
    console.log("Extracted chars:", length)
    console.log("Preview (first 1200 chars):")
    console.log(preview)
  } catch (err) {
    console.log("Error:", err.message)
  }
}
