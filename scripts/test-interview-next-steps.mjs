// Browser smoke test with a free-plan fixture; no paid account or backend is used.
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import puppeteer from "puppeteer-core";
import { createServer } from "vite";

const chrome = [
  process.env.CHROME_PATH,
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  `${process.env.LOCALAPPDATA}\\Google\\Chrome\\Application\\chrome.exe`,
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
].find((path) => path && existsSync(path));
assert.ok(chrome, "Chrome or Edge is required; set CHROME_PATH.");

const scores = { relevance: 72, evidence: 51, structure: 66, role_alignment: 58, communication: 74 };
const session = {
  id: "smoke-report", status: "report_ready", interview_type: "general", role_title: "Frontend Developer",
  seniority: "entry", duration_minutes: 15, resume_id: 7, resume_title: "Frontend résumé",
  job_description: "Build accessible React interfaces", question_target: 1,
  questions: [{ id: "q1", prompt: "Tell me about a project", category: "experience" }],
  answers: [{ id: "a1", question_id: "q1", transcript: "I built an app", evaluation: {
    scores, evidence: "Needs a measurable outcome", worked: ["Clear example"],
    improvements: ["Name the result"], improved_outline: ["Set the context", "Describe your contribution", "Give the result"],
  } }],
  report: { overall_score: 63, scores, summary: "Add stronger evidence.", strengths: ["Clear delivery"],
    improvements: ["Quantify results"], action_plan: ["Add a measurable outcome to a project example"],
    generated_at: "2026-11-11T12:00:00Z" },
  transcript: [], error: null, ended_reason: null, credit_status: "charged",
  started_at: null, processing_started_at: null, completed_at: null,
  created_at: "2026-11-11T12:00:00Z", updated_at: "2026-11-11T12:00:00Z",
};

process.env.VITE_API_URL = "/api";
process.env.VITE_GOOGLE_CLIENT_ID = "";
const server = await createServer({ server: { host: "127.0.0.1", port: 0 } });
let browser;
try {
  await server.listen();
  const base = `http://127.0.0.1:${server.httpServer.address().port}`;
  browser = await puppeteer.launch({ executablePath: chrome, headless: true });
  const page = await browser.newPage();
  if (process.env.REPORT_VIEWPORT_WIDTH) await page.setViewport({ width: Number(process.env.REPORT_VIEWPORT_WIDTH), height: 900 });
  await page.evaluateOnNewDocument(() => localStorage.setItem("accessToken", "smoke-test-token"));
  await page.setRequestInterception(true);
  page.on("request", (request) => {
    const path = new URL(request.url()).pathname;
    if (!path.startsWith("/api/")) return request.continue();
    const body = path === "/api/profile/me"
      ? { id: "free-user", name: "Test User", email: "test@example.com", role: "user", credits_remaining: 0 }
      : path === "/api/settings/account/summary" ? { current_plan: null, credits_remaining: 0 }
      : path === "/api/interviews/smoke-report" ? session
      : path === "/api/interview-credits" ? { balance: 0, unlimited: false, packs: [], recent: [] }
      : {};
    request.respond({ status: 200, contentType: "application/json", body: JSON.stringify(body) });
  });

  await page.goto(`${base}/ai-interviews/smoke-report/report`, { waitUntil: "networkidle2" });
  await page.waitForSelector("#report-next-steps");
  if (process.env.REPORT_SCREENSHOT) await page.screenshot({ path: process.env.REPORT_SCREENSHOT, fullPage: true });
  assert.ok(await page.$('a[href="/resumes?id=7"]'), "Selected résumé link missing");
  assert.ok(await page.$('a[href$="#question-feedback"]'), "Answer feedback link missing");
  await page.click('a[href$="#question-feedback"]');
  assert.ok((await page.url()).endsWith("#question-feedback"));
  await page.click('a[href="/ats-checker"]');
  await page.waitForSelector("button");
  await page.evaluate(() => {
    const button = [...document.querySelectorAll("button")].find((item) => item.textContent?.includes("or paste the text instead"));
    button?.click();
  });
  await page.waitForSelector("#resume-text");
  await page.type("#resume-text", "Frontend developer with React project experience.");
  await page.waitForSelector("#jd-text");
  assert.equal(await page.$eval("#jd-text", (field) => field.value), session.job_description);
  assert.ok((await page.url()).endsWith("/ats-checker"));
  session.resume_id = null;
  await page.goto(`${base}/ai-interviews/smoke-report/report`, { waitUntil: "networkidle2" });
  await page.waitForSelector("#report-next-steps");
  assert.ok(await page.$('a[href="/my-resumes"]'), "Résumé-list fallback missing when no résumé was selected");
  console.log("Interview next steps and free ATS handoff passed.");
} finally {
  await browser?.close();
  await server.close();
}
