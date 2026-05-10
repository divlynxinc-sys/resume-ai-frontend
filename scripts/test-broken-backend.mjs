// Regression test: simulate the user's ACTUAL broken backend response,
// where the AI optimizer baked all project content into the LAST experience's
// `description` field and dropped customSections + skillCategories. The
// sanitizer in mapContentToLocal should detect the "PROJECT" marker and
// re-extract projects.

import { writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { build } from 'esbuild';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const tplPath = resolve(projectRoot, 'src/lib/resume-templates/modern-minimal.ts');
const helpersPath = resolve(projectRoot, 'src/components/modal/resume-builder.helpers.ts');
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
const { mapContentToLocal, toTemplateInput } = await import(pathToFileURL(helpersBundle).href);

const STUB_EMPTY = {
  name: '', email: '', phone: '', location: '', linkedin: '', portfolio: '',
  experiences: [], education: [], skills: [], summary: '',
  job: { title: '', company: '', location: '', description: '' },
  customSections: [],
};

// Mirrors what the AI optimizer produces — broken shape from the user's PDF.
const BROKEN_BACKEND = {
  info: {
    full_name: 'Abdullah Tahir',
    email: 'ababdullah216@gmail.com',
    phone: '+923187070410',
    linkedin_url: '',
    portfolio_url: 'https://github.com/ABAbdulah',
  },
  summary:
    'Software Engineer with production experience building and deploying AI systems, fine-tuned Llama 3 with RAG, vector databases, and FastAPI inference. Full-stack background in Node.js/Python, React/TypeScript, and Azure, with AI-integrated features delivered at scale to 32,000+ users. Open to remote AI SWE roles with Australian teams.',
  experience: [
    {
      role: 'Associate Software Engineer', company: 'Beaj', location: '',
      start_date: '2025-12', end_date: '',
      description:
        'Shipped a full CMS (React/TypeScript) for managing 3,428 learning activities across 57 courses, including a detailed editor, completeness heatmap, and filtered export pipeline\nDesigned a unified Activity CRUD REST API handling 21 WhatsApp activity types (MCQ, speaking, conversational, media) with multi-file upload\nBuilt a Google Drive to Azure Blob sync service using BullMQ background workers, automating media management at scale\nDeveloped a bulk student enrollment tool (CSV preview + batch assignment) serving a 32,000+ user base\nImplemented a Dropout Risk dashboard segmenting learners into Critical / At Risk / Watch / On Track, enabling data-driven retention actions\nRefactored WhatsApp message delivery across 20+ flow files, centralizing queue pacing via BullMQ, improving reliability across 74,000+ messages',
    },
    {
      role: 'Associate Software Engineer', company: 'MicroAgility APAC',
      location: 'Islamabad, Pakistan',
      start_date: '2025-06', end_date: '2025-12',
      description:
        'Built and delivered client-facing portals using React/TypeScript, Tailwind CSS, and ShadCN, translating design specs into fully responsive, production-ready UIs across multiple client projects\nIntegrated RESTful APIs end-to-end with Zod validation schemas, enforcing data integrity across all data-entry flows',
    },
    {
      role: 'Software Engineer Intern', company: 'FAIR (Football and AI Research)',
      location: 'London, UK',
      start_date: '2024-11', end_date: '2025-04',
      description:
        // ⚠ Real malformed shape from the user's PDF (11):
        //   - Long bullet split at wrap point → "beyond the base model's capability" on its own line
        //   - Subtitle + URL on one line → "Final Year Project - FAST NUCES ISB• github.com/..."
        'Migrated 2GB+ of player and match data across 5 major football leagues in MongoDB with zero downtime, including schema normalization and integrity validation\nScraped, cleaned, and mapped structured data for 10,000+ players from a third-party platform to internal API models, enabling downstream analytics features\nPROJECT\nSerenityBot - Chatbot\ngithub.com/ABAbdulah/mental-health-companion.git\nFine-tuned Llama 3 on a HuggingFace mental health dataset with a custom RAG pipeline, enabling domain-specific context-aware responses\nbeyond the base model\'s capability\nBuilt full-stack platform: React, FastAPI inference server, vector database for semantic retrieval, and conversation analytics\nARCH360 – AR-powered Visualization Platform (Unity, C#, ARCore/ARKit)\nFinal Year Project - FAST NUCES ISB• github.com/ABAbdulah/ARch360.git\nBuilt and shipped a cross-platform AR app in Unity (C#) for Android/iOS as a solo final year project at FAST NUCES\nIntegrated an AI-driven real-time customization engine, applying ML concepts to a production-style interactive system',
    },
  ],
  education: [{
    school: 'National University of Computer and Emerging Sciences - FAST',
    degree: "Bachelor's in Computer Science", field_of_study: 'Computer Science',
    start_date: '2021', end_date: '2025', location: 'Islamabad, Pakistan',
  }],
  skills: [
    'JavaScript (ES6+)', 'TypeScript', 'Python', 'SQL',
    'Node.js', 'Express.js', 'FastAPI', 'REST APIs', 'BullMQ', 'Sequelize', 'Microservices',
    'React.js', 'Next.js', 'Tailwind CSS', 'ShadCN', 'Webpack/Vite', 'HTML5/CSS3',
    'PostgreSQL', 'MongoDB', 'Redis', 'MySQL', 'Vector Databases', 'Azure', 'AWS (basic)', 'Docker', 'GitHub Actions', 'Linux',
    'RAG', 'Prompt Engineering', 'Fine-tuning (Llama 3)', 'LangChain', 'Pandas', 'Agile/Scrum', 'Jest/Unit Testing',
  ],
  job_description: { job_title: '', company: '', location: '', description: '' },
  custom: {},  // empty — AI dropped projects + skillCategories
};

console.log('Running BROKEN backend shape through full pipeline (sanitizer should heal it)...\n');

const local = mapContentToLocal(BROKEN_BACKEND, STUB_EMPTY);
const tplInput = toTemplateInput(local);
const html = modernMinimal(tplInput);

const fairExp = local.experiences.find(e => /FAIR/.test(e.company));

const checks = [
  { name: 'FAIR experience kept ONLY its 2 real bullets',
    ok: fairExp?.bullets.length === 2 },
  { name: 'FAIR bullets do NOT contain "PROJECT" marker',
    ok: !fairExp?.bullets.some(b => /^PROJECTS?$/i.test(b)) },
  { name: 'FAIR bullets do NOT contain "SerenityBot"',
    ok: !fairExp?.bullets.some(b => b.includes('SerenityBot')) },
  { name: 'customSections has EXACTLY 2 projects (no spurious continuations)',
    ok: local.customSections.length === 2 },
  { name: 'First extracted project is "SerenityBot - Chatbot"',
    ok: local.customSections[0]?.title === 'SerenityBot - Chatbot' },
  { name: 'Second extracted project is ARCH360 (no "Final Year Project" spurious title)',
    ok: local.customSections[1]?.title?.startsWith('ARCH360') &&
        !local.customSections[1]?.title?.startsWith('Final Year Project') },
  { name: 'Continuation "beyond the base model\'s capability" merged into previous bullet',
    ok: !!local.customSections[0]?.content?.includes("responses beyond the base model's capability") },
  { name: 'No project titled "beyond the base model\'s capability"',
    ok: !local.customSections.some(s => s.title?.startsWith('beyond')) },
  { name: 'No project titled "Final Year Project..."',
    ok: !local.customSections.some(s => s.title?.startsWith('Final Year Project')) },
  { name: 'ARCH360 link extracted from inline-URL line',
    ok: /class="proj-url"[^>]*>github\.com\/ABAbdulah\/ARch360\.git/.test(html) },
  { name: 'Project section header rendered in HTML',
    ok: /class="section-title">Project</.test(html) },
  { name: 'SerenityBot URL rendered as link',
    ok: /class="proj-url"[^>]*>github\.com\/ABAbdulah\/mental-health/.test(html) },
  { name: '"PROJECT" does NOT appear as <li> in HTML',
    ok: !/<li>\s*PROJECT\s*<\/li>/.test(html) },
  { name: '"SerenityBot" does NOT appear as <li> in HTML',
    ok: !/<li>SerenityBot/.test(html) },
];

let pass = 0, fail = 0;
for (const c of checks) {
  console.log(`${c.ok ? '✓' : '✗'} ${c.name}`);
  c.ok ? pass++ : fail++;
}
console.log(`\n${pass} passed, ${fail} failed\n`);

const htmlOut = resolve(outDir, 'broken-backend-output.html');
writeFileSync(htmlOut, html, 'utf8');
console.log(`HTML  → ${htmlOut}`);

const chromePaths = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
];
const chrome = chromePaths.find(p => existsSync(p));
if (chrome) {
  const pdfOut = resolve(outDir, 'broken-backend-output.pdf');
  const r = spawnSync(chrome, [
    '--headless=new', `--print-to-pdf=${pdfOut}`,
    '--no-pdf-header-footer', '--disable-gpu',
    '--virtual-time-budget=2000',
    pathToFileURL(htmlOut).href,
  ], { stdio: 'pipe', encoding: 'utf8' });
  if (r.status === 0 && existsSync(pdfOut)) console.log(`PDF   → ${pdfOut}`);
}

process.exit(fail > 0 ? 1 : 0);
