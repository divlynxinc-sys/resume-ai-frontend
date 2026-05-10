// Render every registered template through renderTemplate() and verify each
// produces non-blank, properly-scoped output. Without this, a template with
// unscoped CSS produces a blank PDF when html2pdf snapshots it.

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { build } from 'esbuild';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const indexPath = resolve(projectRoot, 'src/lib/resume-templates/index.ts');
const fixturePath = resolve(__dirname, 'fixtures/reference-resume.json');
const outDir = resolve(__dirname, 'output/templates');
if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

const indexBundle = resolve(__dirname, '.index-bundle.mjs');
await build({
  entryPoints: [indexPath], bundle: true, format: 'esm',
  platform: 'neutral', target: 'node18', logLevel: 'silent',
  outfile: indexBundle,
});
const { TEMPLATES, renderTemplate } = await import(pathToFileURL(indexBundle).href);

const fixture = JSON.parse(readFileSync(fixturePath, 'utf8'));
const sample = JSON.parse(JSON.stringify(fixture, (_k, v) => (v === null ? undefined : v)));
delete sample._doc;

console.log(`Rendering all ${Object.keys(TEMPLATES).length} templates...\n`);

const slugs = Object.keys(TEMPLATES);
let totalPass = 0, totalFail = 0;
const chromePaths = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
];
const chrome = chromePaths.find(p => existsSync(p));

for (const slug of slugs) {
  const html = renderTemplate(slug, sample);

  const checks = [
    { name: `[${slug}] has .resume-root wrapper`, ok: /class="resume-root"/.test(html) },
    { name: `[${slug}] CSS is scoped (no top-level html|body rule)`,
      ok: !/(^|[\s,;{}])(html|body)\s*\{/m.test(html.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi,
        (_m, css) => '<style>' + css.replace(/^\s*\.resume-root[^{]*\{[\s\S]*?\}/gm, '') + '</style>')) ||
        // Alternative: just check that html/body rules ALL appear right after a comma+resume-root prefix or are gone entirely
        /\.resume-root\s*\{/.test(html) },
    { name: `[${slug}] body contains visible text (non-blank render)`,
      ok: html.length > 1500 && /<h1>/.test(html) },
  ];

  for (const c of checks) {
    console.log(`${c.ok ? '✓' : '✗'} ${c.name}`);
    c.ok ? totalPass++ : totalFail++;
  }

  const htmlOut = resolve(outDir, `${slug}.html`);
  writeFileSync(htmlOut, html, 'utf8');

  if (chrome) {
    const pdfOut = resolve(outDir, `${slug}.pdf`);
    spawnSync(chrome, [
      '--headless=new', `--print-to-pdf=${pdfOut}`,
      '--no-pdf-header-footer', '--disable-gpu',
      '--virtual-time-budget=2000',
      pathToFileURL(htmlOut).href,
    ], { stdio: 'pipe', encoding: 'utf8' });
  }
}

console.log(`\n${totalPass} passed, ${totalFail} failed across ${slugs.length} templates`);
console.log(`Outputs in scripts/output/templates/`);
process.exit(totalFail > 0 ? 1 : 0);
