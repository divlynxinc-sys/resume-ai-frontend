import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const { outputFiles: [bundle] } = await build({
  entryPoints: [fileURLToPath(new URL("../src/components/modal/resume-builder.helpers.ts", import.meta.url))],
  bundle: true,
  format: "esm",
  write: false,
});
const { blankResume, normalizeExperienceBullets, resumeDataToPlainText, toTemplateInput } =
  await import(`data:text/javascript;base64,${Buffer.from(bundle.contents).toString("base64")}`);

const raw = ["Built the payment  API ", "", "Led a team\r", "  "];
const cleaned = ["Built the payment  API", "Led a team"];
const resume = {
  ...blankResume,
  experiences: [
    { role: "Engineer", company: "Fixture", bullets: raw },
    { role: "", company: "", bullets: [" ", ""] },
  ],
};

assert.deepEqual(normalizeExperienceBullets(raw), cleaned);
assert.deepEqual(toTemplateInput(resume).resume.experiences.map((item) => item.bullets), [cleaned]);
assert.deepEqual(resumeDataToPlainText(resume).split("\n").filter((line) => line.startsWith("• ")),
  cleaned.map((line) => `• ${line}`));
assert.deepEqual(raw, ["Built the payment  API ", "", "Led a team\r", "  "]);
console.log("Experience highlights preserve raw draft input and normalize export bullets.");
