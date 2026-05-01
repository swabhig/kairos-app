# verbe.store 🗣️
> *content into conversation — questions into clarity*

verbe lets you paste any article, blog post, or newsletter URL and have an AI-powered conversation about it. instead of reading everything, you just ask.

**live at → [verbe.store](https://verbe.store)**

---

## -> what it does

- paste a single article or a full substack/newsletter archive URL
- it parses and extracts the content
- then you chat with it — ask questions, get answers grounded in what you just gave it
- conversations are saved so you can come back to them

---


## -> tools & learning used to build this

this was my first vibe-coded project — meaning i built it mostly by prompting AI tools rather than writing code from scratch. here's what i used:

- **[braindumper.ai](http://braindumper.ai)** — brain dump and structure ideas
- **vercel v0** — generate UI components from prompts
- **claude** — code generation, debugging, architecture decisions
- **groq** — fast AI inference for the chat feature
- **supabase** — database and auth without backend complexity
- **github** — version control (still learning git properly!)
- **vercel** — deployment, literally just connect repo and push
- **GCP** — google cloud for OAuth setup
- **spaceship** — domain registration for verbe.store
- **deep learning prompt engineering course** — learned how to get better outputs from AI
- **buildfastwithAI claude course** — hands-on with claude specifically

---

## -> what i learned building this

- how to go from idea → working product without being a software engineer
- prompt engineering matters a lot — vague prompts = vague code
- supabase makes auth and database way less scary than expected
- Next.js app router is powerful but has a learning curve around server vs client components
- always test the auth flow early — it breaks in weird ways otherwise

---

## -> how this idea came about

i've been a long-time reader of [lenny's newsletter](https://www.lennysnewsletter.com). there's so much depth in it — and lenny's readers have been evolving with him through the AI wave.

watching him build lennybot — first as an MVP, now fully on [delphi.ai](https://delphi.ai) — planted a thought: what if you could talk to the people who shaped how you think? not just read their writing, but actually ask them things.

that's where verbe is heading.

---

## -> what's next

- **digital avatars of leaders & mentors** — imagine talking to a lennybot-style AI version of your favourite founder, mentor, or thought leader, trained on everything they've written and said. that's the direction.

---

## -> known gaps + what i'd improve next

these are honest rough edges — things i know need work:

- [ ] **error handling** is minimal — if a URL fails to parse, the feedback isn't great
- [ ] **YouTube transcript parsing** is disabled — was planned but not built yet
- [ ] **mobile experience** could be smoother
- [ ] **loading states** during crawling are basic
- [ ] **no rate limiting** on the API routes yet — could be a problem at scale
- [ ] **tests** — there are none. something to learn and add over time
- [ ] the `source_content` column stores full article text — not ideal at scale (better: chunk + embed)

---

## -> about me

**Swabhi Gupta** — customer success professional turned builder.

6+ years in CS across India, Middle East, Singapore, and North America. currently exploring what it means to build things, not just use them.

communities: women of CS · CS network · success hub

---

*built with curiosity, a lot of prompting, and very little caffiene.*
