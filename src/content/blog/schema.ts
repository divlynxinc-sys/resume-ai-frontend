// JSON-LD graph builders.
//
// Shared by `useSeo()` (client) and `scripts/prerender-blog.mjs` (build time) so a
// crawler and a browser get byte-identical structured data.
//
// Expectation-setting: Ahrefs' controlled study (1,885 pages that added JSON-LD vs
// a 4,000-page control) found NO citation uplift on ChatGPT/AI Mode and a small
// DECLINE on AI Overviews. So schema is not an AEO lever. We ship it because it is
// cheap, it is required for Google rich results (FAQ, breadcrumbs), and `sameAs`
// is a genuine entity-disambiguation signal. Do not expect it to move AI citations
// on its own — the content shape and off-site mentions do that.

import type { Post } from "./types";
import { toPlainText } from "./render";

// Single source of truth — see lib/site.ts. Re-exported because `ats-checker.tsx`
// and the prerenderer both pull SITE_URL from this module.
export { SITE_URL, SITE_NAME } from "@/lib/site";
import { SITE_URL, SITE_NAME } from "@/lib/site";

const ORG_ID = `${SITE_URL}/#organization`;
const SITE_ID = `${SITE_URL}/#website`;

export function organizationSchema(): object {
  return {
    "@type": "Organization",
    "@id": ORG_ID,
    name: SITE_NAME,
    url: SITE_URL,
    description:
      "AI resume builder that tailors your resume to a job description, generates cover letters, interview answers and recruiter outreach emails.",
    // sameAs is the part of this graph that actually earns its keep: it tells
    // search + LLM entity layers that these profiles are all the same company.
    // Fill in every profile you own — an unresolved entity is a brand an answer
    // engine can't confidently name.
    sameAs: [
      "https://www.linkedin.com/company/jobsynk",
      "https://x.com/jobsynk",
    ],
  };
}

export function websiteSchema(): object {
  return {
    "@type": "WebSite",
    "@id": SITE_ID,
    url: SITE_URL,
    name: SITE_NAME,
    publisher: { "@id": ORG_ID },
  };
}

export function softwareApplicationSchema(): object {
  return {
    "@type": "SoftwareApplication",
    name: SITE_NAME,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: SITE_URL,
    description:
      "AI resume builder with ATS-friendly templates, job-description tailoring, cover letter generation and interview preparation.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      description: "Free resume builder. Paid plans unlock AI features and all templates.",
    },
    publisher: { "@id": ORG_ID },
  };
}

/**
 * FAQPage graph node. Pass `path` to stamp a stable @id (fine for pages whose
 * schema only the prerenderer emits). Omit it where a client `useSeo()` also
 * emits the graph — both sides must then call this with identical arguments so
 * crawler and browser stay byte-identical.
 */
export function faqPageSchema(items: Array<{ q: string; a: string }>, path?: string): object {
  return {
    "@type": "FAQPage",
    ...(path ? { "@id": `${SITE_URL}${path}#faq` } : {}),
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}

function breadcrumbSchema(trail: Array<{ name: string; path: string }>): object {
  return {
    "@type": "BreadcrumbList",
    itemListElement: trail.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: `${SITE_URL}${crumb.path}`,
    })),
  };
}

/** The graph for a single post: Article + FAQPage + Breadcrumbs + Org + Site. */
export function postSchema(post: Post): object[] {
  const url = `${SITE_URL}/blog/${post.slug}`;

  const article = {
    "@type": "Article",
    "@id": `${url}#article`,
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: { "@type": "Organization", name: post.author.name, url: SITE_URL },
    publisher: { "@id": ORG_ID },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    keywords: post.tags.join(", "),
    inLanguage: "en",
    isAccessibleForFree: true,
  };

  const graph: object[] = [
    organizationSchema(),
    websiteSchema(),
    article,
    breadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "Blog", path: "/blog" },
      { name: post.title, path: `/blog/${post.slug}` },
    ]),
  ];

  if (post.faq.length > 0) {
    graph.push({
      "@type": "FAQPage",
      "@id": `${url}#faq`,
      mainEntity: post.faq.map((item) => ({
        "@type": "Question",
        name: toPlainText(item.q),
        acceptedAnswer: { "@type": "Answer", text: toPlainText(item.a) },
      })),
    });
  }

  return [{ "@context": "https://schema.org", "@graph": graph }];
}

/** The graph for the blog index: Blog + an ItemList of every post. */
export function blogIndexSchema(posts: Post[]): object[] {
  return [
    {
      "@context": "https://schema.org",
      "@graph": [
        organizationSchema(),
        websiteSchema(),
        {
          "@type": "Blog",
          "@id": `${SITE_URL}/blog#blog`,
          url: `${SITE_URL}/blog`,
          name: `${SITE_NAME} Blog`,
          description:
            "Practical, evidence-led guides on ATS formatting, resume tailoring, keywords, bullet points and AI-assisted job applications.",
          publisher: { "@id": ORG_ID },
          blogPost: posts.map((post) => ({
            "@type": "BlogPosting",
            headline: post.title,
            description: post.description,
            datePublished: post.publishedAt,
            dateModified: post.updatedAt,
            url: `${SITE_URL}/blog/${post.slug}`,
            author: { "@type": "Organization", name: post.author.name },
          })),
        },
        breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Blog", path: "/blog" },
        ]),
      ],
    },
  ];
}
