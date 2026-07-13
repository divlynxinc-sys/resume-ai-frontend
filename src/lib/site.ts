// THE canonical origin. One constant, one place.
//
// This existed as three separate copies (lib/seo.ts, content/blog/schema.ts and
// scripts/prerender.mjs) and all three were wrong — they said `jobsynk.ai` while
// the live zone is `jobsynk.co`. That is not a cosmetic bug: a <link rel="canonical">
// pointing at a DIFFERENT domain tells Google "do not index me, index that one
// instead", so every page would have de-indexed itself on deploy.
//
// If the domain ever changes, change it HERE and nowhere else. `scripts/prerender.mjs`
// imports this same value through the esbuild content bundle, so the static HTML,
// the sitemap, robots.txt, llms.txt and the client-side canonicals cannot disagree.
//
// No trailing slash — every caller builds `${SITE_URL}${path}` and paths start with "/".

export const SITE_URL = "https://jobsynk.co";
export const SITE_NAME = "Jobsynk AI";
