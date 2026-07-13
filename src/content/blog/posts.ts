// The blog content library.
//
// AEO note (see docs/COMPETITOR-ANALYSIS.md): every post opens with a `takeaways`
// block, phrases its h2s as questions, and closes with a `faq` array that is ALSO
// emitted as FAQPage JSON-LD. That shape is what makes a page quotable by an answer
// engine — the model can lift one self-contained chunk without reading the article.
//
// We deliberately do NOT recycle the unsourced "75% of resumes are rejected by ATS"
// statistic that most competitors lead with. It has no traceable origin. Debunking
// it is both true and a differentiator.

import type { Author, Post } from "./types";

const TEAM: Author = {
  name: "The Jobsynk AI Team",
  role: "Resume, ATS & hiring research",
  initials: "JS",
};

export const POSTS: Post[] = [
  // ───────────────────────────────────────────────────────────────────────────
  {
    slug: "ats-resume-format",
    title: "ATS Resume Format: What Actually Gets Parsed in 2026",
    seoTitle: "ATS Resume Format: What Actually Gets Parsed (2026 Guide)",
    description:
      "Applicant tracking systems don't reject resumes — they mis-read them. Here's exactly which formatting choices break parsing, and the layout rules that never do.",
    excerpt:
      "Most ATS advice online is fear-based and wrong. Here's what applicant tracking systems actually do to your file, which formatting choices genuinely break them, and the layout that survives every parser.",
    publishedAt: "2026-06-02",
    updatedAt: "2026-07-13",
    author: TEAM,
    tags: ["ATS", "Formatting", "Resume basics"],
    readingMinutes: 6,
    hero: "scanner",
    tone: "accent",
    faq: [
      {
        q: "Do applicant tracking systems automatically reject resumes?",
        a: "No. An ATS is a database, not a judge. It parses your resume into structured fields and stores it so a recruiter can search and filter. Rejections come from humans, or from filters a human configured — not from the software deciding on its own that your resume is bad.",
      },
      {
        q: "Is PDF or Word better for an ATS?",
        a: "PDF is safe with every mainstream ATS as long as it contains real, selectable text rather than a scanned image. The genuine risk is not the extension — it is exporting a design-tool PDF where the text is outlined into vector shapes, which leaves the parser with nothing to read.",
      },
      {
        q: "Do columns and tables break an ATS?",
        a: "They can. Some parsers read a two-column layout in visual order and interleave the columns into nonsense. A single-column body is the only layout guaranteed to be read in the order you intended, which is why it remains the default recommendation.",
      },
      {
        q: "Should I put keywords in white text to trick the ATS?",
        a: "Never. Keyword stuffing in white text is trivially visible to any recruiter who selects the text or opens the parsed record, and it is treated as dishonesty. It also does not work: modern parsers extract all text regardless of colour.",
      },
    ],
    body: [
      {
        type: "takeaways",
        items: [
          "An ATS **parses and stores** your resume — it does not score or auto-reject it. The famous claim that *\"75% of resumes are rejected by the ATS before a human sees them\"* has no traceable source.",
          "The real failure mode is **mis-parsing**: your job title lands in the wrong field, or your skills section vanishes.",
          "Four things genuinely break parsers: **text inside images**, **multi-column body layouts**, **headers/footers holding critical data**, and **non-standard section headings**.",
          "A single-column layout, standard headings, real selectable text, and a `.pdf` or `.docx` export will parse correctly in every mainstream system.",
        ],
      },
      {
        type: "p",
        text: "Search for ATS advice and you'll meet the same sentence over and over: three-quarters of resumes are rejected by robots before a human ever sees them. It's repeated by resume builders, career coaches, and — increasingly — by AI assistants that learned it from those pages. It is also unsourced. Nobody who cites it can point to the study.",
      },
      {
        type: "p",
        text: "This matters, because the myth produces bad behaviour. People strip their resumes of all personality, stuff them with keywords, and optimise for an adversary that isn't there. The truth is duller and far more actionable: an applicant tracking system is a **database with a search box**, and your only job is to make sure it can read you correctly.",
      },
      { type: "h2", id: "what-an-ats-actually-does", text: "What does an ATS actually do with your resume?" },
      {
        type: "p",
        text: "When you hit *Apply*, the system runs your file through a parser. The parser's job is to turn an unstructured document into structured fields — name, email, employer, job title, start date, end date, skills, education — and write them into a row in a database.",
      },
      {
        type: "p",
        text: "A recruiter then searches that database. They type `senior react engineer` into a box, apply a filter or two, and get a ranked list. That's it. There is no hidden score. There is no algorithm deciding your worth. There is a **human running a query**, and the question that decides your fate is simply: *did your record come back in the results?*",
      },
      {
        type: "figure",
        art: "scanner",
        caption: "The parser reads top-to-bottom, left-to-right, and writes what it finds into fields. Anything it can't map, it drops.",
      },
      {
        type: "callout",
        tone: "butter",
        title: "The re-frame that fixes most resumes",
        text: "Stop asking \"how do I beat the ATS?\" and start asking \"if a recruiter searched for this exact job title, would my record come back — and would it look right?\" Every formatting rule below follows from that one question.",
      },
      { type: "h2", id: "what-actually-breaks-parsing", text: "Which formatting choices actually break the parser?" },
      {
        type: "p",
        text: "After looking at how mainstream parsers handle real files, the genuine failure modes cluster into four categories. Everything else is folklore.",
      },
      {
        type: "table",
        head: ["The choice", "What the parser does", "Severity"],
        rows: [
          [
            "Text baked into an image or icon",
            "Extracts nothing. Your skills section is invisible.",
            "Fatal",
          ],
          [
            "Two-column body layout",
            "May read across both columns, interleaving them into gibberish.",
            "High",
          ],
          [
            "Contact details in the page header/footer",
            "Some parsers ignore header/footer regions entirely — your email disappears.",
            "High",
          ],
          [
            "Creative section names (\"My Journey\", \"What I Bring\")",
            "The parser is looking for `Experience` and `Education`. It doesn't find them, so the content is unmapped.",
            "High",
          ],
          [
            "Tables used for layout",
            "Cell order rarely survives extraction; dates detach from roles.",
            "Medium",
          ],
          [
            "A photo, a colour, a second font",
            "Ignored harmlessly. This is not what's hurting you.",
            "None",
          ],
        ],
        caption: "The four rows at the top cause nearly every real parsing failure. The last row is what most people worry about.",
      },
      { type: "h3", text: "The PDF question, settled" },
      {
        type: "p",
        text: "PDF versus Word is the most over-litigated question in resume writing. Both are fine with every mainstream ATS. What is *not* fine is a PDF whose text isn't text — a file exported from a design tool with the type converted to outlines, or a resume that's really a screenshot in a PDF wrapper.",
      },
      {
        type: "p",
        text: "There's a five-second test. Open your PDF, try to select a line of text with your cursor, and copy-paste it somewhere. If you get characters, every parser on earth will too. If you get nothing, you have an image, and you are invisible.",
      },
      { type: "h2", id: "the-layout-that-always-works", text: "What layout survives every parser?" },
      {
        type: "p",
        text: "There is a boring, unglamorous structure that has never failed a parse, and it looks like this:",
      },
      {
        type: "ol",
        items: [
          "**Contact block in the body**, not the header. Name, email, phone, city, one link.",
          "**A single column**, top to bottom. Sidebars are the single most common cause of scrambled output.",
          "**Standard headings, spelled the standard way**: `Summary`, `Experience`, `Education`, `Skills`, `Projects`, `Certifications`.",
          "**Reverse-chronological roles**, each with a job title on its own line, then employer, then dates in a consistent `Mon YYYY – Mon YYYY` format.",
          "**A flat skills list** — comma-separated or bulleted. Not a grid of five-star rating icons, which parse as nothing.",
          "**Real text, exported to PDF**, with selectable characters.",
        ],
      },
      {
        type: "quote",
        text: "The best-formatted resume is the one you never have to think about again — because the structure is invisible and the content is doing all the work.",
      },
      { type: "h2", id: "what-to-do-with-the-time-you-save", text: "So what should you optimise instead?" },
      {
        type: "p",
        text: "Once your resume parses cleanly, formatting stops being a lever. You have hit the ceiling of what layout can do for you, and every further hour spent nudging margins is an hour not spent on the thing that actually decides interviews: **whether the content matches the role**.",
      },
      {
        type: "p",
        text: "That means the vocabulary of the job description appearing in your resume because you genuinely have the experience — not because you pasted a keyword list at the bottom. It means bullets that state an outcome rather than a duty. It means the top third of page one making it obvious, in about six seconds, what you do and how well you do it.",
      },
      {
        type: "callout",
        tone: "mint",
        title: "Do this next",
        text: "Run the copy-paste test on your current PDF, then paste the text into our [free ATS checker](/ats-checker) — no signup, and it names every one of these failures in your actual resume. Fix those, then move on to [tailoring the content](/blog/tailor-resume-to-job-description), which is where the interviews come from.",
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────────
  {
    slug: "do-recruiters-reject-ai-resumes",
    title: "Do Recruiters Reject AI-Written Resumes?",
    seoTitle: "Do Recruiters Reject AI-Written Resumes? An Honest Answer",
    description:
      "Recruiters don't penalise AI. They penalise what bad AI writing sounds like: generic, unverifiable, and identical to the last 200 applications. Here's the difference.",
    excerpt:
      "The honest answer is more interesting than yes or no. Recruiters can't detect AI reliably — but they can detect *genericness*, and that's what AI-written resumes are usually guilty of.",
    publishedAt: "2026-06-11",
    updatedAt: "2026-07-13",
    author: TEAM,
    tags: ["AI", "Hiring", "Strategy"],
    readingMinutes: 6,
    hero: "signal",
    tone: "sky",
    faq: [
      {
        q: "Can recruiters tell if a resume was written by AI?",
        a: "Not reliably, and AI-detection tools are not trustworthy enough to act on — they produce false positives on ordinary formal writing. What recruiters can spot is genericness: vague, unquantified, interchangeable claims. That is a content problem, not a detection problem.",
      },
      {
        q: "Is it against the rules to use AI to write my resume?",
        a: "Almost no employer prohibits it, and a resume has always been a collaborative document — people have used coaches, templates, and friends for decades. The line that matters is truthfulness. Using AI to phrase a real achievement is fine; using it to invent an achievement is fraud.",
      },
      {
        q: "Will an AI-written resume hurt me in the interview?",
        a: "Only if you cannot defend what's on it. The real risk of AI writing is that it inflates a bullet beyond what you actually did, and then an interviewer asks you to walk through it. Every line on your resume should be a line you can talk about for two minutes.",
      },
      {
        q: "What is the safest way to use AI on a resume?",
        a: "Bring your own facts and let the AI handle structure and phrasing. Give it the real numbers, the real scope, and the real outcome, and ask it to tighten the wording. Never ask it to generate accomplishments you haven't had.",
      },
    ],
    body: [
      {
        type: "takeaways",
        items: [
          "Recruiters **cannot reliably detect AI writing**, and AI-detection tools produce too many false positives to be trusted.",
          "What they *can* detect instantly is **genericness** — the tell isn't that a bullet was written by a model, it's that it could describe anyone.",
          "The real risk of AI isn't detection, it's **inflation**: a bullet you can't defend in the interview.",
          "Use AI for **structure and phrasing**, never for facts. You supply the numbers; the model supplies the sentence.",
        ],
      },
      {
        type: "p",
        text: "This question gets asked in every job-search forum, and it always gets the same two useless answers: *\"recruiters can always tell\"* and *\"nobody cares, use it for everything\"*. Both are wrong, and the truth in between is genuinely worth understanding — because it tells you exactly how to use these tools without getting burned.",
      },
      { type: "h2", id: "can-they-actually-tell", text: "Can a recruiter actually tell?" },
      {
        type: "p",
        text: "Reliably? No. AI-detection tools are not accurate enough to act on — they routinely flag ordinary formal, non-native, or simply well-edited writing as machine-generated. No serious hiring team is running your resume through a detector and binning you on the output, because doing so would mean rejecting a large number of real candidates on a coin flip.",
      },
      {
        type: "p",
        text: "But here's the thing. Recruiters don't need to detect AI, because AI writing announces itself in a much cruder way: **it all sounds the same**. A recruiter reading their 60th application of the day is not thinking *\"was this written by a model?\"*. They're thinking *\"I have read this exact sentence before.\"*",
      },
      {
        type: "figure",
        art: "signal",
        caption: "The signal a recruiter reacts to isn't AI-ness. It's whether a bullet contains anything only you could have written.",
      },
      { type: "h2", id: "the-real-tell", text: "What is the actual tell?" },
      {
        type: "p",
        text: "Unedited AI output has a distinctive failure mode: it is *fluent* and *empty*. It produces grammatically immaculate sentences that assert competence without evidencing it. Compare:",
      },
      {
        type: "sample",
        label: "What a model writes with no facts to work from",
        text: "Spearheaded cross-functional initiatives to drive operational excellence,\nleveraging data-driven insights to optimise key business outcomes and\nfoster a culture of continuous improvement.",
      },
      {
        type: "sample",
        label: "What the same model writes when you give it the facts",
        text: "Cut checkout drop-off from 34% to 21% in one quarter by rebuilding the\npayment step; shipped with two engineers and a designer, and the change\nnow handles ~40k transactions a week.",
      },
      {
        type: "p",
        text: "Both were written by an AI. The second one is good — not because a better model wrote it, but because a human brought the numbers. The first is what happens when you ask a model to write your resume *for* you instead of *with* you.",
      },
      {
        type: "quote",
        text: "The problem was never that a machine wrote your resume. It's that nobody told the machine anything worth writing about.",
      },
      { type: "h2", id: "the-risk-that-matters", text: "What's the risk that actually matters?" },
      {
        type: "p",
        text: "Not detection. **Inflation.** Ask a language model to make your experience sound more impressive and it will happily oblige, because that is literally the instruction. You wrote *\"helped with the migration\"*; it returns *\"led the end-to-end migration of a distributed data platform serving 12 million users.\"* You didn't lie — but the document now does.",
      },
      {
        type: "p",
        text: "Then you get the interview, and someone who has actually led a migration asks you what your rollback strategy was. This is where AI resumes fail: not at the parser, not at the recruiter's desk, but forty minutes into a conversation you can't sustain.",
      },
      {
        type: "callout",
        tone: "rose",
        title: "The two-minute rule",
        text: "Every bullet on your resume should be one you can talk about, unprompted, for two minutes — what the problem was, what you personally did, what changed, and what you'd do differently. If a bullet fails that test, it doesn't matter who wrote it. Cut it or rewrite it downward until it's true.",
      },
      { type: "h2", id: "how-to-use-it-well", text: "How should you actually use AI on a resume?" },
      {
        type: "p",
        text: "Think of it as an editor, not a ghostwriter. Editors are extremely good at the things people are bad at — being concise, being consistent, cutting a clause, finding the right verb, matching the register of a job description. Editors are not good at knowing what you did. That part is yours.",
      },
      {
        type: "ol",
        items: [
          "**Write the ugly version first.** Dump the real facts in plain language, with the actual numbers, however clumsily. `made the reports faster, like 10 mins to under 1`.",
          "**Hand it the job description.** Ask it to align the vocabulary of your real experience to the role's language — without adding anything.",
          "**Give it an explicit prohibition.** *\"Do not add any metric, tool, scope or outcome I did not state.\"* Models follow this instruction well when you give it.",
          "**Read every line back and ask: is this still true?** Downgrade anything that drifted. This is the step people skip, and it is the only one that matters.",
        ],
      },
      {
        type: "p",
        text: "Used this way, AI does the thing it's genuinely superb at — turning honest, badly-phrased truth into clear, well-phrased truth — and none of the thing it's dangerous at. Your resume ends up sounding like the best version of you, which is the only version that survives an interview.",
      },
      {
        type: "callout",
        tone: "mint",
        title: "Do this next",
        text: "Take your weakest bullet. Write the ugly, honest version with real numbers. Then read [how to write bullets that get interviews](/blog/resume-bullet-points-that-get-interviews) and rewrite it once, by hand. You'll immediately see what to ask an AI for — and what to never ask it for.",
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────────
  {
    slug: "tailor-resume-to-job-description",
    title: "How to Tailor a Resume to a Job Description",
    seoTitle: "How to Tailor Your Resume to a Job Description (Step by Step)",
    description:
      "Tailoring isn't rewriting. It's re-ranking what you already have so the six seconds a recruiter spends on page one land on the right things. A repeatable 20-minute method.",
    excerpt:
      "Tailoring isn't rewriting your resume for every job — that's why people give up on it. It's a re-ranking problem, and once you see it that way it takes twenty minutes.",
    publishedAt: "2026-06-19",
    updatedAt: "2026-07-13",
    author: TEAM,
    tags: ["Tailoring", "Job search", "Strategy"],
    readingMinutes: 7,
    hero: "match",
    tone: "mint",
    faq: [
      {
        q: "Do I really need to tailor my resume for every application?",
        a: "For every application you actually care about, yes. But tailoring means re-ordering and re-phrasing what is already there, not writing a new document. Applying to fifty roles with one generic resume performs worse than applying to ten with tailored ones, for less total effort.",
      },
      {
        q: "How long should tailoring take?",
        a: "About twenty minutes once you have a strong master resume. If it is taking two hours, your master resume is too thin — you are writing content rather than selecting it, which is the wrong problem to be solving at application time.",
      },
      {
        q: "What should I change when tailoring?",
        a: "The summary line, the order of your bullets within each role, which skills appear first, and the specific vocabulary used for tools and responsibilities. What you should almost never change: your job titles, your dates, or the facts of what you did.",
      },
      {
        q: "Is it dishonest to tailor a resume?",
        a: "No. Tailoring is emphasis, not invention. Every candidate has more true things about them than fit on one page, and choosing which true things to lead with is the entire job of a resume. It becomes dishonest only when you add something that didn't happen.",
      },
    ],
    body: [
      {
        type: "takeaways",
        items: [
          "Tailoring is a **re-ranking problem, not a rewriting problem**. You are choosing which true things to lead with.",
          "Build one **master resume** containing everything you've ever done — far too long to send. Tailoring becomes *selection* from it.",
          "Change four things per application: the **summary**, the **bullet order**, the **skills order**, and the **vocabulary**.",
          "Never change your **titles, dates, or facts**. That's the line between emphasis and fiction.",
        ],
      },
      {
        type: "p",
        text: "Everybody knows they should tailor their resume. Almost nobody does it, and the reason is a misunderstanding: people think tailoring means writing a new resume for every job. Framed that way, it's obviously not worth it — you'd spend two hours per application, and you have forty applications to send.",
      },
      {
        type: "p",
        text: "So here's the reframe. A recruiter's first pass over your resume takes somewhere around six seconds, and in those six seconds they are scanning the top third of page one for evidence that you are plausibly the person in the job description. **Tailoring is the act of making sure the right evidence is in that space.** It is a sorting operation, not a writing operation. And sorting is fast.",
      },
      { type: "h2", id: "build-the-master", text: "Why does everything start with a master resume?" },
      {
        type: "p",
        text: "You cannot select from a set you haven't built. The master resume is a private document — three, four, six pages, it doesn't matter, nobody will ever see it — that contains **every role, every project, every tool, every number you have ever been able to claim**.",
      },
      {
        type: "p",
        text: "Under each role, write six to ten bullets rather than the three you'd actually send. Include the small stuff. Include the internal tool nobody's heard of. Include the thing you did once for a quarter that turned out to matter. It'll feel bloated and self-indulgent, which is exactly right: this is a *warehouse*, not a shop window.",
      },
      {
        type: "figure",
        art: "layers",
        caption: "One master resume, many tailored cuts. Every application is a selection from the same true set of facts.",
      },
      {
        type: "callout",
        tone: "butter",
        title: "The signal you got this right",
        text: "When tailoring takes twenty minutes instead of two hours, your master resume is good. If you find yourself *writing new bullets* at application time, stop — go back and grow the master. You are solving the wrong problem at the worst possible moment.",
      },
      { type: "h2", id: "read-the-jd-properly", text: "How do you read a job description properly?" },
      {
        type: "p",
        text: "Job descriptions are badly written, and part of the skill is knowing what to ignore. There's a structure hiding in almost all of them:",
      },
      {
        type: "table",
        head: ["Section", "What it really tells you", "Weight"],
        rows: [
          [
            "The first 2–3 responsibilities",
            "What you will actually do most days. This is what the hiring manager wrote.",
            "Very high",
          ],
          [
            "Repeated words across sections",
            "The thing they're genuinely anxious about. If \"stakeholder\" appears five times, that's the job.",
            "Very high",
          ],
          [
            "\"Required\" qualifications",
            "Usually a wish list a recruiter assembled. Treat as strong hints, not gates.",
            "Medium",
          ],
          [
            "\"Nice to have\"",
            "Genuinely optional. Useful as a tiebreaker if you happen to have one.",
            "Low",
          ],
          [
            "Company values / culture boilerplate",
            "Copy-pasted across every req. Carries no signal.",
            "None",
          ],
        ],
      },
      {
        type: "p",
        text: "Read it once and write down the **three things this job is really about**. Not fifteen keywords — three things. If you can't name them, you don't understand the role well enough to tailor for it, and no amount of keyword matching will save you.",
      },
      { type: "h2", id: "the-four-edits", text: "What are the four edits that do all the work?" },
      { type: "h3", text: "1. Rewrite the summary — this is 80% of the value" },
      {
        type: "p",
        text: "Your summary is the only part of the resume guaranteed to be read. Two lines, and they should read as though written for this job specifically, because they were.",
      },
      {
        type: "sample",
        label: "Generic",
        text: "Experienced software engineer with a passion for building great products\nand a track record of delivering high-quality solutions.",
      },
      {
        type: "sample",
        label: "Tailored to a payments infrastructure role",
        text: "Backend engineer, 6 years, focused on payments and high-throughput APIs.\nBuilt the ledger service behind ~40k transactions/week and cut checkout\nfailures by a third. Comfortable owning PCI-scoped systems end to end.",
      },
      { type: "h3", text: "2. Re-order the bullets inside each role" },
      {
        type: "p",
        text: "Don't rewrite them — **re-order** them. Whichever of your true bullets speaks most directly to those three things you identified goes first. People read the first bullet of each role and skim the rest, so bullet one is prime real estate and it should change between applications.",
      },
      { type: "h3", text: "3. Re-order the skills" },
      {
        type: "p",
        text: "Your skills list is scanned, not read. The first four or five entries are the ones that register. Put the role's core stack at the front, and drop the entries that are irrelevant to this job — a long list dilutes the ones that count.",
      },
      { type: "h3", text: "4. Match the vocabulary" },
      {
        type: "p",
        text: "If the job says *customer success* and you wrote *client servicing*, use theirs. If they say *observability* and you wrote *monitoring*, use theirs. This is not keyword stuffing; it's speaking the same language as the person reading. You are describing the same real work — just in the words they'll recognise.",
      },
      {
        type: "quote",
        text: "Tailoring is not making yourself look like a different person. It's making sure the person you already are is legible in six seconds.",
      },
      { type: "h2", id: "what-never-to-touch", text: "What should you never change?" },
      {
        type: "ul",
        items: [
          "**Job titles.** Adjusting a title to match the posting is the most common resume lie, and it is checked during reference and background checks. If your official title was misleading, keep it and clarify in the bullet.",
          "**Dates.** Ever.",
          "**Facts, numbers, scope, or team size.** Emphasis is legitimate. Invention is not, and it collapses in the interview.",
        ],
      },
      {
        type: "callout",
        tone: "mint",
        title: "Do this next",
        text: "Spend one hour building the master resume. It's the highest-leverage hour of your entire job search, and it pays back on every application after it. Then read [how to find the keywords that actually matter](/blog/resume-keywords-that-matter) to sharpen step four.",
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────────
  {
    slug: "resume-keywords-that-matter",
    title: "Resume Keywords: How to Find the Ones That Count",
    seoTitle: "Resume Keywords: How to Find the Ones That Actually Matter",
    description:
      "Not all keywords are equal. Most are noise. Here's how to extract the handful a recruiter will actually search for — and how to place them without sounding like a robot.",
    excerpt:
      "Keyword advice usually amounts to 'paste the job description into your resume'. That's how you get a document that reads like spam. Here's how to find the five that count.",
    publishedAt: "2026-06-26",
    updatedAt: "2026-07-13",
    author: TEAM,
    tags: ["Keywords", "ATS", "Tailoring"],
    readingMinutes: 6,
    hero: "keywords",
    tone: "butter",
    faq: [
      {
        q: "How many keywords should a resume have?",
        a: "Think in terms of five to eight high-value terms placed naturally, not a target count. A recruiter searching the ATS uses a short query — usually a job title plus one or two core skills — so a small number of correct terms outperforms a long list of weak ones.",
      },
      {
        q: "Where should keywords go on a resume?",
        a: "In the summary, in your job titles where truthful, and inside your experience bullets where the work actually happened. A keyword inside a bullet that proves you used it is worth far more than the same word sitting in a skills list, because it comes with evidence.",
      },
      {
        q: "Does keyword stuffing work?",
        a: "No. Parsers extract all the text regardless, so a hidden or padded keyword list gains you nothing in the search, and it is immediately obvious to the human who opens the file. It reads as desperation at best and dishonesty at worst.",
      },
      {
        q: "Should I include keywords for skills I don't have?",
        a: "No. Listing a tool you cannot discuss is the fastest way to fail a screening call, and it is a very common reason candidates are rejected after appearing strong on paper. If you have partial exposure, say so honestly in the bullet.",
      },
    ],
    body: [
      {
        type: "takeaways",
        items: [
          "A recruiter's ATS search is **short** — typically a job title plus one or two skills. Optimise for *that query*, not for the whole job description.",
          "Keywords come in three tiers: **hard requirements** (must appear), **role vocabulary** (should appear), **noise** (ignore). Most of a JD is noise.",
          "A keyword **inside an experience bullet** beats the same word in a skills list, because it arrives with proof.",
          "Never list a tool you can't discuss for five minutes. That's the most common way strong-looking candidates fail the screening call.",
        ],
      },
      {
        type: "p",
        text: "Keyword advice is where resume guidance goes to die. The standard version is: extract every noun from the job description, cram them into a skills section, and hope. This produces a document that reads like spam, gets you no further in the search, and actively repels the human who eventually opens it.",
      },
      {
        type: "p",
        text: "The useful version starts by asking a question almost nobody asks: **what does the recruiter actually type into the box?**",
      },
      { type: "h2", id: "the-query-is-short", text: "What does a recruiter actually search for?" },
      {
        type: "p",
        text: "Not much. A recruiter with 300 applicants in a pipeline is not constructing an elaborate boolean query. They're typing something like `senior react typescript` or `RN ICU` or `FP&A SaaS` — a job title, plus one or two things they cannot compromise on — and then eyeballing what comes back.",
      },
      {
        type: "p",
        text: "That's the whole game. Which means the job of keywording your resume is not *coverage*. It's making sure you come back for the **short, obvious query** — and then look good when you do.",
      },
      {
        type: "figure",
        art: "keywords",
        caption: "Most terms in a job description carry no weight. Three or four decide whether your record surfaces at all.",
      },
      { type: "h2", id: "three-tiers", text: "How do you sort the job description into tiers?" },
      {
        type: "p",
        text: "Paste the job description somewhere you can mark it up, and sort every meaningful term into three buckets.",
      },
      {
        type: "table",
        head: ["Tier", "What it looks like", "What to do"],
        rows: [
          [
            "**Hard requirements**",
            "The exact job title. Named tools and certifications: `Kubernetes`, `CPA`, `Epic`, `Salesforce`. Anything followed by \"required\".",
            "Must appear verbatim, and must be true. Usually only 3–5 terms.",
          ],
          [
            "**Role vocabulary**",
            "How *this company* talks about the work: `observability` not `monitoring`; `customer success` not `account management`.",
            "Adopt their word for the thing you already do. Free credibility.",
          ],
          [
            "**Noise**",
            "`fast-paced environment`, `team player`, `passion for excellence`, `wear many hats`.",
            "Ignore entirely. Nobody has ever searched for `team player`.",
          ],
        ],
        caption: "A typical 600-word job description yields perhaps five tier-one terms. That's your actual target list.",
      },
      {
        type: "p",
        text: "The one refinement worth making: **repetition is signal**. If a word appears in the title, the summary, and three bullets, it isn't decoration — it's the thing keeping the hiring manager awake. Treat it as tier one even if it's a soft concept like *cross-functional* or *migration*.",
      },
      { type: "h2", id: "placement", text: "Where should a keyword actually go?" },
      {
        type: "p",
        text: "There's a hierarchy of placements, and it's steeper than people realise. The same word is worth wildly different amounts depending on where it lands.",
      },
      {
        type: "ol",
        items: [
          "**Inside an experience bullet, attached to an outcome.** The gold standard. *\"Migrated 40 services to Kubernetes, cutting deploy time from 25 min to 4.\"* This proves the skill instead of claiming it.",
          "**In your job title**, when it's genuinely part of the role. Truthful, and it's the first thing a title-based search matches.",
          "**In the summary.** Read by everyone, so it does real work — but it's a claim, not evidence.",
          "**In the skills list.** Necessary for the search to match, but carries almost no persuasive weight on its own. This is a checkbox, not an argument.",
        ],
      },
      {
        type: "quote",
        text: "A keyword in your skills list says you know the thing. A keyword in a bullet with a number attached proves it. Do the second one.",
      },
      { type: "h2", id: "the-honesty-constraint", text: "What's the one hard constraint?" },
      {
        type: "p",
        text: "You have to be able to talk about it. Every term on your resume is an implicit offer to discuss it for five minutes, and screening calls are essentially a random spot-check of that offer.",
      },
      {
        type: "p",
        text: "This is where padded keyword lists do real damage. You add `Kafka` because it was in the JD and you once read the docs. You pass the search. You get the call. Ninety seconds in, someone asks how you handled consumer lag — and now you're not a candidate with a gap, you're a candidate who overstated. Those are very different outcomes, and the second one ends the process.",
      },
      {
        type: "callout",
        tone: "rose",
        title: "The honest partial-credit move",
        text: "If you have real but limited exposure, say so in the bullet rather than in the skills list: *\"Contributed to a Kafka-based pipeline (consumer side); comfortable with the model, not the ops.\"* This is specific, it's honest, it still matches the search, and it turns a liability into evidence of self-awareness.",
      },
      { type: "h2", id: "how-many", text: "So how many keywords is enough?" },
      {
        type: "p",
        text: "Stop counting. If your five tier-one terms appear — at least one of them inside a bullet with a number attached — and you've adopted the company's vocabulary for the work you genuinely do, you are done. Adding a sixteenth tool to the skills list does not improve your odds; it only dilutes the five that mattered.",
      },
      {
        type: "callout",
        tone: "mint",
        title: "Do this next",
        text: "Take the last job you applied to. Find the five tier-one terms. Check whether even one of them appears inside a bullet with a number attached — for most people, none do. Fix that one bullet using the [XYZ method](/blog/resume-bullet-points-that-get-interviews).",
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────────
  {
    slug: "resume-bullet-points-that-get-interviews",
    title: "How to Write Resume Bullets That Get Interviews",
    seoTitle: "How to Write Resume Bullet Points That Get Interviews",
    description:
      "Most resume bullets describe duties. Interviews come from bullets that describe change. The XYZ formula, why it works, and how to use it when you have no metrics.",
    excerpt:
      "Most bullets describe what you were responsible for. Interviews come from bullets that describe what changed because you were there. Here's the difference, mechanically.",
    publishedAt: "2026-07-02",
    updatedAt: "2026-07-13",
    author: TEAM,
    tags: ["Writing", "Bullets", "Resume basics"],
    readingMinutes: 7,
    hero: "impact",
    tone: "rose",
    faq: [
      {
        q: "What is the XYZ formula for resume bullets?",
        a: "Accomplished [X] as measured by [Y] by doing [Z]. It forces every bullet to contain an outcome, a measurement, and a method — which is exactly the three things an interviewer will ask you about anyway. It became widely known as a Google recruiting guideline.",
      },
      {
        q: "What if I don't have any metrics?",
        a: "You almost certainly have more than you think. Metrics don't have to be revenue — time saved, frequency, volume, headcount, error rate, or scope all count. And where no number exists, a specific before-and-after state works nearly as well: 'replaced a manual weekly process with an automated one' is concrete even without a percentage.",
      },
      {
        q: "How many bullets should each job have?",
        a: "Three to five for your current or most recent role, and two to three for older ones. Depth on what's recent and relevant beats completeness on what isn't. Anything older than about ten years can usually be reduced to a single line.",
      },
      {
        q: "Should resume bullets be full sentences?",
        a: "No. Drop the leading 'I' and any articles that don't earn their place, start with a strong past-tense verb, and stop at one or two lines. A bullet running to three lines is almost always two bullets wearing a trench coat.",
      },
    ],
    body: [
      {
        type: "takeaways",
        items: [
          "A bullet that describes a **duty** is invisible. A bullet that describes a **change** gets an interview.",
          "Use **XYZ**: *Accomplished [X], as measured by [Y], by doing [Z]*. Outcome, metric, method.",
          "**No metrics? You have more than you think** — time, frequency, volume, headcount, error rate, and scope all count.",
          "Start with a **past-tense verb**, cut to **one or two lines**, and make sure you can defend it for two minutes.",
        ],
      },
      {
        type: "p",
        text: "Here is the single most common bullet point on earth:",
      },
      {
        type: "sample",
        label: "The bullet everyone writes",
        text: "• Responsible for managing the company's social media accounts.",
      },
      {
        type: "p",
        text: "It's not badly written. It's just *inert*. It tells a reader what you were **assigned**, which is a fact about your employer's org chart, not about you. Everyone who has ever held that job could write that line, which means it distinguishes you from precisely nobody.",
      },
      {
        type: "p",
        text: "Now the same job, written as a change:",
      },
      {
        type: "sample",
        label: "The same job, as a change",
        text: "• Grew Instagram from 4k to 27k followers in 11 months by shifting from\n  daily product posts to a weekly customer-story series — which now drives\n  ~18% of site traffic.",
      },
      {
        type: "p",
        text: "Same person. Same job. One of these gets a call.",
      },
      { type: "h2", id: "why-duties-fail", text: "Why do duty bullets fail?" },
      {
        type: "p",
        text: "Because a resume is not a job description — it's an **argument**. The claim is *\"hiring me will be good for you\"*, and a duty bullet contains no evidence for that claim. It establishes only that you were present.",
      },
      {
        type: "p",
        text: "Recruiters and hiring managers read for **delta**. What was different afterwards? Was something faster, cheaper, bigger, safer, more reliable, less manual? A bullet with no delta is a bullet with nothing to react to, and it slides past the eye without registering.",
      },
      {
        type: "figure",
        art: "impact",
        caption: "Duty bullets describe the flat line. Interviews come from the bullets that describe the slope.",
      },
      { type: "h2", id: "the-xyz-formula", text: "What is the XYZ formula?" },
      {
        type: "p",
        text: "The most reliable structure — popularised as a Google recruiting guideline and since adopted almost everywhere — is:",
      },
      {
        type: "quote",
        text: "Accomplished [X], as measured by [Y], by doing [Z].",
      },
      {
        type: "p",
        text: "It's a good formula not because it's magic, but because of what it *forces*. You cannot complete the sentence without naming an outcome, a measurement, and a method. And those three things happen to be exactly what an interviewer is going to ask you about anyway. A bullet written this way is a pre-answered interview question.",
      },
      {
        type: "table",
        head: ["Component", "The question it answers", "Example"],
        rows: [
          ["**X** — the outcome", "What actually changed?", "Cut support ticket volume"],
          ["**Y** — the measure", "How much, and how do you know?", "by 31% (1,200 → 830/month)"],
          ["**Z** — the method", "What did *you* do to cause it?", "by rewriting the top 20 help articles and adding an in-app FAQ"],
        ],
      },
      {
        type: "p",
        text: "Assembled: *\"Cut monthly support tickets 31% (1,200 → 830) by rewriting the top 20 help articles and shipping an in-app FAQ.\"* One line. Impossible to ignore. And you can talk about it for twenty minutes if asked.",
      },
      { type: "h2", id: "no-metrics", text: "What if you genuinely have no numbers?" },
      {
        type: "p",
        text: "This is the objection everyone raises, and it's almost always false. People think *metric* means *revenue*, and since they didn't personally close deals, they conclude they have nothing. But a metric is just **any dimension that moved**. Go hunting in these:",
      },
      {
        type: "ul",
        items: [
          "**Time** — how long did the thing take before, and after? *(\"3 days → 4 hours\")*",
          "**Frequency** — how often did something happen? *(\"weekly outages → zero in six months\")*",
          "**Volume** — how much did you handle? *(\"a 40-person caseload\", \"~2,000 tickets/quarter\")*",
          "**Scope** — how many people, teams, countries, systems? *(\"rolled out to 6 offices\")*",
          "**Quality** — error rate, defect rate, rework, complaints, satisfaction.",
          "**Money** — not just revenue: budget owned, cost avoided, hours saved × loaded rate.",
        ],
      },
      {
        type: "callout",
        tone: "butter",
        title: "When there is genuinely no number",
        text: "Use a specific before-and-after *state* instead. \"Replaced a manual weekly spreadsheet reconciliation with an automated pipeline\" has no percentage in it, but it is concrete, it implies a delta, and no two candidates would write the same sentence. Specificity is the real goal — the number is just the most convenient way to get there.",
      },
      { type: "h2", id: "mechanics", text: "What are the mechanics of a good bullet?" },
      {
        type: "ol",
        items: [
          "**Start with a past-tense verb.** *Built, cut, shipped, negotiated, migrated, rebuilt, recovered.* Never *\"Responsible for\"*, never *\"Helped with\"*, never *\"Worked on\"*.",
          "**Kill the first-person pronoun and most articles.** Resume register is compressed. *\"Rebuilt the onboarding flow\"*, not *\"I rebuilt our company's onboarding flow.\"*",
          "**One or two lines. Hard stop.** A three-line bullet is two bullets that haven't been separated yet.",
          "**Lead with the outcome, not the method.** *\"Cut deploy time 6× by containerising the build\"* beats *\"Containerised the build, which cut deploy time 6×\"* — because the first four words are the ones that get read.",
          "**Vary the verbs.** Six bullets starting with *\"Led\"* reads as one bullet repeated six times.",
        ],
      },
      {
        type: "quote",
        text: "If a bullet could appear on the resume of anyone who held your job title, it isn't a bullet. It's a job description you forgot to delete.",
      },
      {
        type: "callout",
        tone: "mint",
        title: "Do this next",
        text: "Open your resume. Find every bullet starting with \"Responsible for\", \"Helped\", or \"Worked on\" — most people have three or four. Rewrite exactly one of them in XYZ form. It'll take ten minutes and it will be the best line on the page.",
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────────
  {
    slug: "ai-cover-letter-that-doesnt-sound-like-ai",
    title: "How to Write an AI Cover Letter That Doesn't Sound Like AI",
    seoTitle: "How to Write an AI Cover Letter That Doesn't Sound Like AI",
    description:
      "AI cover letters fail for one reason: they're written about the candidate instead of about the company. The specific prompts, structure, and edits that fix it.",
    excerpt:
      "Every AI cover letter opens the same way, and every recruiter has read it 500 times. The fix isn't a better model — it's giving it something only you could know.",
    publishedAt: "2026-07-09",
    updatedAt: "2026-07-13",
    author: TEAM,
    tags: ["Cover letters", "AI", "Writing"],
    readingMinutes: 6,
    hero: "voice",
    tone: "sky",
    faq: [
      {
        q: "Do cover letters still matter in 2026?",
        a: "They matter less than they used to and they are frequently not read, but the cost of writing one is now low and the downside of skipping one is asymmetric. For a role you genuinely want, particularly at a smaller company or where a human reviews applications directly, a short specific letter is still one of the cheapest ways to stand out.",
      },
      {
        q: "How long should a cover letter be?",
        a: "Under 250 words, in three or four short paragraphs. Nobody has ever complained that a cover letter was too short, and length is negatively correlated with being read all the way through.",
      },
      {
        q: "Can I use ChatGPT to write my cover letter?",
        a: "Yes, but not by asking it to write one from scratch. Given only your resume and the job posting, a model will produce fluent, generic text because that is all the information it has. Give it a specific reason you want this job and one concrete detail about the company, and the output changes completely.",
      },
      {
        q: "What is the biggest mistake in an AI-written cover letter?",
        a: "Writing about yourself instead of about them. The default AI letter restates your resume in prose, which the reader already has. A good letter connects one specific thing about the company to one specific thing you have done.",
      },
    ],
    body: [
      {
        type: "takeaways",
        items: [
          "AI cover letters fail because they're written **about you** — but the reader already has your resume.",
          "A good letter connects **one specific thing about the company** to **one specific thing you've done**.",
          "Give the model something only you know: why you want *this* job, and one real detail about *this* company. Without it, it can only produce fluent noise.",
          "**Under 250 words.** Delete the first paragraph you write — it's always throat-clearing.",
        ],
      },
      {
        type: "p",
        text: "You have read this letter. Everyone has read this letter.",
      },
      {
        type: "sample",
        label: "The letter a model writes when you give it nothing",
        text: "Dear Hiring Manager,\n\nI am writing to express my strong interest in the Senior Product Manager\nposition at Acme Corp. With over 7 years of experience in product management\nand a proven track record of delivering innovative solutions, I am confident\nthat my skills align perfectly with your requirements...",
      },
      {
        type: "p",
        text: "It's grammatical. It's professional. It is also completely worthless, and the reason is not that a machine wrote it. It's that **the machine had nothing to work with.** You gave it your resume and the job posting; it gave you back a fluent average of every cover letter ever written. That was the only thing it could do.",
      },
      { type: "h2", id: "what-a-cover-letter-is-for", text: "What is a cover letter actually for?" },
      {
        type: "p",
        text: "This is the question that unlocks everything. A cover letter is **not** a prose summary of your resume — the reader has your resume, it's attached, they can read it in six seconds and they will.",
      },
      {
        type: "p",
        text: "A cover letter exists to answer the one question the resume structurally cannot: **why this job, and why you specifically for it?** It's the only place in an application where you get to make an argument rather than list facts.",
      },
      {
        type: "quote",
        text: "The resume proves you can do the job. The cover letter explains why you want *this* one. If your letter isn't doing that, it isn't doing anything.",
      },
      {
        type: "figure",
        art: "voice",
        caption: "The generic letter and the specific one use identical vocabulary. Only one contains information the reader didn't already have.",
      },
      { type: "h2", id: "the-missing-input", text: "What is the model actually missing?" },
      {
        type: "p",
        text: "Two things, and they're both things only you can supply. No model, however capable, can infer them from a PDF.",
      },
      {
        type: "ol",
        items: [
          "**A real reason you want this job.** Not \"I'm passionate about your mission.\" Something true and slightly specific: you've used the product and one thing about it annoys you; you're moving from agency to in-house on purpose; this is the only company in the city doing this thing.",
          "**One concrete, verifiable detail about them.** A feature they shipped. A number from their careers page. A talk their VP gave. A stance in their engineering blog. Anything that proves you spent fifteen minutes on them and not zero.",
        ],
      },
      {
        type: "callout",
        tone: "butter",
        title: "The fifteen-minute rule",
        text: "If you cannot find one concrete detail about the company in fifteen minutes of looking, you probably don't want the job enough to write a letter for it. That's a legitimate and useful conclusion — skip the letter and spend the time on an application you actually care about.",
      },
      { type: "h2", id: "the-prompt", text: "What prompt actually works?" },
      {
        type: "p",
        text: "Once you have those two inputs, the model becomes genuinely useful — because now it has something to say and only needs help saying it well. The structure of a prompt that works:",
      },
      {
        type: "sample",
        label: "A prompt with something in it",
        text: "Write a 200-word cover letter for the Senior PM role at Acme.\n\nWhat I actually want them to know:\n- I've used Acme for 3 years at my current job. The bulk-import flow is\n  the reason we nearly churned — I filed the ticket.\n- I've spent 4 years fixing exactly this class of onboarding problem: at\n  Northwind I cut time-to-first-value from 11 days to 3.\n- I'm moving from B2C to B2B deliberately; I want longer feedback loops.\n\nRules:\n- Open with the bulk-import observation, not with my name or the role.\n- No adjectives about me. No \"passionate\", \"proven track record\", \"excited\".\n- Do not restate my resume. Do not invent anything I did not say above.\n- Three short paragraphs. Under 220 words. Plain, direct sentences.",
      },
      {
        type: "p",
        text: "Notice how much of that prompt is **prohibition**. Models default to flattery and filler because their training rewards it; you have to explicitly forbid the register. \"No adjectives about me\" is a startlingly effective instruction, and so is \"do not restate my resume.\"",
      },
      { type: "h2", id: "structure", text: "What structure should the letter have?" },
      {
        type: "table",
        head: ["Paragraph", "Job", "Length"],
        rows: [
          [
            "**1 — The hook**",
            "The specific observation about *them*. No greeting throat-clearing, no \"I am writing to apply for\".",
            "2–3 sentences",
          ],
          [
            "**2 — The bridge**",
            "The one thing you've done that's directly relevant to that observation. With a number.",
            "3–4 sentences",
          ],
          [
            "**3 — The ask**",
            "Why this move makes sense for you, and a plain closing. No begging, no \"I look forward to hearing from you at your earliest convenience.\"",
            "2 sentences",
          ],
        ],
        caption: "Three paragraphs, under 250 words. If it's longer, paragraph one is throat-clearing — delete it.",
      },
      {
        type: "callout",
        tone: "rose",
        title: "The delete-the-first-paragraph trick",
        text: "Write the letter, then delete the entire first paragraph and read what's left. Nine times out of ten it's a stronger opening, because your real first paragraph was you clearing your throat. This works on AI output and on your own writing equally well.",
      },
      { type: "h2", id: "final-pass", text: "What's the final edit?" },
      {
        type: "p",
        text: "Read it out loud. If a sentence is one you would not say to a person in a room — *\"I am confident my skills align perfectly with your requirements\"* — cut it or say it the way you'd actually say it. That single pass removes most of what makes a letter feel machine-made, because the tell was never the machine. It was the register.",
      },
      {
        type: "callout",
        tone: "mint",
        title: "Do this next",
        text: "Pick the job you most want right now. Spend fifteen minutes finding one concrete detail about the company. That detail — not a better model, not a better template — is the whole letter. Then generate a draft in [Jobsynk's cover letter tool](/cover-letter) and cut it down.",
      },
    ],
  },
];

/** Newest first. Used by the index page, the landing strip, and the sitemap. */
export const POSTS_BY_DATE: Post[] = [...POSTS].sort((a, b) =>
  b.publishedAt.localeCompare(a.publishedAt)
);

export function getPost(slug: string): Post | undefined {
  return POSTS.find((post) => post.slug === slug);
}

export function relatedPosts(slug: string, limit = 3): Post[] {
  const current = getPost(slug);
  if (!current) return POSTS_BY_DATE.slice(0, limit);
  const scored = POSTS_BY_DATE.filter((post) => post.slug !== slug).map((post) => ({
    post,
    overlap: post.tags.filter((tag) => current.tags.includes(tag)).length,
  }));
  scored.sort((a, b) => b.overlap - a.overlap);
  return scored.slice(0, limit).map((entry) => entry.post);
}
