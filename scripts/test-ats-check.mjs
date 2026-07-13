// Harness for src/lib/ats-check.ts — the free /ats-checker analyser.
//
// The analyser is pure and has no React dependency, so it can be exercised
// directly in Node (same esbuild-bundle trick as scripts/render-template-preview.mjs).
//
// Usage:  npm run ats:test
//
// This is a behaviour check, not an assertion suite: it prints the report for a
// deliberately bad resume, a strong one, and a strong one against a job
// description, so you can eyeball that the checks fire where they should. It
// exits non-zero if the ordering invariant breaks (bad must score below strong).

import { build } from "esbuild";
import { rmSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");
const bundlePath = resolve(__dirname, ".ats-bundle.mjs");

await build({
  entryPoints: [resolve(projectRoot, "src/lib/ats-check.ts")],
  bundle: true,
  format: "esm",
  platform: "node",
  outfile: bundlePath,
  logLevel: "error",
});

const { analyzeResume } = await import(pathToFileURL(bundlePath).href);

const BAD = `My Journey
I am a hard worker and a team player with a proven track record.

What I Bring
- Responsible for managing the company's social media accounts.
- Helped with the website redesign project and worked on various tasks.
- I was involved in customer support and my duties included answering emails.
- Assisted with marketing campaigns and participated in team meetings, and I also
  contributed to a wide range of other initiatives across the business as needed on a
  regular and ongoing basis throughout my time working at the organisation in question.
`;

const GOOD = `Jane Okafor
jane.okafor@email.com | +1 (555) 234-9911 | Austin, TX

Summary
Backend engineer, 6 years, focused on payments and high-throughput APIs.

Experience
Senior Backend Engineer, Northstar Systems - Mar 2022 - Present
- Cut checkout drop-off from 34% to 21% in one quarter by rebuilding the payment step.
- Built the ledger service now handling ~40,000 transactions per week.
- Migrated 40 services to Kubernetes, reducing deploy time from 25 min to 4 min.

Backend Engineer, BrightWorks Studio - Jun 2019 - Feb 2022
- Reduced p99 API latency 6x by adding a read-through cache.
- Shipped an idempotency layer that eliminated 1,200 duplicate charges per month.

Education
BSc Computer Science, University of Texas, 2019

Skills
Python, Go, PostgreSQL, Kubernetes, Kafka, AWS, Terraform
`;

const JD = `We are hiring a Senior Backend Engineer to own our payments platform.
You will work on Kubernetes, Go, and PostgreSQL, building high-throughput APIs.
Experience with Kafka and idempotency in payments systems is required.
Terraform and AWS experience preferred. You will own PCI-scoped systems.`;

const scores = {};

for (const [name, text, jd] of [
  ["bad", BAD, ""],
  ["strong", GOOD, ""],
  ["strong+jd", GOOD, JD],
]) {
  const report = analyzeResume(text, jd);
  scores[name] = report.score;

  console.log(`\n${"=".repeat(70)}`);
  console.log(`${name.toUpperCase().padEnd(12)} score ${report.score}/100   (${report.wordCount} words)`);
  console.log("=".repeat(70));
  for (const check of report.checks) {
    console.log(`  [${check.status.toUpperCase().padEnd(4)}] ${check.label}`);
    console.log(`          ${check.detail}`);
  }
  if (report.keywords) {
    console.log(`  matched: ${report.keywords.matched.slice(0, 8).join(", ")}`);
    console.log(`  missing: ${report.keywords.missing.join(", ") || "(none)"}`);
  }
}

console.log(`\n${"=".repeat(70)}`);

const failures = [];
if (scores.bad >= scores.strong) failures.push("bad resume did not score below the strong one");
if (scores.bad > 45) failures.push(`bad resume scored ${scores.bad} — too generous`);
if (scores.strong < 75) failures.push(`strong resume scored ${scores.strong} — too harsh`);
if (analyzeResume("hi there") !== null) failures.push("too-short input should return null");

rmSync(bundlePath, { force: true });

if (failures.length) {
  console.error("FAILED:");
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}

console.log(`OK  bad=${scores.bad}  strong=${scores.strong}  strong+jd=${scores["strong+jd"]}`);
console.log("    short input -> null");
