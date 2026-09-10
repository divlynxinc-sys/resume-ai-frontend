/**
 * Proctoring logic checks for AI Interviews (`npm run proctor:test`).
 *
 * Runs `scripts/proctor-checks.ts` — the gaze maths, the debounce policy and the
 * one-warning-then-fail rule — in node against stubbed DOM globals. No browser,
 * no camera, no backend. The MediaPipe runtime is never loaded: `gaze.ts` imports
 * it dynamically and only `analyseFaces` (pure) is exercised here.
 */
import { build } from "esbuild";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { rmSync } from "node:fs";
import { createRequire } from "node:module";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const outfile = resolve(here, "output", "proctor-checks.cjs");

await build({
  entryPoints: [resolve(here, "proctor-checks.ts")],
  bundle: true,
  platform: "node",
  format: "cjs",
  target: "node20",
  define: { "import.meta.env": "{}" },
  alias: { "@": resolve(root, "src") },
  outfile,
  logLevel: "warning",
});

try {
  createRequire(import.meta.url)(outfile);
} finally {
  rmSync(outfile, { force: true });
}
