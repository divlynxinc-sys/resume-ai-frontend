// Blog content model.
//
// Posts are plain data + a small block union. `render.ts` turns blocks into HTML
// strings, exactly like `lib/resume-templates/` turns resume data into HTML. That
// keeps ONE renderer feeding both the React page and `scripts/prerender-blog.mjs`,
// so the crawlable static HTML and the hydrated SPA can never drift apart.

export type Block =
  | { type: "p"; text: string }
  | { type: "h2"; text: string; id: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "quote"; text: string; cite?: string }
  /** Coloured aside. `tone` maps onto the pastel tokens. */
  | { type: "callout"; title: string; text: string; tone?: CalloutTone }
  /** Renders as a real <table>; LLM retrievers lift these cleanly. */
  | { type: "table"; head: string[]; rows: string[][]; caption?: string }
  /** Inline minimal SVG figure, keyed into `art.ts`. */
  | { type: "figure"; art: ArtKey; caption?: string }
  /** Renders as <pre>. Used for JD/bullet before-after samples. */
  | { type: "sample"; label?: string; text: string }
  | {
      type: "doc";
      name: string;
      role: string;
      contact: string;
      sections: Array<{ heading: string; lines: string[] }>;
      caption?: string;
    }
  /** The "answer box" at the top of every post — the chunk an LLM quotes. */
  | { type: "takeaways"; items: string[] };

export type CalloutTone = "accent" | "mint" | "butter" | "rose" | "sky";

export type ArtKey =
  | "scanner"
  | "signal"
  | "match"
  | "keywords"
  | "impact"
  | "voice"
  | "funnel"
  | "grid"
  | "layers"
  | "stack"
  | "sprout"
  | "bridge";

export interface FaqItem {
  q: string;
  a: string;
}

export interface Author {
  name: string;
  role: string;
  /** Two-letter monogram shown in the byline avatar. */
  initials: string;
}

export interface Post {
  slug: string;
  title: string;
  /** <title> + og:title. Kept separate so it can be shorter/keyword-led. */
  seoTitle: string;
  /** meta description + og:description. Aim for 150-160 chars. */
  description: string;
  /** Shown on cards and in the landing-page strip. */
  excerpt: string;
  /** ISO date. Drives sitemap <lastmod> and Article JSON-LD. */
  publishedAt: string;
  updatedAt: string;
  author: Author;
  tags: string[];
  readingMinutes: number;
  hero: ArtKey;
  /** Pastel accent used by the card + hero. */
  tone: CalloutTone;
  body: Block[];
  /** Emitted as FAQPage JSON-LD *and* rendered on-page. */
  faq: FaqItem[];
}
