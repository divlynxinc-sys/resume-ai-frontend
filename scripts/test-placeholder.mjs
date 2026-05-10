// Renders the empty-resume placeholder (John Doe / Lorem Ipsum) through the
// full pipeline, exactly as the running app shows the preview when no fields
// are filled. Outputs HTML + PDF to scripts/output/.

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { build } from 'esbuild';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const tplPath = resolve(projectRoot, 'src/lib/resume-templates/modern-minimal.ts');
const helpersPath = resolve(projectRoot, 'src/components/modal/resume-builder.helpers.ts');
const builderPath = resolve(projectRoot, 'src/components/modal/resume-builder.tsx');
const outDir = resolve(__dirname, 'output');
if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

const tplBundle = resolve(__dirname, '.tpl-bundle.mjs');
const helpersBundle = resolve(__dirname, '.helpers-bundle.mjs');
const baseBuildOpts = {
  bundle: true, format: 'esm', platform: 'neutral',
  target: 'node18', logLevel: 'silent',
};
const aliasPlugin = {
  name: 'tsalias',
  setup(b) {
    b.onResolve({ filter: /^@\// }, (args) => ({
      path: resolve(projectRoot, 'src', args.path.slice(2)) + '.ts',
    }));
  },
};

await build({ ...baseBuildOpts, entryPoints: [tplPath], outfile: tplBundle });
await build({ ...baseBuildOpts, entryPoints: [helpersPath], outfile: helpersBundle, plugins: [aliasPlugin] });

const { modernMinimal } = await import(pathToFileURL(tplBundle).href);
const { toTemplateInput } = await import(pathToFileURL(helpersBundle).href);

// emptyResume still lives in the .tsx (it depends on JSX-imported types).
// Pull it out via a regex over the source.
const builderSrc = readFileSync(builderPath, 'utf8');
const emptyResume = extractObjectLiteral(builderSrc, 'emptyResume');

console.log(`Rendering empty-resume placeholder (name: "${emptyResume.name}")`);

const html = modernMinimal(toTemplateInput(emptyResume));

const checks = [
  { name: 'Name is "John Doe"',                 ok: /<h1>John Doe</.test(html) },
  { name: 'Phone is the John Doe placeholder',  ok: /\(555\) 123-4567/.test(html) },
  { name: 'Summary starts with Lorem ipsum',    ok: /Lorem ipsum dolor sit amet/.test(html) },
  { name: 'Skill category "Cloud & DevOps"',    ok: /Cloud &amp; DevOps/.test(html) },
];
let pass = 0, fail = 0;
for (const c of checks) { console.log(`${c.ok ? '✓' : '✗'} ${c.name}`); c.ok ? pass++ : fail++; }
console.log(`\n${pass} passed, ${fail} failed\n`);

const htmlOut = resolve(outDir, 'placeholder-output.html');
writeFileSync(htmlOut, html, 'utf8');
console.log(`HTML  → ${htmlOut}`);

const chromePaths = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
];
const chrome = chromePaths.find(p => existsSync(p));
if (chrome) {
  const pdfOut = resolve(outDir, 'placeholder-output.pdf');
  const r = spawnSync(chrome, [
    '--headless=new', `--print-to-pdf=${pdfOut}`,
    '--no-pdf-header-footer', '--disable-gpu',
    '--virtual-time-budget=2000',
    pathToFileURL(htmlOut).href,
  ], { stdio: 'pipe', encoding: 'utf8' });
  if (r.status === 0 && existsSync(pdfOut)) console.log(`PDF   → ${pdfOut}`);
}

process.exit(fail > 0 ? 1 : 0);

function extractObjectLiteral(src, name) {
  const re = new RegExp(`const\\s+${name}\\s*:\\s*ResumeData\\s*=\\s*`);
  const m = src.match(re);
  if (!m) throw new Error(`couldn't find const ${name}`);
  let i = m.index + m[0].length;
  let depth = 0, started = false;
  const start = i;
  while (i < src.length) {
    const ch = src[i];
    if (ch === '{') { depth++; started = true; }
    else if (ch === '}') { depth--; if (started && depth === 0) {
      // eval the object literal in a JS context
      const literal = src.slice(start, i + 1);
      // eslint-disable-next-line no-new-func
      return new Function(`return (${literal});`)();
    } }
    i++;
  }
  throw new Error(`unterminated ${name}`);
}
