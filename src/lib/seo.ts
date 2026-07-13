// Per-route <head> management + JSON-LD, without pulling in react-helmet.
//
// WHY THIS EXISTS: `index.html` ships a single static <title>Jobsynk AI</title> for
// all 36 routes, no description, no canonical, no OG tags. Google renders JS and
// will eventually see whatever we set here — but GPTBot, ClaudeBot and
// PerplexityBot FETCH JavaScript AND NEVER EXECUTE IT (Vercel/MERJ, ~1B requests).
//
// So this hook is only half the fix. It covers Google + social unfurls. The other
// half — the half that makes us visible to answer engines at all — is
// `scripts/prerender-blog.mjs`, which bakes the same tags into static HTML at
// build time. Keep the two in sync: this hook and that script must produce the
// same canonical/description/JSON-LD for a given page.

import { useEffect } from "react";

// Single source of truth — see lib/site.ts. Re-exported so existing importers of
// `SITE_URL` from this module keep working.
export { SITE_URL, SITE_NAME } from "./site";
import { SITE_URL, SITE_NAME } from "./site";

const MANAGED = "data-seo-managed";

function upsertMeta(key: "name" | "property", value: string, content: string) {
  const selector = `meta[${key}="${value}"]`;
  let tag = document.head.querySelector<HTMLMetaElement>(selector);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(key, value);
    tag.setAttribute(MANAGED, "");
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
}

function upsertLink(rel: string, href: string) {
  let tag = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!tag) {
    tag = document.createElement("link");
    tag.setAttribute("rel", rel);
    tag.setAttribute(MANAGED, "");
    document.head.appendChild(tag);
  }
  tag.setAttribute("href", href);
}

export interface SeoOptions {
  title: string;
  description: string;
  /** Path only, e.g. "/blog/ats-resume-format". */
  path: string;
  type?: "website" | "article";
  publishedAt?: string;
  updatedAt?: string;
  author?: string;
  tags?: string[];
  /** One or more JSON-LD objects. Replaced wholesale on every route change. */
  jsonLd?: object[];
}

export function useSeo(options: SeoOptions): void {
  const {
    title,
    description,
    path,
    type = "website",
    publishedAt,
    updatedAt,
    author,
    tags,
    jsonLd,
  } = options;

  // jsonLd is a fresh array literal on every render, so it can't be a dep — the
  // effect would loop. Serialising it gives a stable primitive to compare on.
  const jsonLdKey = jsonLd ? JSON.stringify(jsonLd) : "";
  const tagsKey = tags ? tags.join(",") : "";

  useEffect(() => {
    const url = `${SITE_URL}${path}`;

    document.title = title;
    upsertMeta("name", "description", description);
    upsertLink("canonical", url);

    upsertMeta("property", "og:title", title);
    upsertMeta("property", "og:description", description);
    upsertMeta("property", "og:url", url);
    upsertMeta("property", "og:type", type);
    upsertMeta("property", "og:site_name", SITE_NAME);

    upsertMeta("name", "twitter:card", "summary_large_image");
    upsertMeta("name", "twitter:title", title);
    upsertMeta("name", "twitter:description", description);

    if (publishedAt) upsertMeta("property", "article:published_time", publishedAt);
    if (updatedAt) upsertMeta("property", "article:modified_time", updatedAt);
    if (author) upsertMeta("name", "author", author);
    if (tagsKey) upsertMeta("property", "article:tag", tagsKey);

    // Replace, don't append — otherwise client-side navigation stacks up stale
    // graphs and the page ends up describing three different articles at once.
    document.head
      .querySelectorAll('script[type="application/ld+json"][data-seo-managed]')
      .forEach((node) => node.remove());

    if (jsonLdKey) {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.setAttribute(MANAGED, "");
      script.textContent = jsonLdKey;
      document.head.appendChild(script);
    }
  }, [title, description, path, type, publishedAt, updatedAt, author, tagsKey, jsonLdKey]);
}
