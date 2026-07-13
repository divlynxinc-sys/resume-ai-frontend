// A resume parse-readiness analyser. Pure, synchronous, client-side.
//
// DESIGN CONSTRAINTS (all deliberate):
//   • No backend. No auth. No LLM. This runs on a paste, in the browser, for anyone.
//     That's the whole point — every competitor's "free" checker either walls the
//     RESULT behind a signup (Rezi) or the export behind a plan (Kickresume,
//     Enhancv). An ungated tool is the cheapest link magnet in the category, and it
//     costs us nothing to serve.
//   • It is HONEST about what it is. No real ATS emits a score — Rezi markets a
//     "score" on its homepage while its own docs concede "there's no universal
//     'resume score' hiring teams use behind the scenes". We say so in the UI, and
//     we call this what it is: a readability and parse-readiness estimate.
//   • Every check maps to something we actually assert in /blog/ats-resume-format.
//     If the blog says creative section headings break parsers, the checker looks
//     for creative section headings. Content and tool must not contradict.

export type CheckStatus = "pass" | "warn" | "fail";

export interface AtsCheck {
  id: string;
  label: string;
  status: CheckStatus;
  /** What we found in *their* resume. */
  detail: string;
  /** What to do about it. Omitted when the check passed. */
  fix?: string;
  weight: number;
}

export interface KeywordReport {
  matched: string[];
  missing: string[];
}

export interface AtsReport {
  score: number;
  checks: AtsCheck[];
  wordCount: number;
  keywords: KeywordReport | null;
}

const STANDARD_HEADINGS = [
  "experience",
  "work experience",
  "professional experience",
  "employment",
  "education",
  "skills",
  "technical skills",
  "summary",
  "professional summary",
  "profile",
  "objective",
  "projects",
  "certifications",
  "certificates",
  "awards",
  "publications",
  "languages",
  "volunteer",
];

/** Headings people invent that parsers don't map to a known field. */
const CREATIVE_HEADINGS = [
  "my journey",
  "what i bring",
  "about me",
  "my story",
  "where i've been",
  "career highlights",
  "the story so far",
  "who i am",
  "my toolkit",
  "what drives me",
];

const WEAK_OPENERS = [
  "responsible for",
  "duties included",
  "tasked with",
  "helped with",
  "helped to",
  "worked on",
  "assisted with",
  "involved in",
  "in charge of",
  "participated in",
];

/** Fluent but empty. These are the words that survive when nobody brought facts. */
const CLICHES = [
  "team player",
  "hard worker",
  "hard-working",
  "detail-oriented",
  "results-driven",
  "self-starter",
  "go-getter",
  "think outside the box",
  "synergy",
  "dynamic professional",
  "proven track record",
  "passionate about",
  "spearheaded",
  "leveraged",
  "world-class",
  "best-in-class",
];

const STOPWORDS = new Set([
  "the","and","for","with","you","your","our","are","will","that","this","have","has","from","not","but","all","can","who","its","their","they","them","was","were","been","more","most","any","own","out","who","how","why","what","when","which","into","than","then","also","such","each","other","some","only","over","just","must","may","should","would","could","able","work","working","role","job","team","teams","company","position","candidate","candidates","experience","experienced","years","year","strong","good","great","excellent","new","using","use","used","well","help","helping","across","within","including","include","includes","etc","plus","preferred","required","requirements","responsibilities","qualifications","skills","ability","abilities","opportunity","looking","join","us","we","in","on","at","to","of","a","an","is","it","as","by","or","be","do","does","if","so","up","per","via","about","like","make","makes","making","support","ensure","ensuring","drive","driving","deliver","delivering","build","building","develop","developing","manage","managing","lead","leading","environment","fast","paced","culture","benefits","salary","apply","hiring","hire","full","time","remote","hybrid","onsite","office","day","days","week","weeks","month","months",
]);

function normalize(text: string): string {
  // Pasting out of a PDF or Word almost always carries non-breaking and narrow
  // no-break spaces. Left in, they defeat every \s-based check below — the text
  // looks perfectly normal on screen and matches nothing.
  return text
    .replace(/\r\n/g, "\n")
    .replace(/[\u00A0\u202F\u2007\u2009]/g, " ")
    .trim();
}

function lines(text: string): string[] {
  return normalize(text)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

/**
 * Bullets, best-effort. Prefer explicit markers; if the paste lost them (very
 * common — copying out of a PDF strips bullet glyphs), fall back to treating
 * substantial non-heading lines as bullets so the analysis still means something.
 */
function bulletLines(all: string[]): string[] {
  const marked = all.filter((line) => /^[•▪·◦‣*\-–—]\s+/.test(line));
  if (marked.length >= 3) return marked.map((line) => line.replace(/^[•▪·◦‣*\-–—]\s+/, ""));
  return all.filter((line) => line.length > 40 && !isHeading(line));
}

function isHeading(line: string): boolean {
  if (line.length > 40) return false;
  const bare = line.replace(/[^a-z\s]/gi, "").trim().toLowerCase();
  if (!bare) return false;
  return (
    STANDARD_HEADINGS.includes(bare) ||
    CREATIVE_HEADINGS.includes(bare) ||
    (line === line.toUpperCase() && /[A-Z]/.test(line) && line.split(/\s+/).length <= 4)
  );
}

function countMatches(haystack: string, needles: string[]): string[] {
  return needles.filter((needle) => haystack.includes(needle));
}

/** Pulls candidate keywords out of a job description: frequent, non-stopword terms. */
function extractKeywords(jd: string): string[] {
  const words = normalize(jd)
    .toLowerCase()
    .replace(/[^a-z0-9+#./\s-]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  const freq = new Map<string, number>();
  for (const word of words) {
    const term = word.replace(/^[-.]+|[-.]+$/g, "");
    if (term.length < 3 || term.length > 24) continue;
    if (STOPWORDS.has(term)) continue;
    if (/^\d+$/.test(term)) continue;
    freq.set(term, (freq.get(term) ?? 0) + 1);
  }

  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 18)
    .map(([term]) => term);
}

export function analyzeResume(resumeText: string, jobDescription = ""): AtsReport | null {
  const text = normalize(resumeText);
  if (text.split(/\s+/).filter(Boolean).length < 40) return null;

  const lower = text.toLowerCase();
  const all = lines(text);
  const bullets = bulletLines(all);
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const checks: AtsCheck[] = [];

  // 1. Contact block ─────────────────────────────────────────────────────────
  const hasEmail = /[\w.+-]+@[\w-]+\.[\w.]+/.test(text);
  const hasPhone = /(\+?\d[\d\s().-]{7,}\d)/.test(text);
  checks.push({
    id: "contact",
    label: "Contact details are readable",
    weight: 12,
    status: hasEmail && hasPhone ? "pass" : hasEmail || hasPhone ? "warn" : "fail",
    detail:
      hasEmail && hasPhone
        ? "Found an email address and a phone number."
        : hasEmail
        ? "Found an email address, but no phone number."
        : hasPhone
        ? "Found a phone number, but no email address."
        : "No email address or phone number found in the text.",
    fix:
      hasEmail && hasPhone
        ? undefined
        : "Put your name, email, phone and city in the body of the document — not in the page header or footer. Many parsers skip header/footer regions entirely.",
  });

  // 2. Standard section headings ─────────────────────────────────────────────
  const foundStandard = STANDARD_HEADINGS.filter((heading) =>
    new RegExp(`(^|\\n)\\s*${heading}\\b`, "i").test(text)
  );
  const foundCreative = countMatches(lower, CREATIVE_HEADINGS);
  const coreFound = ["experience", "education", "skills"].filter((core) =>
    foundStandard.some((heading) => heading.includes(core))
  );
  checks.push({
    id: "headings",
    label: "Uses standard section headings",
    weight: 18,
    status: coreFound.length >= 3 ? "pass" : coreFound.length >= 2 ? "warn" : "fail",
    detail:
      coreFound.length >= 3
        ? "Found Experience, Education and Skills."
        : `${
            coreFound.length === 0
              ? "Found none of the three core sections (Experience, Education, Skills)."
              : `Found only ${coreFound.join(" and ")} — missing ${["experience", "education", "skills"]
                  .filter((core) => !coreFound.includes(core))
                  .join(" and ")}.`
          }${foundCreative.length ? ` Creative heading detected: “${foundCreative[0]}”.` : ""}`,
    fix:
      coreFound.length >= 3
        ? undefined
        : "Name your sections exactly Experience, Education and Skills. A parser is looking for those words — it won't map “My Journey” to anything, so that content is dropped.",
  });

  // 3. Quantified impact ─────────────────────────────────────────────────────
  const quantified = bullets.filter((line) =>
    /\d+\s?%|\$\s?\d|\d+x\b|\b\d[\d,.]*\s?(k|m|bn|million|billion)?\b/i.test(line)
  );
  const quantRatio = bullets.length ? quantified.length / bullets.length : 0;
  checks.push({
    id: "quantified",
    label: "Bullets contain numbers",
    weight: 20,
    status: quantRatio >= 0.4 ? "pass" : quantRatio >= 0.15 ? "warn" : "fail",
    detail: bullets.length
      ? `${quantified.length} of ${bullets.length} bullet lines contain a number (${Math.round(
          quantRatio * 100
        )}%).`
      : "Couldn't identify any bullet lines.",
    fix:
      quantRatio >= 0.4
        ? undefined
        : "Aim for roughly half. A metric isn't only revenue — time saved, volume handled, headcount, error rate and frequency all count. “3 days → 4 hours” is a metric.",
  });

  // 4. Weak openers ──────────────────────────────────────────────────────────
  const weak = WEAK_OPENERS.filter((phrase) => lower.includes(phrase));
  checks.push({
    id: "weak-openers",
    label: "Bullets lead with strong verbs",
    weight: 14,
    status: weak.length === 0 ? "pass" : weak.length <= 2 ? "warn" : "fail",
    detail: weak.length
      ? `Found ${weak.length} duty-style phrase${weak.length === 1 ? "" : "s"}: ${weak
          .slice(0, 3)
          .map((phrase) => `“${phrase}”`)
          .join(", ")}.`
      : "No “responsible for” / “helped with” style phrasing found.",
    fix: weak.length
      ? "These describe a duty, not a result. Open with a past-tense verb and lead with the outcome: “Cut deploy time 6× by containerising the build.”"
      : undefined,
  });

  // 5. Length ────────────────────────────────────────────────────────────────
  const lengthOk = wordCount >= 350 && wordCount <= 1000;
  checks.push({
    id: "length",
    label: "Length is in range",
    weight: 8,
    status: lengthOk ? "pass" : wordCount < 250 || wordCount > 1300 ? "fail" : "warn",
    detail: `${wordCount} words.`,
    fix: lengthOk
      ? undefined
      : wordCount < 350
      ? "This is thin. Most one-page resumes land around 400–650 words — you likely have achievements you haven't written down."
      : "This is long. Cut older roles to a line or two and keep depth for what's recent and relevant.",
  });

  // 6. Resume register (no first-person pronouns) ────────────────────────────
  const pronouns = (text.match(/\b(i|i'm|i've|my|me)\b/gi) ?? []).length;
  checks.push({
    id: "pronouns",
    label: "Written in resume register",
    weight: 6,
    status: pronouns === 0 ? "pass" : pronouns <= 3 ? "warn" : "fail",
    detail: pronouns
      ? `Found ${pronouns} first-person pronoun${pronouns === 1 ? "" : "s"} (“I”, “my”).`
      : "No first-person pronouns.",
    fix: pronouns
      ? "Resume register is compressed — drop the pronoun. “Rebuilt the onboarding flow”, not “I rebuilt our onboarding flow.”"
      : undefined,
  });

  // 7. Clichés ───────────────────────────────────────────────────────────────
  const cliches = countMatches(lower, CLICHES);
  checks.push({
    id: "cliches",
    label: "Free of filler phrases",
    weight: 8,
    status: cliches.length === 0 ? "pass" : cliches.length <= 2 ? "warn" : "fail",
    detail: cliches.length
      ? `Found: ${cliches.slice(0, 4).map((phrase) => `“${phrase}”`).join(", ")}.`
      : "No common filler phrases found.",
    fix: cliches.length
      ? "These assert competence without evidencing it, and nobody has ever searched an ATS for “team player”. Replace each with the thing you actually did."
      : undefined,
  });

  // 8. Dates ─────────────────────────────────────────────────────────────────
  const dateHits = (
    text.match(/\b(19|20)\d{2}\b|\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s*\d{4}/gi) ??
    []
  ).length;
  checks.push({
    id: "dates",
    label: "Roles carry dates",
    weight: 8,
    status: dateHits >= 4 ? "pass" : dateHits >= 2 ? "warn" : "fail",
    detail:
      dateHits >= 2
        ? `Found ${dateHits} date references.`
        : "Found few or no dates.",
    fix:
      dateHits >= 4
        ? undefined
        : "Give every role a start and end date in one consistent format (Mar 2022 – Present). Parsers use dates to reconstruct your timeline; without them, roles can merge.",
  });

  // 9. Bullet length ─────────────────────────────────────────────────────────
  const longBullets = bullets.filter((line) => line.length > 220);
  checks.push({
    id: "bullet-length",
    label: "Bullets are scannable",
    weight: 6,
    status: longBullets.length === 0 ? "pass" : longBullets.length <= 2 ? "warn" : "fail",
    detail: longBullets.length
      ? `${longBullets.length} bullet${longBullets.length === 1 ? " runs" : "s run"} very long.`
      : "Bullets are a readable length.",
    fix: longBullets.length
      ? "A bullet that runs past two lines is usually two bullets that haven't been separated yet."
      : undefined,
  });

  // 10. Keyword match against the job description (optional) ─────────────────
  let keywords: KeywordReport | null = null;
  if (jobDescription.trim().length > 80) {
    const candidates = extractKeywords(jobDescription);
    const matched = candidates.filter((term) => lower.includes(term));
    const missing = candidates.filter((term) => !lower.includes(term));
    keywords = { matched, missing: missing.slice(0, 12) };

    const ratio = candidates.length ? matched.length / candidates.length : 0;
    checks.push({
      id: "keywords",
      label: "Matches the job description",
      weight: 20,
      status: ratio >= 0.55 ? "pass" : ratio >= 0.3 ? "warn" : "fail",
      detail: `Your resume contains ${matched.length} of the ${candidates.length} most prominent terms in that job description.`,
      fix:
        ratio >= 0.55
          ? undefined
          : "Only add the ones that are genuinely true of you — and put them inside a bullet that proves it, not in a keyword list. A term in a skills list claims the skill; a term in a bullet with a number attached proves it.",
    });
  }

  const totalWeight = checks.reduce((sum, check) => sum + check.weight, 0);
  const earned = checks.reduce(
    (sum, check) => sum + check.weight * (check.status === "pass" ? 1 : check.status === "warn" ? 0.5 : 0),
    0
  );

  return {
    // Honest 0–100. Note the AI service's own scorer is hard-capped at 89 with
    // weights summing to 0.95 — a bug we deliberately do not reproduce here.
    score: Math.round((earned / totalWeight) * 100),
    checks,
    wordCount,
    keywords,
  };
}
