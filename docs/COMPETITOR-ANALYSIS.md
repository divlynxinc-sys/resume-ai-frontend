# How the AI resume builders win Google and ChatGPT — and what JobSynk is missing

**Researched 2026-07-13.** Live fetches of competitor sitemaps, robots.txt, rendered HTML and JSON-LD, plus the published research on AI-answer citation. Every number here was verified on the date above, or is explicitly flagged `unverified`.

---

## 0. The short version

Three findings, in order of how much they should change what you do on Monday.

**1. You are invisible to every AI answer engine except Google, and it is not a content problem — it is an architecture problem.**
Vercel and MERJ instrumented ~1 billion crawler requests and measured which bots execute JavaScript. Googlebot and AppleBot do. **GPTBot, ClaudeBot, OAI-SearchBot and PerplexityBot fetch JavaScript and never execute it.** JobSynk ships `<div id="root"></div>` and nothing else, so to ChatGPT, Claude and Perplexity **every page of jobsynk.ai was a blank document.** No amount of writing fixes that. This is why the blog in this PR is *prerendered to static HTML* rather than being another lazy-loaded SPA route.

**2. LLMs recommend you because of what *other people's pages* say about you — not your website.**
Across 40 SaaS categories, when ChatGPT recommends a tool it cites that tool's **own domain only 11.6% of the time**. The other 88.4% is third-party listicles, Reddit threads, and review blogs. Your site's job is to be crawlable, consistent and quotable. The actual acquisition channel is *being named in someone else's "best AI resume builder" article*.

**3. The market leaders' single highest-ROI asset is one page, and it is trivially copyable.**
Kickresume ranks **#1 organically for "best AI resume builder"** — with **their own help-center listicle** that reviews their competitors honestly, discloses the bias, and still awards Kickresume every category. Rezi and Teal both do the same thing. When an LLM answers "what's the best AI resume builder?", the "objective comparison" it retrieves **was written by a competitor.** Nobody is stopping you from doing this. It costs one writer one week.

---

## 1. Who actually ranks, and why

For the head term **"AI resume builder"** and its variants, the consistent top-3 is **Rezi, Kickresume, and Teal**, with **Enhancv** dominating the long-tail content layer and owning the statistics citation game.

| | **Rezi** | **Kickresume** | **Teal** | **Enhancv** | **JobSynk (today)** |
|---|---|---|---|---|---|
| Marketing site | Webflow, static | Django SSR | Webflow, static | Next.js SSR | **Vite SPA, client-rendered** |
| Indexed pages | **739** | **~25,281** (≈4,500 unique EN) | **~3.39M** (7,246 marketing) | **~2,400** | **~10 public routes** |
| Blog posts | 352 | Orphaned from sitemap | 592 | 482 | **0 → now 6** |
| Programmatic pages | ~250 | ~4,000 EN | ~5,800 | ~1,800 | 0 |
| Free tools (link magnets) | 10 | 22 | **38** | 12 | **0** |
| `sitemap.xml` | ✅ | ✅ | ✅ | ✅ (not in robots) | **❌ → now ✅** |
| `robots.txt` | ✅ open | ✅ open | ✅ open | ✅ open | **❌ → now ✅** |
| JSON-LD | Article, FAQ, SoftwareApp, AggregateRating | Article, AggregateRating (none on money pages) | Article, **FAQPage**, Breadcrumb | Article, Breadcrumb (**no FAQ**) | **❌ → now ✅** |
| `llms.txt` | ❌ 404 | ❌ 404 | ❌ 404 | ❌ 404 | **❌ → now ✅** |
| Comparison / "vs" pages | **19+** | 13 | **76** | 9 | **0** |
| Original data study | **❌ none** | ✅ 1.8M–2.1M CV corpus | ❌ | ✅ **31,000-resume study** | ❌ |
| Pricing | $29/mo, **$149 lifetime** | $19/mo → $4.50/mo annual | **$13/wk**, $29/mo | $39/mo, $99/6mo | $14.99/wk, $35.99/mo, $79.99/3mo |

**Not one of the four has an `llms.txt`.** All four leave AI crawlers fully unblocked. Their LLM visibility is *earned by corpus presence*, not by AEO plumbing — which means the plumbing is an open lane, and the corpus presence is the real war.

---

## 2. How they rank on Google — three mechanics

### Mechanic 1 — Programmatic SEO: one template × a list of job titles

This is the entire engine, and it is dumber than it looks.

- **Teal**: one list of ~695 job titles × **three page templates** (`/career-paths/{title}`, `/{title}-certifications`, `/{title}-interview-questions`) = ~2,078 pages from a single spreadsheet. Plus **907 `/resume-synonyms/{word}` pages** — literally one page per synonym for "managed".
- **Kickresume**: ~2,264 `/{job}-resume-sample/` pages, 1,367 cover-letter samples, and **510 `/{company}-company-samples/` pages** (the "resume that got into Google" play, covering Fortune 500s *and universities*).
- **Rezi**: 150 `/resume-examples/{job-title}` + **77 `/resignation-letter-template/{variant}`** pages. That second one is the sharpest move in the whole category: they rank **#1 in the US for "resignation letter"** — a high-volume keyword no other resume builder even contests.

**The lesson is not "publish 10,000 pages."** It's that a *single* well-chosen adjacent keyword (resignation letters) beat a head-on fight for "resume builder."

### Mechanic 2 — Free tools as link magnets, gated at the result

Every leader runs free tools whose real job is to rank and collect links.
- Enhancv's **free 27-check resume checker requires no signup** — their single best acquisition asset.
- Rezi's ATS checker **requires an account to see results**. The tool page ranks; the wall converts.
- Teal runs **38 of them**.

**JobSynk has zero.** And you are sitting on the obvious one: you already compute an ATS score client-side (`calculateLiveAtsEstimate`). An ungated public ATS checker at `/ats-checker` is the highest-leverage page you don't have.

### Mechanic 3 — Own your own brand SERP

Rezi runs `/rezi-reviews` and `/posts/is-rezi-worth-it`. Teal literally publishes `/post/teal-review` — **Teal reviewing Teal** — so that when someone (or some model) searches "Teal review," the first-party page is there to be found instead of a critic's.

---

## 3. How they get cited by ChatGPT and Claude — the AEO mechanics

This is where the real money is, and where the evidence is messier than the vendors selling "GEO services" admit. Here's what actually holds up.

### What's genuinely evidenced

| Finding | Evidence | Confidence |
|---|---|---|
| **AI crawlers don't run JavaScript** | Vercel/MERJ, ~1B requests. GPTBot fetches JS in 11.5% of requests and executes it in **0%**. ClaudeBot: 23.8% fetched, **0% executed**. | **Solid — primary data** |
| **Stats, quotations and cited sources make a page more quotable** | Princeton/Georgia Tech **GEO paper (KDD 2024)**, ~10k queries: adding statistics ≈ **+41% visibility**; citing sources ≈ **+31%**; quotations ≈ **+28%**. Crucially, the gain is **largest for low-ranked pages (up to +115% at position ~5)** and ~zero for pages already at #1. **GEO is a challenger's tool — which is exactly what you are.** | **Peer-reviewed**, but tested on a simulated engine in 2023–24. Mechanism credible; the exact % is not transferable. |
| **Keyword stuffing actively hurts** | Same paper: **zero gain, and ~10% worse on Perplexity.** | **Peer-reviewed** |
| **Recency is a real, causal bias** | arXiv preprint, 7 models: injecting a *newer date string* alone moved passages **up to 95 rank positions** and flipped **up to 25% of pairwise preferences**. | Preprint (not peer-reviewed), but the cleanest causal evidence in the field |
| **Third-party pages, not your own, drive recommendations** | DerivateX, 40 SaaS categories: vendor's own domain = **11.6%** of citations. Independent blogs = **81.9%**. Reddit = 8.4%. **G2 + Capterra = 0.9%.** | Observational, single study |
| **What a cited listicle looks like** | Of 143 ChatGPT-cited pages: **100%** used list structure, **78%** had a **year in the title**, **68%** had a **comparison table**, **56%** had an **FAQ block**. | Observational |

### What is hype — do not spend money on it

| Claim | Reality |
|---|---|
| **"Schema markup boosts AI citations"** | **Contradicted.** Ahrefs tracked 1,885 pages that added JSON-LD against a 4,000-page control: **no uplift on ChatGPT or AI Mode, and −4.6% on AI Overviews.** Ship schema for Google rich results and entity resolution — **not** for AI citations. |
| **"llms.txt is read by OpenAI/Anthropic/Perplexity"** | **Unverified, probably false.** Google's John Mueller says no Google system reads it. No primary-source confirmation from OpenAI, Anthropic or Perplexity exists. We shipped one anyway — it costs 5 minutes. **Do not let anyone bill you for an "llms.txt strategy."** |
| **"Reddit is 40% of AI citations"** | **Misleading.** That's the % of *responses containing* a Reddit link. Reddit is **~3% of ChatGPT's total citations** (Profound, 730k conversations). Still worth doing — just not the silver bullet. |
| **"You can rank #1 in ChatGPT"** | **False.** SparkToro/Gumshoe, 2,961 prompt runs: ask twice, and there's a **<1-in-100 chance of getting the same list.** There is no "rank." Optimise for **consideration-set membership**, measured across ≥50 runs. Any tool selling you an "AI rank" is selling noise. |
| **G2 / Capterra reviews** | **0.9% of citations** — but **100% of ChatGPT-recommended tools had a Capterra profile and 99% had G2.** Treat as a **binary inclusion gate**: create the profiles, get ~15–20 real reviews, then stop. |

### The single most valuable thing the leaders do: **publish original data**

This is Enhancv's entire moat, and it is worth understanding precisely.

Enhancv publishes [`/blog/resume-statistics/`](https://enhancv.com/blog/resume-statistics/) — *"170+ Must-Know Resume Statistics"* — built on **an original analysis of 31,000 of their own users' resumes**. They label their own numbers "(Enhancv)" and candidly note the limitation ("limited to users of our platform"), which *increases* perceived rigor.

The mechanism: publish a number → thousands of career blogs cite "(Enhancv)" → that citation pattern saturates both the training corpus and the live retrieval index → **every LLM now "knows" Enhancv is the authority on resume statistics.** They bought permanent LLM citation with one page and a dataset they already owned.

Kickresume does the same with a **1.8M–2.1M CV corpus** and n≈1,300–2,800 user surveys, and gets syndicated by CNBC, WSJ, Forbes and the New York Post — generating exactly the *"According to Kickresume, X% of…"* phrasing that lands in training data.

**Rezi — the #1-ranked player — has published none. Zero.** It's the biggest open lane in the category, it's the #1 and #2 tactic in the only peer-reviewed GEO study, and the market leader has simply not done it.

---

## 4. What JobSynk was missing — severity-ranked

| # | Gap | Severity | Status |
|---|---|---|---|
| 1 | **Client-rendered SPA → invisible to GPTBot/ClaudeBot/PerplexityBot.** Empty `<div id="root">` on every route. | 🔴 **Critical** | ✅ **Fixed for the whole public surface.** `/` went 0 → **1,324 crawler-visible words** |
| 2 | **No content at all.** Zero blog posts vs Rezi's 352, Teal's 592, Enhancv's 482. Nothing to cite, nothing to rank. | 🔴 Critical | ✅ **6 posts shipped** (1,072–1,184 words each) |
| 3 | **No `robots.txt`** — AI crawler access never declared. | 🔴 Critical | ✅ Shipped |
| 4 | **No `sitemap.xml`** — never submitted to Google or Bing. | 🔴 Critical | ✅ Shipped |
| 5 | **One static `<title>` for all routes**, no meta description, no canonical, no OG tags. | 🔴 Critical | ✅ `lib/seo.ts` + prerenderer |
| 6 | **No JSON-LD** — no Organization, no Article, no FAQPage, no Breadcrumbs. | 🟡 High (for Google, not for AI) | ✅ Shipped |
| 7 | **No free public tool.** Every competitor has 10–38. | 🟡 High | ✅ **`/ats-checker` shipped** — ungated, client-side, no signup |
| 8 | **No comparison / "vs" pages.** Teal has 76. This is where LLMs resolve "which resume tool should I use". | 🟡 High | ❌ **Do this next** |
| 9 | **No original data study.** The single highest-ROI AEO asset in the category. | 🟡 High | ⏳ Blocked on data — run [`data-study.sql`](data-study.sql) |
| 10 | **No G2 / Capterra profile** — the binary inclusion gate. | 🟢 Medium | ❌ |
| 11 | **Not in a single third-party listicle** — and that's 81.9% of how LLMs pick tools. | 🔴 Critical (but off-site) | ❌ **The real channel** |
| 12 | **No YouTube presence.** Highest single correlate with AI visibility (0.737) and 32.4% of Perplexity citations. | 🟢 Medium | ❌ |

---

## 5. What this PR actually ships

**The whole public surface is now real HTML.** `scripts/prerender.mjs` runs after `vite build` and uses two renderers: the blog from plain data, the marketing pages through `react-dom/server` (so their markup can't drift from the React components). Measured crawler-visible words, with JavaScript disabled — which is exactly what GPTBot and ClaudeBot see:

| Route | Before | After |
|---|---|---|
| `/` | **0** | **1,324** |
| `/ats-checker` | — | 567 |
| `/faq` | **0** | 344 |
| `/blog` | — | 318 |
| `/blog/<post>` × 6 | — | 1,200–1,328 each |
| `/pricing`, `/enterprise`, `/security` | **0** | 196 / 134 / 262 |

- **`/ats-checker`** — the free tool. Paste a resume (+ optional job description) → a 0–100 parse-readiness score and 10 named checks with fixes. **No signup, no backend, no LLM call** — `lib/ats-check.ts` is a pure function running in the browser, which is what lets the result be given away and costs nothing to serve. Harness: `npm run ats:test`.
- **`/blog` + `/blog/:slug`** — 6 posts, 1,072–1,184 words each.
- **`sitemap.xml`, `robots.txt`** (GPTBot, OAI-SearchBot, ClaudeBot, Claude-SearchBot, PerplexityBot explicitly allowed), **`llms.txt`**.
- **`lib/seo.ts`** — per-route title/description/canonical/OG + JSON-LD.
- **JSON-LD**: Organization, WebSite, SoftwareApplication, Article, **FAQPage**, BreadcrumbList.

**Two deliberate positioning choices, both defensible:**

1. Every competitor leads with *"75% of resumes are rejected by the ATS."* **That statistic has no traceable source.** We don't repeat it — the ATS post debunks it.
2. The ATS checker **tells the user, on screen, that no ATS emits a real score.** Rezi markets a score on its homepage while its own docs concede *"there's no universal 'resume score' hiring teams use behind the scenes."* Being the one tool that says so is a differentiator, not a weakness — and it's the kind of thing that earns a citation *against* the incumbents rather than echoing them.

**The posts are deliberately built in the shape the evidence rewards**: an answer-first "The short answer" box (the chunk an LLM lifts), **question-shaped H2s** (headings get matched against user queries), comparison **tables**, an **FAQ block** mirrored exactly into FAQPage schema, and a visible + machine-readable **"Updated" date** (recency bias is real and causal).

**One deliberate editorial choice worth defending:** every competitor leads with *"75% of resumes are rejected by the ATS before a human sees them."* **That statistic has no traceable source.** We don't repeat it — the ATS post debunks it. That is both true and a differentiator, and it's the kind of thing that earns a citation *against* the incumbents rather than echoing them.

---

## 6. Their weaknesses — your positioning wedges

Real, sourced complaints you can use in comparison pages:

- **Rezi** — *"ugly but effective."* Locked template structure; you can't move sections. Support is the #1 complaint (paid resume reviews never delivered). **Their homepage claims "Forbes ranks it #1" — Rezi is absent from both Forbes resume-builder listicles.** The real Forbes asset is a 2021 coupon post. And their ATS score is a heuristic **their own docs admit isn't a real ATS simulation.**
- **Kickresume** — free tier is a demo, not a product (no formatted PDF export; 2 work-experience entries max). Refunds require emailing support. **Undisclosed AI usage caps that users hit mid-cycle with no warning.** A permanent fake "20% off — limited time!" countdown.
- **Teal** — **the $13/week trap** (≈$56/mo, nearly 2× their own $29 monthly plan) is now a *named, indexed critique* on third-party sites. AI output quality is the #1 Reddit complaint.
- **Enhancv** — you **cannot export on the free plan.** Monthly subs are non-refundable. Multiple double-charge-after-cancellation reports. Their pricing page renders **"€ NaN"** in some geos.

**Your defensible wedge:** you already have a **visible** usage-limit banner and a **real** money-back window with free reactivation. Kickresume's single loudest 1-star complaint is *hidden* AI limits; Enhancv's is *non-refundable* months. Say so, plainly, on a comparison page.

---

## 7. The 90-day plan

### Weeks 1–2 — stop being invisible (nothing else works until this is done)
1. **`curl -A "GPTBot" https://jobsynk.ai/`** — if you get a 403 or an empty body, that's your answer. **Cloudflare now enables "Block AI bots" by default on new domains, and it runs at the edge *before* robots.txt is read.** Check this first; it takes an hour and it can silently nullify everything else.
2. Deploy this PR. Submit `sitemap.xml` to **Google Search Console *and* Bing Webmaster Tools**; enable **IndexNow**. Bing matters more than its market share suggests — OpenAI confirmed it as a primary index source for ChatGPT Search, and **Bing's free AI Performance dashboard is the only first-party AI-citation reporting that exists.**
3. **Prerender the landing page and `/pricing` too.** The blog is fixed; your money pages are still blank to AI crawlers. Extend `scripts/prerender-blog.mjs`, or move the marketing surface to SSG. **Leave the authenticated app as a CSR SPA — crawlers can never get past the login wall, so SSR-ing it is wasted work.**

### Weeks 3–6 — get named on other people's pages (the actual channel)
4. **Build the target list.** Run ~25 buyer prompts ("best AI resume builder", "Teal alternatives", "AI cover letter generator") through ChatGPT and Perplexity **with search on, ~10 runs each**, and log every cited URL. **That list of ~50–100 pages *is* your outreach plan.** Do this before any outreach.
5. **Email every listicle author on it** — free lifetime Pro + a 5-line differentiator + screenshots. They need a fresh entry for the 2027 refresh. Expect 10–20% inclusion; that's a great rate for the highest-leverage asset in the field.
6. **Publish your own honest listicle** — `/blog/best-ai-resume-builders-2026`. Include Rezi, Kickresume, Teal, Enhancv. **Disclose the bias** (they all do). **Include a "choose them instead if…" column** — vendor comparison pages get cited *only* when they concede something. Year in the title, comparison table, FAQ block.
7. **Ship `/compare/jobsynk-vs-{rezi,kickresume,teal,enhancv}`** and `/alternatives/{competitor}`.
8. **Create G2 + Capterra profiles**, get ~15–20 real reviews, then stop.

### Weeks 7–12 — become quotable
9. **Ship the free ungated ATS checker.** You already have the scorer. This is your Enhancv-checker equivalent and your best link magnet.
10. **Publish one original data study.** *"We analysed N resumes — here are the 12 most common ATS failures."* Statistics + cited sources are the #1 and #2 tactics in the only peer-reviewed GEO study, the #1-ranked competitor has **none**, and it's simultaneously your best press bait and the thing listicle authors will link to. **If you do one thing from this document, do this.**
11. **Start Reddit properly** — one *disclosed* founder account, aged 30–60 days, 200–500 karma in r/resumes and r/jobs before any mention. The average cited Reddit post is ~1 year old, so **the clock starts now precisely because it's slow.** Never use alt accounts — Reddit links them and the penalty is a sitewide ban *plus a domain blacklist*, which would be an unrecoverable AEO loss.
12. **10–15 short YouTube screencasts with full transcripts.** The transcript is the retrievable asset, not the video.

### Measure honestly
Track **visibility % across ≥50 prompt runs**, plus **branded search volume** and **direct traffic** — because ~56% of AI-influenced visits arrive as *search*, not as a `chatgpt.com` referral. **Do not judge this program by referral traffic**, and don't buy a tool that sells you an "AI rank."

---

## 8. Sources

**Competitors:** [rezi.ai](https://www.rezi.ai/) · [/ai-llm-info](https://www.rezi.ai/ai-llm-info) (a page they wrote *for LLMs* — worth copying) · [rezi sitemap](https://www.rezi.ai/sitemap.xml) · [kickresume "best AI resume builders"](https://www.kickresume.com/en/help-center/best-ai-resume-builders/) · [kickresume press/data studies](https://www.kickresume.com/en/press/) · [kickresume sitemap](https://www.kickresume.com/sitemap.xml) · [tealhq pricing](https://www.tealhq.com/pricing) · [teal sitemap-index](https://www.tealhq.com/sitemap-index.xml) · [Enhancv Resume Statistics](https://enhancv.com/blog/resume-statistics/) · [Enhancv free resume checker](https://enhancv.com/resources/resume-checker/) · [ApplyArc — "Teal's $13/Week Trap"](https://applyarc.com/compare/teal-pricing) · [Forbes — 6 Best Resume Builders](https://www.forbes.com/sites/forbes-personal-shopper/article/best-resume-builders/) (Rezi is not in it)

**Evidence base:** [Vercel/MERJ — The rise of the AI crawler](https://vercel.com/blog/the-rise-of-the-ai-crawler) · [Princeton GEO paper (KDD 2024)](https://arxiv.org/abs/2311.09735) · [Recency bias in LLM reranking](https://arxiv.org/html/2509.11353v1) · [Ahrefs — schema had no effect on AI citations](https://ahrefs.com/blog/schema-ai-citations/) · [Ahrefs — 75k-brand AI visibility correlations](https://ahrefs.com/blog/ai-brand-visibility-correlations/) · [DerivateX — B2B SaaS AI citation study](https://derivatex.agency/report/b2b-saas-ai-citation-study/) · [SparkToro/Gumshoe — AI recommendations are highly inconsistent](https://sparktoro.com/blog/new-research-ais-are-highly-inconsistent-when-recommending-brands-or-products-marketers-should-take-care-when-tracking-ai-visibility/) · [Profound — how ChatGPT sources the web](https://www.tryprofound.com/blog/chatgpt-citation-sources) · [Similarweb — downstream impact of AI visibility](https://www.similarweb.com/blog/insights/ai-news/ai-visibility-downstream-impact/) · [Cloudflare — managed robots.txt / default AI bot blocking](https://developers.cloudflare.com/bots/additional-configurations/managed-robots-txt/) · [Bing Webmaster Tools — AI Performance](https://blogs.bing.com/webmaster/February-2026/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview)
