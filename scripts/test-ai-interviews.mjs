import { build } from "esbuild";
import { mkdir, rm } from "node:fs/promises";
import { pathToFileURL } from "node:url";

await mkdir(".tmp", { recursive: true });
const outfile = ".tmp/ai-interviews.test.mjs";
try {
  await build({ entryPoints: ["scripts/ai-interviews.test-entry.ts"], outfile, bundle: true, platform: "node", format: "esm", define: { "import.meta.env.DEV": "false", "import.meta.env.VITE_API_URL": '"/api"', "import.meta.env.VITE_INTERVIEW_API_MODE": '"mock"' }, logLevel: "silent" });
  await import(`${pathToFileURL(`${process.cwd()}/${outfile}`).href}?t=${Date.now()}`);
} finally {
  await rm(outfile, { force: true });
}
