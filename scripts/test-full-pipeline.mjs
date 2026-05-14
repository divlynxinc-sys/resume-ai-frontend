// Runs the COMPLETE pipeline that the running app uses when downloading a PDF:
//   backend ResumeContent  →  mapContentToLocal  →  toTemplateInput  →  modernMinimal
//
// Outputs HTML + PDF to scripts/output/. Imports helpers directly from the
// shared module — no regex extraction needed.

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
// Resolve the @/ alias used by the helpers module
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

// emptyResume is owned by the .tsx, but mapContentToLocal needs one to fall
// back to. For a fully-populated test we don't fall back, so a minimal stub
// is enough.
const STUB_EMPTY = {
  name: '', email: '', phone: '', location: '', linkedin: '', portfolio: '',
  experiences: [], education: [], skills: [], summary: '',
  job: { title: '', company: '', location: '', description: '' },
  customSections: [],
};

const REFERENCE_BACKEND = {
  info: {
    full_name: 'Avery Lawson',
    email: 'avery.lawson@example.com',
    phone: '+1 (555) 123-4567',
    location: 'Berlin, Germany',
    linkedin_url: 'in/averylawson',
    portfolio_url: 'github.com/example',
  },
  summary:
    'Software Engineer with production experience building and deploying AI systems, fine-tuned LLMs with RAG, vector databases, and FastAPI inference. Full-stack background in Node.js/Python, React/TypeScript, and cloud infrastructure, with AI-integrated features delivered at scale to tens of thousands of users.',
  experience: [
    {
      role: 'Associate Software Engineer', company: 'Northwind Studio', location: 'Remote',
      start_date: '2025-12', end_date: '',
      description:
        'Shipped a full CMS (React/TypeScript) for managing thousands of learning activities across many courses, including a detailed editor, completeness heatmap, and filtered export pipeline\nDesigned a unified Activity CRUD REST API handling 20+ activity types (MCQ, speaking, conversational, media) with multi-file upload\nBuilt a Google Drive to cloud-blob sync service using background workers, automating media management at scale\nDeveloped a bulk enrollment tool (CSV preview + batch assignment) serving a large user base\nImplemented a Dropout Risk dashboard segmenting learners into Critical / At Risk / Watch / On Track, enabling data-driven retention actions\nRefactored message delivery across 20+ flow files, centralizing queue pacing and improving reliability across tens of thousands of messages',
    },
    {
      role: 'Associate Software Engineer', company: 'Lumen Health',
      location: 'Berlin, Germany',
      start_date: '2025-06', end_date: '2025-12',
      description:
        'Built and delivered client-facing portals using React/TypeScript, Tailwind CSS, and ShadCN, translating design specs into fully responsive, production-ready UIs across multiple client projects\nIntegrated RESTful APIs end-to-end with Zod validation schemas, enforcing data integrity across all data-entry flows',
    },
    {
      role: 'Software Engineer Intern', company: 'Acme Research Labs',
      location: 'London, UK',
      start_date: '2024-11', end_date: '2025-04',
      description:
        'Migrated 2GB+ of structured data across multiple sources in MongoDB with zero downtime, including schema normalization and integrity validation\nScraped, cleaned, and mapped structured data for 10,000+ entities from a third-party platform to internal API models, enabling downstream analytics features',
    },
  ],
  education: [{
    school: 'Example State University',
    degree: "Bachelor's", field_of_study: 'Computer Science',
    start_date: '2021', end_date: '2025', location: 'Anytown, USA',
  }],
  skills: [
    'JavaScript (ES6+)', 'TypeScript', 'Python', 'SQL',
    'Node.js', 'Express.js', 'FastAPI', 'REST APIs', 'BullMQ', 'Sequelize', 'Microservices',
    'React.js', 'Next.js', 'Tailwind CSS', 'ShadCN', 'Webpack/Vite', 'HTML5/CSS3',
    'PostgreSQL', 'MongoDB', 'Redis', 'MySQL', 'Vector Databases', 'Azure', 'AWS (basic)', 'Docker', 'GitHub Actions', 'Linux',
    'RAG', 'Prompt Engineering', 'Fine-tuning', 'LangChain', 'Pandas', 'Agile/Scrum', 'Jest/Unit Testing',
  ],
  job_description: { job_title: '', company: '', location: '', description: '' },
  custom: {
    sections: [
      {
        title: 'SerenityBot - Chatbot',
        content:
          "github.com/example/serenitybot\nFine-tuned an open LLM on a public mental-health dataset with a custom RAG pipeline, enabling domain-specific context-aware responses beyond the base model's capability\nBuilt full-stack platform: React, FastAPI inference server, vector database for semantic retrieval, and conversation analytics",
      },
      {
        title: 'ARCH360 – AR-powered Visualization Platform (Unity, C#, ARCore/ARKit)',
        content:
          'github.com/example/arch360\nBuilt and shipped a cross-platform AR app in Unity (C#) for Android/iOS as a solo capstone project\nIntegrated an AI-driven real-time customization engine, applying ML concepts to a production-style interactive system',
      },
    ],
    skillCategories: [
      { category: 'Languages',     skills: ['JavaScript (ES6+)', 'TypeScript', 'Python', 'SQL'] },
      { category: 'Backend',       skills: ['Node.js', 'Express.js', 'FastAPI', 'REST APIs', 'BullMQ', 'Sequelize', 'Microservices'] },
      { category: 'Frontend',      skills: ['React.js', 'Next.js', 'Tailwind CSS', 'ShadCN', 'Webpack/Vite', 'HTML5/CSS3'] },
      { category: 'Data & Cloud',  skills: ['PostgreSQL', 'MongoDB', 'Redis', 'MySQL', 'Vector Databases', 'Azure', 'AWS (basic)', 'Docker', 'GitHub Actions', 'Linux'] },
      { category: 'AI / ML',       skills: ['RAG', 'Prompt Engineering', 'Fine-tuning', 'LangChain', 'Pandas', 'Agile/Scrum', 'Jest/Unit Testing'] },
    ],
  },
};

console.log('Running pipeline: backend ResumeContent → mapContentToLocal → toTemplateInput → modernMinimal\n');

const local = mapContentToLocal(REFERENCE_BACKEND, STUB_EMPTY);
const tplInput = toTemplateInput(local);
const html = modernMinimal(tplInput);

const checks = [
  { name: 'Section "Project" header is rendered', ok: /class="section-title">Project</.test(html) },
  { name: 'Section "Skills" header is rendered',  ok: /class="section-title">Skills</.test(html) },
  { name: 'Skill category "Languages" rendered',  ok: /class="skill-cat">Languages</.test(html) },
  { name: 'Skill category "AI / ML" rendered',    ok: /class="skill-cat">AI \/ ML</.test(html) },
  { name: 'Project "SerenityBot" rendered',       ok: /class="proj-title">SerenityBot - Chatbot</.test(html) },
  { name: 'Project URL rendered as link',         ok: /class="proj-url"[^>]*>github\.com\/example\/serenitybot/.test(html) },
  { name: 'Date "December 2025" (full month)',    ok: /December 2025/.test(html) },
  { name: 'Date "Dec 2025" (short month) absent', ok: !/Dec 2025/.test(html) },
  { name: 'No literal "PROJECT" inside <li>',     ok: !/<li>PROJECT<\/li>/.test(html) },
  { name: 'No degree dup "Computer Science in"',  ok: !/Computer Science in Computer Science/.test(html) },
  { name: '.exp-meta-row uses table layout',      ok: /display: table/.test(html) },
];

let pass = 0, fail = 0;
for (const c of checks) {
  console.log(`${c.ok ? '✓' : '✗'} ${c.name}`);
  c.ok ? pass++ : fail++;
}
console.log(`\n${pass} passed, ${fail} failed\n`);

const htmlOut = resolve(outDir, 'pipeline-output.html');
writeFileSync(htmlOut, html, 'utf8');
console.log(`HTML  → ${htmlOut}`);

const chromePaths = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
];
const chrome = chromePaths.find(p => existsSync(p));
if (chrome) {
  const pdfOut = resolve(outDir, 'pipeline-output.pdf');
  const r = spawnSync(chrome, [
    '--headless=new', `--print-to-pdf=${pdfOut}`,
    '--no-pdf-header-footer', '--disable-gpu',
    '--virtual-time-budget=2000',
    pathToFileURL(htmlOut).href,
  ], { stdio: 'pipe', encoding: 'utf8' });
  if (r.status === 0 && existsSync(pdfOut)) console.log(`PDF   → ${pdfOut}`);
  else console.log(`(PDF skipped: ${r.stderr?.split('\n')[0] || 'unknown'})`);
}

process.exit(fail > 0 ? 1 : 0);
