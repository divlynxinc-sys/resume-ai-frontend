// Renders the modern-minimal template against the canonical reference fixture
// (scripts/fixtures/reference-resume.json) and writes the HTML to
// scripts/output/preview-output.html so it can be opened in a browser
// (or printed to PDF) and compared side-by-side with the source PDF.
//
// Usage:    node scripts/render-template-preview.mjs
//   or:    npm run preview:template

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, resolve } from 'node:path';
import { build } from 'esbuild';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');

const tplPath     = resolve(projectRoot, 'src/lib/resume-templates/modern-minimal.ts');
const fixturePath = resolve(__dirname, 'fixtures/reference-resume.json');
const outPath     = resolve(__dirname, 'output/preview-output.html');
const bundlePath  = resolve(__dirname, '.preview-bundle.mjs');

await build({
  entryPoints: [tplPath],
  bundle: true,
  format: 'esm',
  platform: 'neutral',
  target: 'node18',
  outfile: bundlePath,
  logLevel: 'silent',
});

const { modernMinimal } = await import(pathToFileURL(bundlePath).href);

const fixture = JSON.parse(readFileSync(fixturePath, 'utf8'));
// Strip JSON null sentinels — template expects undefined for "Present"
const sample = JSON.parse(JSON.stringify(fixture, (_k, v) => (v === null ? undefined : v)));
delete sample._doc;

const html = modernMinimal(sample);
writeFileSync(outPath, html, 'utf8');
console.log(`✓ Wrote ${outPath}`);
console.log(`  Open it in a browser, then File → Print → Save as PDF`);
console.log(`  to compare side-by-side with scripts/fixtures/resume-template-reference.pdf`);
