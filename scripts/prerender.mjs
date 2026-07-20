// Post-build prerenderer. Turns the PUBLIC surface from an invisible SPA into real,
// crawlable HTML, and emits sitemap.xml / robots.txt / llms.txt.
//
// ─── WHY ─────────────────────────────────────────────────────────────────────
// Vercel/MERJ measured ~1B crawler requests: Googlebot and AppleBot execute
// JavaScript; GPTBot, ClaudeBot, OAI-SearchBot and PerplexityBot FETCH JavaScript
// AND NEVER EXECUTE IT. Our app ships an empty <div id="root">, so to every AI
// answer engine except Google, every page of jobsynk.co is a BLANK DOCUMENT.
// Only HTML in the initial response fixes that.
//
// ─── TWO RENDERERS, ON PURPOSE ───────────────────────────────────────────────
//  • Blog       → rendered from DATA (src/content/blog/render.ts). Cheap, exact.
//  • Marketing  → rendered by REACT (react-dom/server via scripts/ssr-entry.tsx),
//                 because /, /pricing and /faq are real component trees. Hand-
//                 writing their HTML here would duplicate the markup and drift.
//
// ─── THE RULE FOR THE BLOG MARKUP BELOW ──────────────────────────────────────
// Every Tailwind class in the hand-written blog markup must ALSO appear under
// src/. Tailwind v4 scans source files and that CSS is already compiled when this
// runs — a class invented here would have no rule. (The React-rendered pages are
// immune to this: their classes come from the components themselves.)
//
// ─── COUPLING TO index.html ──────────────────────────────────────────────────
// This script rewrites the shell's <title> with a regex and strips its default
// meta. So: keep index.html's <title> on ONE line, and don't add HTML comments to
// its <head> — comments survive into every prerendered page and pollute the text a
// crawler extracts.
//
// ─── DO NOT TEST WITH `vite preview` ─────────────────────────────────────────
// Its SPA fallback beats the file on disk, so /blog/<slug> returns the shell even
// when the prerender is perfect. Vercel checks the filesystem BEFORE rewrites, so
// it behaves correctly. Verify post-deploy:
//   curl -s -A GPTBot https://jobsynk.co/blog/ats-resume-format | wc -w

import { build } from "esbuild";
import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");
const srcDir = resolve(projectRoot, "src");
const distDir = resolve(projectRoot, "dist");

// SITE_URL is deliberately NOT defined here — it is imported from src/lib/site.ts
// through the content bundle below. It used to be a third hardcoded copy, and all
// three copies were wrong at once (jobsynk.ai, while the live zone is jobsynk.co).
// One constant, one place.

// ─────────────────────────────────────────────────────────────────────────────
// 0. The Vite shell (carries the hashed CSS/JS links we must inherit)
// ─────────────────────────────────────────────────────────────────────────────
let shell;
try {
  shell = readFileSync(resolve(distDir, "index.html"), "utf8");
} catch {
  console.error("[prerender] dist/index.html not found — run `vite build` first.");
  process.exit(1);
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Browser shims. Installed BEFORE importing any bundled app code.
//
// react-dom/server needs none of this — the app does. `landing-page.tsx` calls
// window.matchMedia() in a RENDER body (not a useEffect), so without a shim the
// render throws. Everything else here is belt-and-braces for code that runs at
// module scope or in a useState initialiser.
//
// `fetch` returns a promise that NEVER settles: the contexts kick off requests in
// useEffect (which the server renderer never runs), but if anything did fire we
// want it to be inert rather than hitting the network or throwing an unhandled
// rejection that kills the build.
// ─────────────────────────────────────────────────────────────────────────────
function installShims() {
  const noop = () => {};
  const memoryStorage = () => {
    const map = new Map();
    return {
      getItem: (k) => (map.has(k) ? map.get(k) : null),
      setItem: (k, v) => map.set(k, String(v)),
      removeItem: (k) => map.delete(k),
      clear: () => map.clear(),
      key: () => null,
      get length() {
        return map.size;
      },
    };
  };

  const matchMedia = () => ({
    matches: false, // never "prefers-reduced-motion" — render the normal markup
    media: "",
    onchange: null,
    addListener: noop,
    removeListener: noop,
    addEventListener: noop,
    removeEventListener: noop,
    dispatchEvent: () => false,
  });

  const element = {
    classList: { add: noop, remove: noop, toggle: noop, contains: () => false },
    setAttribute: noop,
    removeAttribute: noop,
    appendChild: noop,
    removeChild: noop,
    scrollIntoView: noop,
    querySelector: () => null,
    querySelectorAll: () => [],
    addEventListener: noop,
    removeEventListener: noop,
    style: {},
  };

  const doc = {
    documentElement: element,
    head: element,
    body: element,
    getElementById: () => null,
    querySelector: () => null,
    querySelectorAll: () => [],
    createElement: () => ({ ...element }),
    addEventListener: noop,
    removeEventListener: noop,
  };

  class Observer {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  }

  const win = {
    matchMedia,
    scrollTo: noop,
    scrollY: 0,
    setTimeout: (...a) => setTimeout(...a),
    clearTimeout: (...a) => clearTimeout(...a),
    requestAnimationFrame: noop,
    cancelAnimationFrame: noop,
    addEventListener: noop,
    removeEventListener: noop,
    dispatchEvent: () => false,
    decodeURIComponent,
    // origin is cosmetic here — no marketing page reads it during render. Kept
    // literal-free of SITE_URL so shims can be installed before the bundle import.
    location: { pathname: "/", search: "", hash: "", href: "/", origin: "" },
    localStorage: memoryStorage(),
    sessionStorage: memoryStorage(),
    document: doc,
  };

  globalThis.window = win;
  globalThis.document = doc;
  globalThis.localStorage = win.localStorage;
  globalThis.sessionStorage = win.sessionStorage;
  globalThis.matchMedia = matchMedia;
  // Node 22 defines `navigator` as a getter-only global — assigning to it throws.
  // It already exists, so there is nothing to shim.
  globalThis.IntersectionObserver = Observer;
  globalThis.MutationObserver = Observer;
  globalThis.ResizeObserver = Observer;
  globalThis.requestAnimationFrame = noop;
  globalThis.fetch = () => new Promise(() => {});
}

installShims();

// ─────────────────────────────────────────────────────────────────────────────
// 2. Resolve `import logo from "./Logo-01.png"` to the file Vite actually emitted.
//
// esbuild can't load a PNG. Inlining as a data URI would add ~80KB × 6 to every
// page. Instead we map each source asset onto its hashed twin in dist/assets, so
// the prerendered <img src> is a real, working URL.
// ─────────────────────────────────────────────────────────────────────────────
function assetPlugin() {
  let emitted = [];
  try {
    emitted = readdirSync(resolve(distDir, "assets"));
  } catch {
    /* no assets dir — every asset falls back to "" below */
  }

  const publicPathFor = (file) => {
    const base = file.replace(/\.[a-z0-9]+$/i, ""); // "Logo-01"
    const ext = file.slice(base.length);
    const match = emitted.find(
      (name) => name.startsWith(`${base}-`) && name.endsWith(ext) && !name.endsWith(".js")
    );
    return match ? `/assets/${match}` : "";
  };

  return {
    name: "vite-assets",
    setup(b) {
      b.onResolve({ filter: /\.(png|jpe?g|gif|webp|svg)$/ }, (args) => ({
        path: args.path,
        namespace: "vite-asset",
      }));
      b.onLoad({ filter: /.*/, namespace: "vite-asset" }, (args) => {
        const file = args.path.split(/[\\/]/).pop();
        return { contents: `export default ${JSON.stringify(publicPathFor(file))};`, loader: "js" };
      });
    },
  };
}

/**
 * Vite understands `import url from "foo.js?url"` — esbuild does not, and would
 * fail to resolve it. `lib/resume-extract.ts` uses it to locate the pdf.js worker.
 * Stub it: the server render never loads a PDF, so the value is unused here.
 */
function viteUrlSuffixPlugin() {
  return {
    name: "vite-url-suffix",
    setup(b) {
      b.onResolve({ filter: /\?url$/ }, (args) => ({ path: args.path, namespace: "url-stub" }));
      b.onLoad({ filter: /.*/, namespace: "url-stub" }, () => ({
        contents: 'export default "";',
        loader: "js",
      }));
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Bundle content modules + the React SSR entry, then import them
// ─────────────────────────────────────────────────────────────────────────────
const contentEntry = resolve(__dirname, ".content-entry.ts");
const contentBundle = resolve(__dirname, ".content-bundle.mjs");
const ssrBundle = resolve(__dirname, ".ssr-bundle.mjs");

writeFileSync(
  contentEntry,
  `export { SITE_URL } from "../src/lib/site";
export { POSTS_BY_DATE } from "../src/content/blog/posts";
export { renderPostBodyHtml, renderPostFaqHtml, renderTocHtml, countWords, formatPostDate } from "../src/content/blog/render";
export { renderArt } from "../src/content/blog/art";
export { postSchema, blogIndexSchema, organizationSchema, websiteSchema, softwareApplicationSchema, faqPageSchema } from "../src/content/blog/schema";
export { ATS_CHECKER_FAQ, FAQ_PAGE_ITEMS } from "../src/content/site-faq";
`,
  "utf8"
);

await build({
  entryPoints: [contentEntry],
  bundle: true,
  format: "esm",
  platform: "node",
  outfile: contentBundle,
  logLevel: "warning",
  // schema.ts imports SITE_URL via the "@" alias — without this the bundle fails.
  alias: { "@": srcDir },
});

const {
  SITE_URL,
  POSTS_BY_DATE,
  renderPostBodyHtml,
  renderPostFaqHtml,
  renderTocHtml,
  renderArt,
  postSchema,
  blogIndexSchema,
  organizationSchema,
  websiteSchema,
  softwareApplicationSchema,
  faqPageSchema,
  ATS_CHECKER_FAQ,
  FAQ_PAGE_ITEMS,
  countWords,
  formatPostDate: formatDate,
} = await import(pathToFileURL(contentBundle).href);

// The React SSR bundle is allowed to fail — see the try/catch around renderPage
// below. A broken marketing prerender must never break the deploy.
let renderPage = null;
try {
  await build({
    entryPoints: [resolve(__dirname, "ssr-entry.tsx")],
    bundle: true,
    format: "esm",
    platform: "node",
    outfile: ssrBundle,
    jsx: "automatic",
    logLevel: "warning",
    alias: { "@": srcDir },
    plugins: [assetPlugin(), viteUrlSuffixPlugin()],
    // Browser-only, and only ever reached from a user's click on /ats-checker
    // (file drop → resume-extract; Share → share-card). All three are imported
    // dynamically, so leaving them external means esbuild neither bundles nor
    // executes them here — the server render simply never takes those code paths.
    external: ["pdfjs-dist", "mammoth", "html2pdf.js"],
    // react-dom/server is CommonJS and calls require("util"). Bundling CJS into an
    // ESM output leaves a bare `require`, which ESM has no definition for
    // ("Dynamic require of util is not supported"). Re-create it from import.meta.
    banner: {
      js: 'import { createRequire as __cr } from "node:module"; const require = __cr(import.meta.url);',
    },
    define: {
      "process.env.NODE_ENV": '"production"',
      "import.meta.env": JSON.stringify({
        MODE: "production",
        DEV: false,
        PROD: true,
        VITE_API_URL: "/api",
      }),
    },
  });
  ({ renderPage } = await import(pathToFileURL(ssrBundle).href));
} catch (error) {
  console.warn(`[prerender] ⚠ React SSR bundle failed — marketing pages will ship as the SPA shell (invisible to AI crawlers).\n  ${error.message}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Page assembly
// ─────────────────────────────────────────────────────────────────────────────
const escapeAttr = (value) =>
  String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");

/**
 * index.html ships site-wide default meta. Strip it before injecting per-page
 * meta, or every page ends up with TWO <link rel="canonical"> tags — and Google
 * resolves conflicting canonicals by ignoring both.
 */
function stripDefaultMeta(html) {
  return html
    .replace(/\s*<meta\s+name="description"[\s\S]*?\/>/gi, "")
    .replace(/\s*<link\s+rel="canonical"[^>]*>/gi, "")
    .replace(/\s*<meta\s+property="og:[\s\S]*?\/>/gi, "")
    .replace(/\s*<meta\s+name="twitter:[\s\S]*?\/>/gi, "");
}

function buildPage({ title, description, path, jsonLd, bodyHtml, article }) {
  const url = `${SITE_URL}${path}`;
  const head = [
    `<meta name="description" content="${escapeAttr(description)}" />`,
    `<link rel="canonical" href="${escapeAttr(url)}" />`,
    `<meta property="og:type" content="${article ? "article" : "website"}" />`,
    `<meta property="og:title" content="${escapeAttr(title)}" />`,
    `<meta property="og:description" content="${escapeAttr(description)}" />`,
    `<meta property="og:url" content="${escapeAttr(url)}" />`,
    `<meta property="og:site_name" content="Jobsynk AI" />`,
    `<meta property="og:image" content="${SITE_URL}/og-image.png" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeAttr(title)}" />`,
    `<meta name="twitter:description" content="${escapeAttr(description)}" />`,
    `<meta name="twitter:image" content="${SITE_URL}/og-image.png" />`,
    article ? `<meta property="article:published_time" content="${article.publishedAt}" />` : "",
    article ? `<meta property="article:modified_time" content="${article.updatedAt}" />` : "",
    article ? `<meta name="author" content="${escapeAttr(article.author.name)}" />` : "",
    `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`,
  ]
    .filter(Boolean)
    .join("\n    ");

  return stripDefaultMeta(shell)
    .replace(/<title>.*?<\/title>/, `<title>${escapeAttr(title)}</title>\n    ${head}`)
    .replace('<div id="root"></div>', `<div id="root">${bodyHtml}</div>`);
}

function emit(path, html) {
  const dir = path === "/" ? distDir : resolve(distDir, path.replace(/^\//, ""));
  mkdirSync(dir, { recursive: true });
  writeFileSync(resolve(dir, "index.html"), html, "utf8");
}

/** Words a crawler would actually read — scripts and tags stripped. */
const visibleWords = (html) =>
  html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;

const report = [];

// ─────────────────────────────────────────────────────────────────────────────
// 5. Marketing pages (React SSR)
// ─────────────────────────────────────────────────────────────────────────────
const MARKETING = {
  "/": {
    title: "Jobsynk AI — AI Resume Builder, ATS-Friendly Templates & Cover Letters",
    description:
      "Build an ATS-friendly resume free, tailor it to any job description, and generate cover letters, interview answers and recruiter emails with AI.",
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@graph": [organizationSchema(), websiteSchema(), softwareApplicationSchema()],
      },
    ],
  },
  "/ats-checker": {
    title: "Free ATS Resume Checker — No Signup | Jobsynk",
    description:
      "Paste your resume and get an instant parse-readiness score plus a named list of what would break an applicant tracking system. Free, no account, nothing uploaded.",
    // This graph is emitted by the page's own useSeo() too — keep the two in
    // sync, or a crawler and a browser see different structured data. The FAQ
    // half is shared code already (faqPageSchema + ATS_CHECKER_FAQ, same calls
    // in ats-checker.tsx); the SoftwareApplication node is still duplicated.
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@graph": [
          organizationSchema(),
          {
            "@type": "SoftwareApplication",
            name: "Jobsynk Free ATS Resume Checker",
            applicationCategory: "BusinessApplication",
            operatingSystem: "Web",
            url: `${SITE_URL}/ats-checker`,
            description:
              "Free browser-based resume parse-readiness checker. No account required and no upload — the analysis runs entirely on the client.",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          },
          faqPageSchema(ATS_CHECKER_FAQ),
        ],
      },
    ],
  },
  "/pricing": {
    title: "Pricing — Jobsynk AI",
    description:
      "Simple plans for the length of your job search. Free resume builder, paid plans unlock AI tailoring, cover letters and every template.",
    jsonLd: [
      { "@context": "https://schema.org", "@graph": [organizationSchema(), softwareApplicationSchema()] },
    ],
  },
  "/faq": {
    title: "FAQ — Jobsynk AI",
    description:
      "Answers about building, tailoring, managing and downloading your resume with Jobsynk AI.",
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@graph": [
          organizationSchema(),
          faqPageSchema(
            FAQ_PAGE_ITEMS.map((item) => ({ q: item.question, a: item.answer })),
            "/faq"
          ),
        ],
      },
    ],
  },
  "/enterprise": {
    title: "Enterprise — Jobsynk AI",
    description: "Jobsynk AI for teams, bootcamps and university career centres.",
    jsonLd: [{ "@context": "https://schema.org", "@graph": [organizationSchema()] }],
  },
  "/security": {
    title: "Security — Jobsynk AI",
    description: "How Jobsynk AI protects your resume data.",
    jsonLd: [{ "@context": "https://schema.org", "@graph": [organizationSchema()] }],
  },
};

if (renderPage) {
  for (const [path, meta] of Object.entries(MARKETING)) {
    try {
      const bodyHtml = renderPage(path);
      const html = buildPage({ ...meta, path, bodyHtml });
      emit(path, html);
      report.push([path, visibleWords(html)]);
    } catch (error) {
      // Loud, but non-fatal. Shipping the SPA shell for one page is bad; failing
      // the whole deploy over it is worse.
      console.warn(`[prerender] ⚠ ${path} failed to server-render — shipping SPA shell.\n  ${error.message}`);
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. Blog (data-rendered)
// ─────────────────────────────────────────────────────────────────────────────
function renderArticle(post) {
  const tags = post.tags
    .map(
      (tag) =>
        `<span class="rounded-full bg-[var(--accent-soft)] px-2.5 py-1 text-[11px] font-medium text-[var(--accent-text)]">${tag}</span>`
    )
    .join("");

  const updated =
    post.updatedAt !== post.publishedAt
      ? ` · Updated <time datetime="${post.updatedAt}">${formatDate(post.updatedAt)}</time>`
      : "";

  return `<div class="min-h-svh bg-[var(--app-bg)] text-[var(--app-fg)]">
  <main>
    <article class="mx-auto max-w-3xl px-6 pb-20 pt-10 sm:pt-14">
      <nav aria-label="Breadcrumb">
        <a href="/blog" class="inline-flex items-center gap-2 text-xs font-medium text-[var(--app-fg-soft)] transition-colors hover:text-[var(--accent-text)]">All articles</a>
      </nav>
      <header class="mt-8">
        <div class="flex flex-wrap gap-2">${tags}</div>
        <h1 class="mt-5 font-display text-3xl font-light leading-tight tracking-tight text-[var(--app-fg)] sm:text-[42px] sm:leading-[1.15]">${post.title}</h1>
        <p class="mt-5 text-base leading-8 text-[var(--app-fg-muted)] sm:text-lg">${post.excerpt}</p>
        <div class="mt-7 border-t border-[var(--app-border)] pt-6">
          <div class="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[var(--app-fg-soft)]">
            <span class="text-[var(--app-fg-muted)]">${post.author.name}</span>
            <span aria-hidden="true">·</span>
            <time datetime="${post.publishedAt}">${formatDate(post.publishedAt)}</time>
            <span aria-hidden="true">·</span>
            <span>${post.readingMinutes} min read</span>${updated}
          </div>
        </div>
      </header>
      <div class="mt-10 overflow-hidden rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-5 sm:p-8">
        <div class="aspect-[5/3] w-full">${renderArt(post.hero, post.tone)}</div>
      </div>
      <div class="mt-12">
        ${renderTocHtml(post)}
        ${renderPostBodyHtml(post)}
        ${renderPostFaqHtml(post)}
      </div>
    </article>
  </main>
</div>`;
}

function renderBlogIndex(posts) {
  const cards = posts
    .map(
      (post) => `<article class="group relative overflow-hidden rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)]">
      <div class="p-4">${renderArt(post.hero, post.tone)}</div>
      <div class="px-6 pb-6">
        <h2 class="mt-4 font-display font-light tracking-tight text-[var(--app-fg)] text-lg">
          <a href="/blog/${post.slug}">${post.title}</a>
        </h2>
        <p class="mt-3 leading-7 text-[var(--app-fg-muted)] text-sm">${post.excerpt}</p>
        <div class="mt-5 flex items-center gap-3 text-xs text-[var(--app-fg-soft)]">
          <time datetime="${post.publishedAt}">${formatDate(post.publishedAt)}</time>
          <span aria-hidden="true">·</span>
          <span>${post.readingMinutes} min read</span>
        </div>
      </div>
    </article>`
    )
    .join("\n");

  return `<div class="min-h-svh bg-[var(--app-bg)] text-[var(--app-fg)]">
  <main>
    <section class="relative overflow-hidden px-6 pb-12 pt-14 text-center sm:pt-20">
      <div class="relative mx-auto max-w-3xl">
        <h1 class="font-display text-4xl font-light tracking-tight text-[var(--app-fg)] sm:text-5xl">The Jobsynk Blog</h1>
        <p class="mx-auto mt-5 max-w-2xl text-sm leading-7 text-[var(--app-fg-muted)] sm:text-base">No recycled myths, no invented statistics. Just what actually happens to your resume after you hit apply — and what to do about it.</p>
      </div>
    </section>
    <section class="mx-auto max-w-[1100px] px-6 pb-24">
      <div class="grid grid-cols-1 gap-5 md:grid-cols-2">
${cards}
      </div>
    </section>
  </main>
</div>`;
}

{
  const html = buildPage({
    title: "The Jobsynk Blog — Resume, ATS & Job Search Guides",
    description:
      "Evidence-led guides on ATS formatting, tailoring your resume to a job description, keywords that actually matter, and using AI without sounding like AI.",
    path: "/blog",
    jsonLd: blogIndexSchema(POSTS_BY_DATE),
    bodyHtml: renderBlogIndex(POSTS_BY_DATE),
  });
  emit("/blog", html);
  report.push(["/blog", visibleWords(html)]);
}

for (const post of POSTS_BY_DATE) {
  const html = buildPage({
    title: `${post.seoTitle} | Jobsynk`,
    description: post.description,
    path: `/blog/${post.slug}`,
    jsonLd: postSchema(post),
    bodyHtml: renderArticle(post),
    article: post,
  });
  emit(`/blog/${post.slug}`, html);
  report.push([`/blog/${post.slug}`, visibleWords(html), countWords(post)]);
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. sitemap.xml — PUBLIC routes only. A crawler can never get past the login
//    wall, so listing authenticated pages just burns crawl budget.
// ─────────────────────────────────────────────────────────────────────────────
const STATIC_ROUTES = [
  { path: "/", priority: "1.0", changefreq: "weekly" },
  { path: "/ats-checker", priority: "0.9", changefreq: "monthly" },
  { path: "/pricing", priority: "0.9", changefreq: "monthly" },
  { path: "/blog", priority: "0.9", changefreq: "weekly" },
  { path: "/faq", priority: "0.6", changefreq: "monthly" },
  { path: "/enterprise", priority: "0.5", changefreq: "monthly" },
  { path: "/security", priority: "0.3", changefreq: "yearly" },
  { path: "/privacy", priority: "0.2", changefreq: "yearly" },
  { path: "/terms", priority: "0.2", changefreq: "yearly" },
  { path: "/cookie-policy", priority: "0.2", changefreq: "yearly" },
];

const latest = POSTS_BY_DATE.reduce(
  (acc, post) => (post.updatedAt > acc ? post.updatedAt : acc),
  POSTS_BY_DATE[0].updatedAt
);

const urls = [
  ...STATIC_ROUTES.map(
    (r) =>
      `  <url>\n    <loc>${SITE_URL}${r.path}</loc>\n    <lastmod>${latest}</lastmod>\n    <changefreq>${r.changefreq}</changefreq>\n    <priority>${r.priority}</priority>\n  </url>`
  ),
  ...POSTS_BY_DATE.map(
    (p) =>
      `  <url>\n    <loc>${SITE_URL}/blog/${p.slug}</loc>\n    <lastmod>${p.updatedAt}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>`
  ),
].join("\n");

writeFileSync(
  resolve(distDir, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
  "utf8"
);

// ─────────────────────────────────────────────────────────────────────────────
// 8. robots.txt
//
// GPTBot and OAI-SearchBot are DIFFERENT bots: GPTBot feeds the training corpus,
// OAI-SearchBot feeds ChatGPT Search retrieval. Blocking the second is what removes
// you from ChatGPT's *recommendations* — the one that actually matters.
//
// ⚠ robots.txt can be moot: Cloudflare now enables "Block AI bots" BY DEFAULT on
// new domains, and that runs at the edge before robots.txt is ever read.
//   Verify:  curl -I -A GPTBot https://jobsynk.co/   → want 200, not 403.
// ─────────────────────────────────────────────────────────────────────────────
writeFileSync(
  resolve(distDir, "robots.txt"),
  `# Search engines
User-agent: *
Allow: /
Disallow: /dashboard
Disallow: /account
Disallow: /my-resumes
Disallow: /resumes
Disallow: /subscribe
Disallow: /success

# AI answer engines — explicitly allowed. These drive product recommendations.
User-agent: GPTBot
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Claude-SearchBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: Applebot-Extended
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`,
  "utf8"
);

// ─────────────────────────────────────────────────────────────────────────────
// 9. llms.txt
//
// Honest expectation: Google (John Mueller) has said no Google system reads this,
// and there is NO verifiable confirmation that OpenAI, Anthropic or Perplexity
// consume it either. Cost is five minutes; expected value is ~zero. We ship it so
// nobody can sell us an "llms.txt strategy". Do not build on it.
// ─────────────────────────────────────────────────────────────────────────────
writeFileSync(
  resolve(distDir, "llms.txt"),
  `# Jobsynk AI

> AI resume builder. Free ATS-friendly resume builder; paid plans add job-description tailoring, AI cover letters, interview Q&A preparation and recruiter outreach emails.

Jobsynk is a web app for job seekers. The resume builder and the Classic Professional template are free. Paid plans unlock every template plus three AI features: cover letter generation, interview question preparation, and HR outreach email drafting.

## Free tools

- [ATS Resume Checker](${SITE_URL}/ats-checker): Paste your resume, get an ATS score and a named list of what would break a parser. No signup.

## Guides

${POSTS_BY_DATE.map((p) => `- [${p.title}](${SITE_URL}/blog/${p.slug}): ${p.description}`).join("\n")}

## Product

- [Pricing](${SITE_URL}/pricing)
- [FAQ](${SITE_URL}/faq)
`,
  "utf8"
);

// ─── Cleanup + report ────────────────────────────────────────────────────────
rmSync(contentBundle, { force: true });
rmSync(contentEntry, { force: true });
rmSync(ssrBundle, { force: true });

console.log("\n[prerender] crawler-visible words per page (0 = still invisible to AI crawlers):");
for (const [path, words, body] of report) {
  console.log(
    `  ${path.padEnd(46)} ${String(words).padStart(5)} words${body ? `  (body ${body})` : ""}`
  );
}
console.log(
  `\n[prerender] ${report.length} static pages + sitemap.xml + robots.txt + llms.txt -> dist/\n`
);
