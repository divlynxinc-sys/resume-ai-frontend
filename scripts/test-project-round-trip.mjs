import assert from "node:assert/strict";
import { build } from "esbuild";
import { fileURLToPath } from "node:url";

const { outputFiles: [bundle] } = await build({
  stdin: {
    contents: [
      'export * from "./src/components/modal/resume-builder.helpers";',
      'export { resumeContentToTemplateInput } from "./src/lib/resume-export";',
    ].join("\n"),
    resolveDir: fileURLToPath(new URL("../", import.meta.url)),
  },
  define: { "import.meta.env": "{}" },
  bundle: true,
  format: "esm",
  write: false,
});
const { blankResume, mapContentToLocal, projectSectionsToApi, resumeContentToTemplateInput, toTemplateInput } =
  await import("data:text/javascript;base64," + Buffer.from(bundle.contents).toString("base64"));

const section = { title: "Portfolio Website", content: "• Published a portfolio",
  link: "https://example.com/work", linkLabel: "View work" };
const core = { info: {}, experience: [], education: [], summary: "", skills: [], job_description: {} };
const legacy = { ...core, custom: { sections: [section], projects: [] } };
assert.deepEqual(mapContentToLocal(legacy, blankResume).customSections, [section]);

const saved = projectSectionsToApi([
  section,
  { title: "", content: "", link: "https://example.com/link-only" },
  { title: " ", content: " " },
  { title: section.title, content: "", link: "https://example.com/other" },
]);
assert.equal(saved.projects.length, 3);
const content = { ...core, custom: saved };
const builder = toTemplateInput(mapContentToLocal(content, blankResume)).resume.projects;
const download = resumeContentToTemplateInput(content).resume.projects;
assert.deepEqual(download, builder);
assert.deepEqual(download.map((item) => item.link.url),
  ["https://example.com/work", "https://example.com/link-only", "https://example.com/other"]);
assert.deepEqual(download[0].bullets, ["Published a portfolio"]);

const oldMirror = { title: section.title, link: { url: section.link, label: section.linkLabel }, bullets: ["Extra detail"] };
const merged = resumeContentToTemplateInput({ ...core, custom: { sections: [section], projects: [oldMirror] } });
assert.deepEqual(merged.resume.projects[0].bullets, ["Published a portfolio", "Extra detail"]);
assert.equal(merged.resume.projects.length, 1);

const cleared = { ...section, link: "", linkLabel: "" };
const reopened = mapContentToLocal({ ...core, custom: { sections: [cleared], projects: [oldMirror] } }, blankResume);
assert.equal(reopened.customSections[0].link, "");
assert.equal(toTemplateInput(reopened).resume.projects[0].link, undefined);
assert.equal(reopened.customSections.length, 1);

const legacyContentLink = resumeContentToTemplateInput({ ...core, custom: { sections: [
  { title: "Demo", content: "github.com/example/demo\nOne detail" },
] } });
assert.deepEqual(legacyContentLink.resume.projects[0], {
  title: "Demo", link: { url: "https://github.com/example/demo", label: undefined }, bullets: ["One detail"],
});
console.log("Project exports and the editor share old and new project data without duplicating mirrors.");
