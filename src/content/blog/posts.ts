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
 {
    slug: "software-engineer-resume-template",
    title: "The Software Engineer Resume Template That Survives Six Seconds",
    seoTitle: "Software Engineer Resume Template (2026) — With a Full Example",
    description:
      "A hiring manager gives your resume about six seconds. Here's what they're actually looking for in that time, a template built around it, and a full worked example.",
    excerpt:
      "It's Friday afternoon. There are 180 applications in the folder and one hiring manager. Here's what actually happens to your resume in the six seconds it gets — and how to build one that survives it.",
    publishedAt: "2026-07-14",
    updatedAt: "2026-07-14",
    author: TEAM,
    tags: ["Templates", "Engineering", "Resume basics"],
    readingMinutes: 8,
    hero: "stack",
    tone: "accent",
    faq: [
      {
        q: "What should a software engineer's resume look like in 2026?",
        a: "One page if you have under ten years of experience, single column, standard section headings, and a top third that makes your stack and your seniority obvious without scrolling. The single biggest differentiator is not design — it is whether your bullets describe outcomes or duties.",
      },
      {
        q: "Should a software engineer's resume be one page or two?",
        a: "One page under about ten years of experience, and honestly one page for most people beyond it. A second page is not extra room to say more — it is a second page nobody reads. If you cannot fit it, you are including things that are not earning their space.",
      },
      {
        q: "Do I need a GitHub link on my resume?",
        a: "Only if there is something on it. A GitHub with three forked tutorials is worse than no link, because a recruiter will click it and the click will hurt you. If your best work is private or at an employer, describe it in a bullet instead.",
      },
      {
        q: "Where does the skills section go?",
        a: "Near the top if you are early-career and your stack is the main thing you are selling; near the bottom if you have five-plus years and your experience is the main thing. Either way it is a flat, scannable list — never a grid of five-star proficiency ratings, which parse as nothing and mean nothing.",
      },
    ],
    body: [
      {
        type: "takeaways",
        items: [
          "The **top third of page one** decides everything. Stack, seniority and one number, before any scrolling.",
          "**Single column, one page, standard headings.** Every clever layout you've seen is a risk with no upside.",
          "Bullets describe **what changed**, not what you were assigned. `Cut p99 latency 6×` beats `Responsible for backend services`.",
          "**Name the stack in the work, not just the skills list.** A tool inside a bullet with a number attached is proof; the same word in a list is a claim.",
        ],
      },
      {
        type: "p",
        text: "It's four o'clock on a Friday. The req has been open for eleven days, there are 180 applications in the folder, and the hiring manager — who also has a sprint review on Monday and a production incident from Tuesday still open in another tab — has an hour before they leave.",
      },
      {
        type: "p",
        text: "They are not going to read your resume. Nobody is going to read your resume. What is going to happen is that someone scrolls a list, opens yours, spends **about six seconds** in the top third of page one, and makes one of two decisions: *maybe* or *next*. Everything you write below that fold is only ever read by someone who has already decided you might be worth it.",
      },
      {
        type: "p",
        text: "That's not cynicism. It's the constraint. And once you accept it, building a software engineer's resume gets a lot simpler — because you stop trying to be comprehensive and start trying to be **legible**.",
      },
      { type: "h2", id: "the-six-seconds", text: "What happens in the six seconds?" },
      {
        type: "p",
        text: "They're answering three questions, in this order, and they're doing it almost pre-verbally:",
      },
      {
        type: "ol",
        items: [
          "**What kind of engineer is this?** Backend, frontend, infra, ML, mobile. If they can't tell, you're already in trouble — a generalist reads as *unplaceable*, not *versatile*.",
          "**How senior?** Not your title — your *scope*. Did you own a system, a feature, or a ticket?",
          "**Is there anything here I couldn't get from the other 179?** One number. One specific system. One thing only you did.",
        ],
      },
      {
        type: "p",
        text: "Notice what isn't on that list. Not your font. Not your two-column layout. Not the little skill bars showing you at 80% Python. Those things don't get you rejected — they just don't do anything, while costing you the space and the parseability that would.",
      },
      {
        type: "figure",
        art: "stack",
        caption: "The top third of page one is the entire resume. Everything below it is documentation for a decision already made.",
      },
      { type: "h2", id: "the-template", text: "So what's the template?" },
      {
        type: "p",
        text: "Boring. Deliberately, aggressively boring. Single column, standard headings, real text, one page. Every deviation from this is a risk you're taking for no upside — and the parser that reads you first has never once been impressed by a sidebar.",
      },
      {
        type: "doc",
        name: "Jordan Ellis",
        role: "Senior Backend Engineer",
        contact: "jordan.ellis@email.com · +1 (555) 240-1187 · Austin, TX · github.com/jellis",
        sections: [
          {
            heading: "Summary",
            lines: [
              "Backend engineer, 6 years, focused on payments and high-throughput APIs. Built the ledger service behind ~40k transactions/week and cut checkout failures by a third. Comfortable owning PCI-scoped systems end to end.",
            ],
          },
          {
            heading: "Experience",
            lines: [
              "**Senior Backend Engineer** — Northstar Systems, Austin · Mar 2022 – Present",
              "• Cut checkout drop-off from 34% to 21% in one quarter by rebuilding the payment step; shipped with two engineers and a designer.",
              "• Built the ledger service that now handles ~40,000 transactions/week, with idempotency that eliminated ~1,200 duplicate charges a month.",
              "• Migrated 40 services to Kubernetes, taking deploy time from 25 minutes to 4 and removing the weekly release freeze.",
              "• Mentored two juniors; both shipped to production independently within a quarter.",
              "",
              "**Backend Engineer** — BrightWorks Studio, Remote · Jun 2019 – Feb 2022",
              "• Reduced p99 API latency 6× by adding a read-through cache and killing an N+1 in the orders path.",
              "• Owned the on-call rotation redesign; paged incidents dropped from ~9/week to under 2.",
            ],
          },
          {
            heading: "Skills",
            lines: [
              "**Languages:** Go, Python, TypeScript, SQL",
              "**Infrastructure:** Kubernetes, Terraform, AWS (ECS, RDS, SQS), Postgres, Kafka",
              "**Practices:** Distributed tracing, load testing, PCI-DSS scope, incident command",
            ],
          },
          {
            heading: "Projects",
            lines: [
              "**Ledger** — open-source double-entry accounting library in Go. 900+ stars, used in production by three companies. github.com/jellis/ledger",
            ],
          },
          {
            heading: "Education",
            lines: ["BSc Computer Science — University of Texas at Austin, 2019"],
          },
        ],
        caption: "One page. One column. Standard headings. The interesting part is the bullets, not the layout — which is exactly the point.",
      },
      { type: "h2", id: "the-bullets", text: "How do you write the bullets?" },
      {
        type: "p",
        text: "This is the whole game, and it's where almost every engineering resume dies. Look at the difference:",
      },
      {
        type: "sample",
        label: "What most engineers write",
        text: "• Responsible for backend services and API development.\n• Worked on migrating our infrastructure to Kubernetes.\n• Helped improve system performance and reliability.",
      },
      {
        type: "sample",
        label: "The same work, as a change",
        text: "• Migrated 40 services to Kubernetes, taking deploy time from 25 min to 4\n  and removing the weekly release freeze.\n• Reduced p99 API latency 6x by adding a read-through cache and killing an\n  N+1 in the orders path.",
      },
      {
        type: "p",
        text: "Same person. Same job. The first version tells you what the org chart said they were assigned. The second tells you **what was different because they were there** — and that is the only thing a hiring manager is actually reading for.",
      },
      {
        type: "p",
        text: "The formula that forces it — popularised as a Google recruiting guideline — is *accomplished [X], as measured by [Y], by doing [Z]*. It works not because it's magic but because you cannot finish the sentence without naming an outcome, a measurement and a method. Which happens to be exactly the three things you'll be asked about in the interview anyway. A bullet written this way is a **pre-answered interview question**.",
      },
      {
        type: "callout",
        tone: "butter",
        title: "\"But I don't have metrics\"",
        text: "You have more than you think, and none of them have to be revenue. Latency, deploy frequency, incident count, request volume, build time, error rate, team size, number of services, time-to-first-response. \"25 minutes → 4 minutes\" is a metric. So is \"9 pages a week → under 2\". Go looking; they're in your dashboards.",
      },
      { type: "h2", id: "the-stack", text: "Where does the tech stack actually belong?" },
      {
        type: "p",
        text: "Both places, doing different jobs.",
      },
      {
        type: "table",
        head: ["Placement", "What it does", "Worth"],
        rows: [
          [
            "**Inside a bullet, with a number**",
            "*\"Migrated 40 services to Kubernetes, deploy 25min → 4min.\"* Proves you've used it under real conditions.",
            "Very high",
          ],
          [
            "**In the summary**",
            "Read by everyone, so it does real work — but it's a claim, not evidence.",
            "Medium",
          ],
          [
            "**In the skills list**",
            "Necessary so a recruiter's keyword search returns you at all. Carries almost no persuasive weight on its own.",
            "A checkbox, not an argument",
          ],
          [
            "**As a five-star proficiency bar**",
            "Parses as nothing. Means nothing — nobody agrees what four stars in Python is.",
            "Actively negative",
          ],
        ],
      },
      {
        type: "p",
        text: "The practical rule: **every technology you'd be sad not to be asked about should appear inside a bullet at least once.** The skills list is there so the database search finds you. The bullets are there so the human keeps reading.",
      },
      { type: "h2", id: "projects", text: "Do side projects count?" },
      {
        type: "p",
        text: "Yes — under one condition. A project counts when **someone other than you has used it**. Stars, downloads, a company running it, teammates depending on it, users. *\"Open-source double-entry accounting library, 900+ stars, used in production by three companies\"* is a real credential.",
      },
      {
        type: "p",
        text: "A project does not count when it's a tutorial you followed. A to-do app, a weather dashboard, a clone of an existing product with no users — a hiring manager has seen four hundred of these and they read as *\"has completed a course\"*, which they already assumed. If you're early-career and that's all you have, **one** of them, described in terms of a real technical decision you made and defended, beats three of them listed as titles.",
      },
      {
        type: "quote",
        text: "A GitHub link with nothing on it is worse than no GitHub link. They will click it, and the click will cost you.",
      },
      { type: "h2", id: "what-to-cut", text: "What should you cut?" },
      {
        type: "ul",
        items: [
          "**The objective statement.** *\"Seeking a challenging role where I can leverage my skills.\"* Everyone is. Replace it with a summary that says what you do and how well.",
          "**Every soft-skill adjective.** \"Team player\", \"detail-oriented\", \"passionate\". Nobody has ever searched an ATS for *team player*, and nobody has ever believed one.",
          "**Coursework, if you're more than two years out.** It was relevant once.",
          "**Any technology you'd panic about being asked to whiteboard.** Every term on your resume is an implicit offer to discuss it for five minutes.",
          "**The second page**, if you're under ten years in. It isn't extra room; it's a page nobody reaches.",
        ],
      },
      {
        type: "callout",
        tone: "mint",
        title: "Do this next",
        text: "Take your current resume and cover everything below the top third of page one. Can a stranger tell, from what's left, what kind of engineer you are and how senior? If not, that's the whole problem — and it's fixable in twenty minutes. Then run it through our [free ATS checker](/ats-checker) to catch what a parser would drop.",
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────────
  {
    slug: "fresh-graduate-resume-template",
    title: "The Fresh Graduate Resume Template (When the Page Is Mostly Empty)",
    seoTitle: "Fresh Graduate Resume Template (2026) — Full Example Included",
    description:
      "You have one page and almost nothing to put on it. The fix isn't padding — it's reordering. A graduate resume template built around what you actually have, with a full example.",
    excerpt:
      "The cursor is blinking under EXPERIENCE and you have nothing to type. Here's the thing nobody tells you: the problem isn't that you have no experience. It's that you're filling in the wrong section first.",
    publishedAt: "2026-07-14",
    updatedAt: "2026-07-14",
    author: TEAM,
    tags: ["Templates", "Graduates", "Resume basics"],
    readingMinutes: 8,
    hero: "sprout",
    tone: "mint",
    faq: [
      {
        q: "What should a fresh graduate's resume include?",
        a: "Education near the top, then projects, then any work at all — including part-time and unrelated jobs — then skills. The order matters more than the content: you lead with the strongest true thing you have, and for a recent graduate that is usually the degree and the work you did during it.",
      },
      {
        q: "Should I include my GPA?",
        a: "Include it if it's strong (roughly 3.5+ / 2:1 or above) and you graduated within the last two years. Otherwise leave it off — an absent GPA is unremarkable, while a mediocre one is a number you've volunteered against yourself.",
      },
      {
        q: "How long should a graduate resume be?",
        a: "One page, and this is not negotiable. If you are struggling to fill it, the answer is never to pad — it is to describe what you did do in more detail, with specifics and numbers.",
      },
      {
        q: "Do part-time jobs belong on a graduate resume?",
        a: "Yes, and they are worth far more than graduates think. Two years of retail while carrying a full course load is evidence of reliability, time management and working with difficult people under pressure — all of which are things employers genuinely worry about in a first hire, and none of which your degree proves.",
      },
    ],
    body: [
      {
        type: "takeaways",
        items: [
          "You don't have an experience problem — you have an **order** problem. Lead with **Education**, then **Projects**, then any work at all.",
          "**Projects are experience.** Describe them like a job: what you built, what decisions you made, what happened.",
          "**Your part-time job counts.** Retail during a full course load is evidence of things a degree can't prove.",
          "**One page. Never pad.** Empty space beats filler — filler is what makes a resume look junior.",
        ],
      },
      {
        type: "p",
        text: "It's the same scene every year, in every country, in a few million bedrooms. You've opened a resume template. You've typed your name. You've typed your degree. And now the cursor is blinking under a heading that says **EXPERIENCE**, and you have nothing to put under it, and the whole exercise suddenly feels like an elaborate way of proving you shouldn't be hired.",
      },
      {
        type: "p",
        text: "So you start reaching. You add a line about being a *fast learner*. You describe the group project as though it were a startup. You put *Microsoft Word* under skills. And the document that comes out the other end is the specific, recognisable genre of **a resume that is embarrassed about itself** — and a recruiter can smell that in about a second and a half.",
      },
      {
        type: "p",
        text: "Here is the reframe that fixes it, and it is genuinely just a reordering problem.",
      },
      { type: "h2", id: "the-order", text: "Why is the order the whole problem?" },
      {
        type: "p",
        text: "A resume is read top to bottom, and the top is worth vastly more than the bottom. The standard template — Summary, Experience, Education, Skills — was designed for someone whose **strongest asset is their last job**.",
      },
      {
        type: "p",
        text: "That is not you. Your strongest asset is your degree and the work you did during it. So you move that to the top, and suddenly you are not a person with an empty Experience section — you are a person leading with your best material, which is what every good resume does.",
      },
      {
        type: "table",
        head: ["Standard order", "Graduate order", "Why"],
        rows: [
          ["Summary", "**Summary**", "Two lines. Still first — it's the only part guaranteed to be read."],
          ["Experience", "**Education**", "Your strongest true thing. Lead with it. Add relevant coursework, honours, thesis."],
          ["Education", "**Projects**", "This *is* your experience section. It's just not called that."],
          ["Skills", "**Experience**", "Whatever you have — internships, part-time, campus roles, volunteering. All of it."],
          ["—", "**Skills**", "Flat list. Real tools only."],
        ],
        caption: "Two years after your first job, flip it back. Until then, this is the order.",
      },
      {
        type: "figure",
        art: "sprout",
        caption: "You're not starting from nothing. You're starting from one thing, and you're leading with it.",
      },
      { type: "h2", id: "projects-are-experience", text: "Why are projects experience?" },
      {
        type: "p",
        text: "Because a hiring manager isn't reading for *employment*. They're reading for **evidence that you can do the work**. Employment is just the most common way people acquire that evidence. It is not the only way, and it's not even the best way for an entry-level hire — a first job teaches you a company, but a project you designed and shipped teaches you the thing they're actually hiring for.",
      },
      {
        type: "p",
        text: "So describe your projects **exactly like a job**. What was the problem? What did you build? What decision did you make that someone else would have made differently? What happened?",
      },
      {
        type: "sample",
        label: "How most graduates list a project",
        text: "• Final Year Project — built a web application using React and Node.js.\n• Group Project — created a database system for a local business.",
      },
      {
        type: "sample",
        label: "The same projects, as evidence",
        text: "• Built a route-planning app for the campus shuttle after realising the\n  timetable was wrong most mornings. Scraped the live GPS feed, cached it,\n  and shipped it to ~400 students in a term. Learned the hard way that the\n  GPS feed lies for the first 90 seconds after a bus starts moving.\n• Designed the schema for a local bakery's ordering system, then rewrote it\n  when we realised the original couldn't handle a customer changing an order\n  after it was placed. That rewrite is the thing I'd do differently first.",
      },
      {
        type: "p",
        text: "Read those again. Neither of them is a job. Both of them are unmistakably the work of someone who has actually built something, hit a wall, and thought about it. **That is what the reader is looking for**, and it beats *\"Responsible for social media\"* at a real internship every single time.",
      },
      {
        type: "callout",
        tone: "butter",
        title: "The detail that proves it's real",
        text: "Notice the thing that makes those bullets land: they both include something that went wrong. \"The GPS feed lies for the first 90 seconds.\" \"We rewrote it when we realised…\" Nobody who hadn't built the thing would know that. Specific, slightly awkward truths are the most credible thing you can put on a page — and they're the thing an AI-written resume can never fake, because it doesn't know them.",
      },
      { type: "h2", id: "the-template", text: "What does it look like assembled?" },
      {
        type: "doc",
        name: "Amara Osei",
        role: "Graduate Software Engineer",
        contact: "amara.osei@email.com · +44 7700 900412 · Manchester, UK · github.com/amaraosei",
        sections: [
          {
            heading: "Summary",
            lines: [
              "Computer Science graduate (First Class) with a focus on backend systems. Built and shipped a route-planning app used by ~400 students, and spent two years working retail alongside a full course load. Looking for a first backend role where I can own something small end to end.",
            ],
          },
          {
            heading: "Education",
            lines: [
              "**BSc Computer Science, First Class Honours** — University of Manchester · 2022 – 2026",
              "• Dissertation: caching strategies for real-time transit data (graded 78).",
              "• Relevant coursework: Distributed Systems, Databases, Algorithms, Software Engineering.",
            ],
          },
          {
            heading: "Projects",
            lines: [
              "**Campus Shuttle Tracker** — Python, FastAPI, Postgres, React",
              "• Built a route-planning app after noticing the published shuttle timetable was wrong most mornings. Scraped the live GPS feed, cached it, and shipped to ~400 students over one term.",
              "• Discovered the GPS feed reports garbage for the first ~90 seconds after a bus departs; added a smoothing window that cut false arrival times by roughly half.",
              "",
              "**Bakery Ordering System** — team of 3, PostgreSQL, Django",
              "• Designed the schema, then rewrote it mid-project when we found it couldn't handle an order being amended after placement. Shipped a working system the client still uses.",
            ],
          },
          {
            heading: "Experience",
            lines: [
              "**Sales Assistant (part-time, 16 hrs/week)** — Waterstones, Manchester · Sep 2023 – Jun 2026",
              "• Worked 16 hours a week alongside a full course load for three years, including every Christmas period.",
              "• Trained four new starters on the till and stock systems.",
              "",
              "**Course Representative** — School of Computer Science · 2024 – 2025",
              "• Elected by ~120 students; took their feedback to staff meetings and got the lab session times changed after two terms of arguing for it.",
            ],
          },
          {
            heading: "Skills",
            lines: [
              "**Languages:** Python, TypeScript, SQL, Java",
              "**Tools:** FastAPI, Django, PostgreSQL, React, Docker, Git",
            ],
          },
        ],
        caption: "Education first, projects as experience, and the retail job included on purpose — see below.",
      },
      { type: "h2", id: "the-retail-job", text: "Why is the retail job on there?" },
      {
        type: "p",
        text: "Because graduates cut it, and they are wrong to. It's the section people are most embarrassed by and it's doing more work than they realise.",
      },
      {
        type: "p",
        text: "Read it again: *sixteen hours a week alongside a full course load, for three years, including every Christmas.* That is not a line about selling books. It is evidence of **reliability, time management, and dealing with difficult people under pressure without falling apart** — and those are exactly the three things a manager quietly worries about when hiring someone with no professional history. Your degree proves none of them.",
      },
      {
        type: "p",
        text: "It also proves something subtler and more valuable: you have held down a commitment you didn't enjoy, for years, because you'd said you would. Nobody puts that in a bullet. Everybody reads it.",
      },
      { type: "h2", id: "never-pad", text: "What should you never do?" },
      {
        type: "ul",
        items: [
          "**Never pad.** A short, honest, one-page resume with white space on it reads as *confident*. A page stuffed with \"Proficient in Microsoft Word\" and \"Excellent communication skills\" reads as *nervous* — and nervous is the impression you can least afford.",
          "**Never inflate a title.** You were not \"Project Manager\" of a group assignment. You were a student, and everyone reading knows it.",
          "**Never list a skill you'd panic about.** \"Java\" on a resume is an offer to be asked about Java.",
          "**Never write \"references available on request.\"** It has been assumed since about 1994, and it's a whole line you could have used for something true.",
        ],
      },
      {
        type: "quote",
        text: "The empty page isn't the problem. Being embarrassed by it is — because that's what makes people pad, and padding is the only thing on a graduate resume that a recruiter can spot from across the room.",
      },
      {
        type: "callout",
        tone: "mint",
        title: "Do this next",
        text: "Move Education above Experience. Rewrite one project so it includes something that went wrong. Put the part-time job back in. That's twenty minutes and it will be a visibly different document. Then check it with our [free ATS checker](/ats-checker) — no signup — and read [how to write bullets that get interviews](/blog/resume-bullet-points-that-get-interviews).",
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────────
  {
    slug: "internship-resume-no-experience",
    title: "How to Write an Internship Resume When You Have No Experience",
    seoTitle: "Resume for an Internship With No Experience (Template + Example)",
    description:
      "You need experience to get experience. Here's the way out of that loop: you already have more evidence than you think — and it isn't in your job history.",
    excerpt:
      "You need experience to get the internship, and the internship is how you get experience. Everybody hits this wall. Here's what's actually on the other side of it — and it isn't a job history.",
    publishedAt: "2026-07-15",
    updatedAt: "2026-07-15",
    author: TEAM,
    tags: ["Templates", "Internships", "Graduates"],
    readingMinutes: 8,
    hero: "bridge",
    tone: "sky",
    faq: [
      {
        q: "How do I write a resume for an internship with no experience?",
        a: "Stop looking for jobs to list and start looking for evidence. Coursework you did well, anything you built, a part-time job, volunteering, a society you ran, a competition you entered. An internship recruiter is not expecting a work history — they are looking for signs you are curious, reliable and able to finish things.",
      },
      {
        q: "What do internship recruiters actually look for?",
        a: "Three things: that you can be taught, that you will show up, and that you actually want this field rather than any field. Nobody expects an intern to already be able to do the job. They are hiring potential, and every line of your resume should be evidence for one of those three.",
      },
      {
        q: "Can I put coursework on an internship resume?",
        a: "Yes, but only if it's specific. 'Relevant coursework: Databases, Algorithms' is a list of module names and carries almost nothing. 'Built a query planner in the Databases module; it was the only one in the cohort to handle nested joins' is a real signal.",
      },
      {
        q: "Should I apply if I don't meet all the requirements?",
        a: "Yes. Internship postings are written as wish lists by people who know they are hiring people who have not done the job before. Meeting most of the listed requirements is normal, and treating the list as a gate is the single most common reason good candidates never apply.",
      },
    ],
    body: [
      {
        type: "takeaways",
        items: [
          "**Nobody expects an intern to have experience.** They are hiring for *teachability, reliability, and genuine interest* — write for those three.",
          "You have more evidence than you think: **coursework, anything you built, part-time work, volunteering, societies, competitions.**",
          "**Specificity is the entire trick.** \"Relevant coursework: Databases\" is nothing. \"Built a query planner that handled nested joins\" is something.",
          "Apply anyway. The requirements list is a **wish list**, not a gate.",
        ],
      },
      {
        type: "p",
        text: "There's a moment, somewhere around your second year, when you notice the trap. Every internship you'd actually want lists *prior experience* under requirements. And the only way to get prior experience is an internship. You read that sentence twice, close the tab, and go and do something else for a while, feeling slightly worse about yourself than you did an hour ago.",
      },
      {
        type: "p",
        text: "Almost everyone hits this wall. Almost everyone gets past it. And the way through isn't a hack or a better template — it's noticing that **you have been answering the wrong question.**",
      },
      { type: "h2", id: "the-wrong-question", text: "What are they actually asking?" },
      {
        type: "p",
        text: "You think the question is *\"where have you worked?\"* It isn't. Nobody hiring an intern believes you've worked anywhere. That's the entire premise of the word *intern*.",
      },
      {
        type: "p",
        text: "The question is: **\"if we give this person a desk and three months, will it have been worth it?\"** And that resolves into three sub-questions, all of which you can answer today, with no job history at all:",
      },
      {
        type: "ol",
        items: [
          "**Can you be taught?** Is there evidence you've learned something hard, on purpose, and stuck with it past the point where it stopped being fun?",
          "**Will you show up?** Have you held a commitment — any commitment — over time, including on the days you didn't feel like it?",
          "**Do you actually want *this*?** Or did you apply to 200 postings with the same document? They can tell. They can always tell.",
        ],
      },
      {
        type: "p",
        text: "Every line on your resume should be evidence for one of those three. That's the whole strategy. Nothing else earns its space.",
      },
      {
        type: "figure",
        art: "bridge",
        caption: "You're not crossing the gap with a job history. You're crossing it with evidence — and you already have some.",
      },
      { type: "h2", id: "what-you-have", text: "What counts as evidence?" },
      {
        type: "p",
        text: "Far more than you're currently giving yourself credit for. Go through this list honestly and write down everything that applies — you'll find four or five things you'd written off:",
      },
      {
        type: "table",
        head: ["What you have", "What it's evidence of", "How to write it"],
        rows: [
          [
            "**A module you did unusually well in**",
            "Teachability. Genuine interest.",
            "Name the thing you built or solved in it, not the module title.",
          ],
          [
            "**Anything you built**",
            "You can finish things. You've hit a real wall.",
            "Describe the problem, the decision, and what went wrong.",
          ],
          [
            "**A part-time job — any job**",
            "Reliability. Pressure. Difficult people.",
            "Hours per week alongside study. That number is the point.",
          ],
          [
            "**Volunteering / a society / a team**",
            "Commitment over time without being paid.",
            "How long, and what changed because you were there.",
          ],
          [
            "**A competition, hackathon, or society you ran**",
            "Initiative. You do things unprompted.",
            "What you organised, and how many people it reached.",
          ],
          [
            "**A thing you taught yourself**",
            "Curiosity — the single most valued intern trait.",
            "What you built with it. Not the certificate.",
          ],
        ],
      },
      { type: "h2", id: "specificity", text: "Why does specificity matter so much?" },
      {
        type: "p",
        text: "Because generic lines are indistinguishable from lies, and specific ones are indistinguishable from truth. Compare:",
      },
      {
        type: "sample",
        label: "Generic — could be anyone",
        text: "• Relevant coursework: Databases, Algorithms, Software Engineering.\n• Strong problem-solving skills and a passion for technology.\n• Volunteered at a local charity.",
      },
      {
        type: "sample",
        label: "Specific — could only be you",
        text: "• Built a query planner for the Databases module. Mine was the only one in\n  the cohort that handled nested joins, because I'd misread the spec and\n  built the harder version by accident, then couldn't bring myself to\n  simplify it.\n• Taught myself enough Rust over one summer to rewrite my dissertation's\n  hot loop; it went from 40 seconds to 1.2.\n• Ran the weekly homework club at a local youth centre for 14 months.\n  Turned up every Tuesday, including the ones where nobody else did.",
      },
      {
        type: "p",
        text: "The second version is not from a better candidate. It's the **same candidate, written down honestly**. And every one of those three lines answers one of the three real questions — teachable, reliable, genuinely interested — without ever claiming to have had a job.",
      },
      {
        type: "quote",
        text: "\"I'd misread the spec and built the harder version by accident.\" No model writes that. No liar writes that. That's why it works.",
      },
      { type: "h2", id: "the-template", text: "What does the finished thing look like?" },
      {
        type: "doc",
        name: "Daniel Okonkwo",
        role: "Software Engineering Intern — Summer 2027",
        contact: "d.okonkwo@email.com · +44 7700 900318 · Leeds, UK · github.com/dokonkwo",
        sections: [
          {
            heading: "Summary",
            lines: [
              "Second-year Computer Science student looking for a summer software engineering internship. I taught myself Rust to make my own code faster, and I've run a homework club every Tuesday for over a year. No professional experience yet — that's what this is for.",
            ],
          },
          {
            heading: "Education",
            lines: [
              "**BSc Computer Science** — University of Leeds · 2025 – 2028 (expected)",
              "• Current average: 74. Best modules: Databases (82), Algorithms (79).",
              "• Built a query planner for the Databases coursework — the only submission in the cohort that handled nested joins.",
            ],
          },
          {
            heading: "Projects",
            lines: [
              "**Dissertation hot-loop rewrite** — Rust",
              "• Taught myself enough Rust over one summer to rewrite the slowest part of my own project. Runtime went from ~40s to ~1.2s.",
              "• The interesting part was discovering most of the time wasn't in the loop at all — it was in the allocation I'd hidden inside it.",
              "",
              "**Study-group scheduler** — Python, Flask, SQLite",
              "• Built it because coordinating six people over WhatsApp was worse than the coursework. About 30 people on my course ended up using it.",
            ],
          },
          {
            heading: "Experience",
            lines: [
              "**Volunteer Tutor** — Hillside Youth Centre, Leeds · Mar 2025 – Present",
              "• Ran the weekly homework club for 14 months. Turned up every Tuesday, including the ones where nobody else did.",
              "• Worked with 8–12 students aged 11–14 on maths and basic computing.",
              "",
              "**Barista (part-time, 12 hrs/week)** — Grind Coffee, Leeds · Jun 2025 – Present",
              "• 12 hours a week alongside a full course load, including every weekend of exam term.",
            ],
          },
          {
            heading: "Skills",
            lines: [
              "**Languages:** Python, Java, SQL, Rust (learning)",
              "**Tools:** Git, Flask, SQLite, Postgres, Linux",
            ],
          },
        ],
        caption: "No professional experience anywhere on this page — and it still answers all three questions a recruiter is actually asking.",
      },
      {
        type: "callout",
        tone: "rose",
        title: "The line most people are afraid to write",
        text: "Look at the last sentence of that summary: \"No professional experience yet — that's what this is for.\" It's honest, it's slightly disarming, and it does something clever: it names the objection before the reader does, which takes all the power out of it. You are applying for an internship. Not having done the job is the reason you qualify.",
      },
      { type: "h2", id: "apply-anyway", text: "One last thing: apply anyway." },
      {
        type: "p",
        text: "The requirements list on an internship posting is a **wish list**, assembled by a recruiter who is fully aware they're hiring people who have not done the job. It is not a gate, and treating it as one is the single most common reason good candidates never apply at all.",
      },
      {
        type: "p",
        text: "If you match most of it and you can write three honest, specific lines that say *I can be taught, I show up, and I want this one* — send it. The worst realistic outcome is silence, and silence costs you nothing but the twenty minutes you already spent.",
      },
      {
        type: "callout",
        tone: "mint",
        title: "Do this next",
        text: "Open a blank document and list every single thing from the evidence table above that applies to you — no editing, no judging. Most people find five or six. Then pick the three most specific and write them out properly. That's your resume. Check it free with our [ATS checker](/ats-checker), and if you're graduating soon, read the [fresh graduate template](/blog/fresh-graduate-resume-template) next.",
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
