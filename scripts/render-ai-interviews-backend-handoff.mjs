import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import puppeteer from "puppeteer-core";

const candidates = [
  process.env.CHROME_PATH,
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  `${process.env.LOCALAPPDATA}\\Google\\Chrome\\Application\\chrome.exe`,
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
].filter(Boolean);

const executablePath = candidates.find((item) => existsSync(item));
if (!executablePath) throw new Error("Chrome or Edge was not found. Set CHROME_PATH.");

const input = resolve("docs/ai-interviews-backend-handoff.html");
const output = resolve("docs/JobSynkAI-AI-Interviews-Backend-Handoff.pdf");
const userDataDir = mkdtempSync(resolve(tmpdir(), "jobsynk-pdf-"));
const browser = await puppeteer.launch({
  executablePath,
  headless: true,
  userDataDir,
  protocolTimeout: 120_000,
  timeout: 120_000,
  args: ["--no-sandbox", "--disable-gpu", "--disable-extensions", "--disable-background-networking"],
});
try {
  const page = await browser.newPage();
  await page.goto(pathToFileURL(input).href, { waitUntil: "networkidle0", timeout: 30_000 });
  await page.pdf({
    path: output,
    format: "A4",
    printBackground: true,
    preferCSSPageSize: true,
    displayHeaderFooter: true,
    headerTemplate: "<div></div>",
    footerTemplate: '<div style="width:100%;font:8px Arial;color:#8a8f9d;text-align:center"><span>JobSynkAI - AI Interviews Backend Handoff</span> &nbsp; | &nbsp; <span class="pageNumber"></span>/<span class="totalPages"></span></div>',
    margin: { top: "15mm", right: "14mm", bottom: "17mm", left: "14mm" },
  });
  console.log(output);
} finally {
  await browser.close();
  rmSync(userDataDir, { recursive: true, force: true });
}
