// Horizontal-overflow smoke test: loads every route at a range of device widths
// and fails if any page's scrollable width exceeds the viewport (i.e. the page
// can be scrolled sideways on a phone), reporting the offending elements.
//
// Requires a dev server (npm run dev) and a local Chrome/Edge install.
//
// Usage:
//   npm run smoke:responsive
//   node scripts/smoke-responsive.mjs --routes /,/pricing --widths 430 --verbose
//
// Env: SMOKE_BASE_URL (default http://localhost:5173), CHROME_PATH (auto-detected).
import { existsSync } from "node:fs";
import puppeteer from "puppeteer-core";

const BASE = process.env.SMOKE_BASE_URL || "http://localhost:5173";

const BROWSER_CANDIDATES = [
  process.env.CHROME_PATH,
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  `${process.env.LOCALAPPDATA}\\Google\\Chrome\\Application\\chrome.exe`,
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "/usr/bin/google-chrome",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
].filter(Boolean);
const CHROME = BROWSER_CANDIDATES.find((p) => existsSync(p));
if (!CHROME) {
  console.error("No Chrome/Edge found. Set CHROME_PATH.");
  process.exit(2);
}

// Public surface, checked anonymously (includes /login and /signup, which
// bounce authenticated users away).
const PUBLIC_ROUTES = [
  "/", "/blog", "/blog/ats-resume-format", "/ats-checker", "/pricing",
  "/terms", "/privacy", "/cookie-policy", "/security",
  "/enterprise", "/faq", "/forgot-password", "/login", "/signup",
  "/definitely-not-a-page-404",
];
// Private routes, rendered via the dev-bypass token (no backend needed — pages
// mount their layouts with empty/error data, which is all this test measures).
const PRIVATE_ROUTES = [
  "/onboarding", "/dashboard", "/resumes", "/templates", "/tailoring",
  "/cover-letter", "/hr-email-drafts", "/qa-answers", "/subscribe", "/success",
  "/account", "/interview", "/ai-chat", "/my-resumes", "/user-details",
  "/user-profile", "/help-center", "/documentation", "/analytics",
  "/resume-generated", "/resume-comparison", "/pricing",
];
const DEFAULT_WIDTHS = [320, 360, 375, 390, 414, 430, 568, 768, 1024, 1440];

const args = process.argv.slice(2);
const argVal = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : null;
};
const VERBOSE = args.includes("--verbose");
const onlyRoutes = argVal("--routes")?.split(",");
const widths = (argVal("--widths")?.split(",").map(Number)) ?? DEFAULT_WIDTHS;

function measureInPage() {
  const doc = document.documentElement;
  const cw = doc.clientWidth;
  const sw = Math.max(doc.scrollWidth, document.body ? document.body.scrollWidth : 0);
  const overflow = sw - cw;
  const offenders = [];
  if (overflow > 1) {
    const clipsX = (el) => {
      const o = getComputedStyle(el).overflowX;
      return o === "hidden" || o === "clip" || o === "auto" || o === "scroll";
    };
    const isClipped = (el) => {
      let p = el.parentElement;
      while (p && p !== document.documentElement) {
        if (clipsX(p)) return true;
        p = p.parentElement;
      }
      return false;
    };
    for (const el of document.querySelectorAll("body *")) {
      const r = el.getBoundingClientRect();
      if (r.width === 0) continue;
      const st = getComputedStyle(el);
      if (st.position === "fixed") continue;
      if (r.right > cw + 1 && !isClipped(el)) {
        const cls = typeof el.className === "string"
          ? el.className.trim().split(/\s+/).slice(0, 8).join(".")
          : "";
        offenders.push({
          el: el.tagName.toLowerCase() + (cls ? "." + cls : ""),
          left: Math.round(r.left),
          right: Math.round(r.right),
          w: Math.round(r.width),
          text: (el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 50),
        });
      }
    }
    offenders.sort((a, b) => b.right - a.right);
  }
  return { cw, sw, overflow, offenders: offenders.slice(0, 15) };
}

async function checkRoute(page, route, width, authed) {
  await page.setViewport({ width, height: 900, deviceScaleFactor: 1 });
  try {
    await page.goto(BASE + route, { waitUntil: "networkidle2", timeout: 25000 });
  } catch {
    // dev-server module churn or a hanging request; measure what rendered
  }
  await new Promise((r) => setTimeout(r, 900));
  const finalPath = new URL(page.url()).pathname;
  const m = await page.evaluate(measureInPage);
  return { route, width, authed, finalPath, ...m };
}

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true });
const results = [];

async function runSet(routes, authed) {
  const context = await browser.createBrowserContext();
  const page = await context.newPage();
  if (authed) {
    await page.evaluateOnNewDocument(() => {
      localStorage.setItem("accessToken", "dev-bypass-token");
      localStorage.setItem("refreshToken", "dev-bypass-token");
    });
  }
  for (const route of routes) {
    for (const width of widths) {
      const res = await checkRoute(page, route, width, authed);
      results.push(res);
      const tag = `${authed ? "auth" : "anon"} ${res.route} @${res.width}`;
      if (res.overflow > 1) {
        console.log(`FAIL  ${tag}  overflow=${res.overflow}px (scroll ${res.sw} vs client ${res.cw})${res.finalPath !== route ? `  [landed on ${res.finalPath}]` : ""}`);
        for (const o of res.offenders.slice(0, VERBOSE ? 15 : 4)) {
          console.log(`      -> right=${o.right} w=${o.w} left=${o.left}  ${o.el}  "${o.text}"`);
        }
      } else if (VERBOSE) {
        console.log(`ok    ${tag}${res.finalPath !== route ? `  [landed on ${res.finalPath}]` : ""}`);
      }
    }
  }
  await context.close();
}

const anonRoutes = onlyRoutes ?? PUBLIC_ROUTES;
const authRoutes = onlyRoutes ? [] : PRIVATE_ROUTES;

await Promise.all([
  runSet(anonRoutes, false),
  authRoutes.length ? runSet(authRoutes, true) : Promise.resolve(),
]);

await browser.close();

const failures = results.filter((r) => r.overflow > 1);
console.log(`\n=== ${results.length} checks, ${failures.length} failures ===`);
const byRoute = {};
for (const f of failures) {
  const k = `${f.authed ? "auth" : "anon"} ${f.route}`;
  (byRoute[k] ??= []).push(`${f.width}(+${f.overflow})`);
}
for (const [k, v] of Object.entries(byRoute)) console.log(`  ${k}: ${v.join(" ")}`);
process.exit(failures.length ? 1 : 0);
