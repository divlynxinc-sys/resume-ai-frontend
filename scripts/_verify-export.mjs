// Verification harness for the export-pipeline fix.
// Renders every template with an INFLATED (multi-page) profile so we can confirm
// pagination, then writes HTML to scripts/output/_verify/<slug>.html for the
// backend Chromium renderer to turn into PDFs.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, resolve } from 'node:path';
import { build } from 'esbuild';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const indexPath = resolve(projectRoot, 'src/lib/resume-templates/index.ts');
const fixturePath = resolve(__dirname, 'fixtures/reference-resume.json');
const outDir = resolve(__dirname, 'output/_verify');
if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

const indexBundle = resolve(__dirname, '.verify-index-bundle.mjs');
await build({ entryPoints: [indexPath], bundle: true, format: 'esm',
  platform: 'neutral', target: 'node18', logLevel: 'silent', outfile: indexBundle });
const { TEMPLATES, renderTemplate } = await import(pathToFileURL(indexBundle).href);

const fixture = JSON.parse(readFileSync(fixturePath, 'utf8'));
const data = JSON.parse(JSON.stringify(fixture, (_k, v) => (v === null ? undefined : v)));
delete data._doc;

// --- Inflate to force a 2-3 page overflow, and plant the "November" date that
// the original raster PDFs mangled into "N - vember", plus a project link. ---
const baseExp = data.resume.experiences[0];
data.resume.experiences = [];
const companies = ['Northwind Studio', 'Lumen Health', 'FAIR (Football and AI Research)', 'MicroAgility APAC', 'Helios Labs'];
for (let i = 0; i < companies.length; i++) {
  data.resume.experiences.push({
    role: 'Associate Software Engineer',
    company: companies[i],
    location: ['Remote', 'Berlin, Germany', 'London — UK', 'Islamabad, Pakistan', 'Austin, TX'][i],
    startDate: i === 2 ? '2024-11' : ['2025-12', '2025-06', '2024-11', '2025-06', '2023-01'][i], // FAIR = November 2024
    endDate: i === 0 ? undefined : ['', '2025-12', '2025-04', '2025-12', '2024-01'][i] || undefined,
    bullets: baseExp.bullets.concat(baseExp.bullets).slice(0, 6),
  });
}
data.resume.projects = [
  { title: 'Resume AI Chatbot', link: { url: 'https://github.com/avery/resume-chatbot', label: 'Chatbot — GitHub' },
    bullets: ['Built a Retrieval-Augmented chatbot over resume data', 'Integrated an AI-driven real-time customization engine, applying ML concepts to a production-style interactive system'] },
  { title: 'Vector Search Service', link: 'https://github.com/avery/vector-search',
    bullets: ['Designed a low-latency vector search API', 'Served 10,000+ queries/day'] },
];

const slugs = Object.keys(TEMPLATES);
for (const slug of slugs) {
  const html = renderTemplate(slug, data);
  writeFileSync(resolve(outDir, `${slug}.html`), html, 'utf8');
  console.log(`wrote ${slug}.html  (${html.length} bytes)`);
}
console.log('\nOutput dir:', outDir);
