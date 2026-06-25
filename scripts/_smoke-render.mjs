// Smoke-test fixture renderer. Emits, for every template, the resume HTML for a
// 1-page profile and a 3-page (overflow) profile, plus the raw TemplateInput
// JSON per profile (for the DOCX test). Consumed by test_export_smoke.py.
import { writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, resolve } from 'node:path';
import { build } from 'esbuild';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const indexPath = resolve(projectRoot, 'src/lib/resume-templates/index.ts');
const outDir = resolve(__dirname, 'output/_smoke');
if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

const bundle = resolve(__dirname, '.smoke-bundle.mjs');
await build({ entryPoints: [indexPath], bundle: true, format: 'esm',
  platform: 'neutral', target: 'node18', logLevel: 'silent', outfile: bundle });
const { TEMPLATES, renderTemplate } = await import(pathToFileURL(bundle).href);

const candidate = {
  name: 'Abdullah Tahir', email: 'abdullahtahirme@gmail.com', phone: '+92 318 0070410',
  linkedin: 'linkedin.com/in/ababdullah', portfolio: 'github.com/ABAbdulah',
};

const bullet6 = [
  'Shipped a full CMS (React/TypeScript) for managing 3,428 learning activities across 57 courses, including a detailed editor and completeness heatmap',
  'Designed a unified Activity CRUD REST API handling 21 WhatsApp activity types (MCQ, speaking, conversational, media) with multi-file upload',
  'Built a Google Drive to Azure Blob sync service using BullMQ background workers, automating media management at scale',
  'Developed a bulk student enrollment tool (CSV preview + batch assignment) serving a 32,000+ user base',
  'Implemented a Dropout Risk dashboard segmenting learners into Critical / At Risk / Watch / On Track',
  'Refactored WhatsApp message delivery across 20+ flow files, centralizing queue pacing and improving reliability across 74,000+ messages',
];

const onePage = {
  candidate_info: candidate,
  resume: {
    summary: 'Software Engineer with production experience building and deploying AI systems.',
    experiences: [
      { role: 'Associate Software Engineer', company: 'Northwind', location: 'Remote', startDate: '2024-11', endDate: undefined, bullets: bullet6.slice(0, 2) },
    ],
    projects: [{ title: 'SerenityBot - Chatbot', link: { url: 'https://github.com/ABAbdulah/mental-health-companion.git', label: 'github.com/ABAbdulah/mental-health-companion.git' }, bullets: ['Fine-tuned Llama 3 with a custom RAG pipeline'] }],
    education: [{ school: 'FAST', degree: "Bachelor's in Computer Science", field: '', location: 'Islamabad, Pakistan', endDate: '2025' }],
    skills: [{ category: 'Skills', skills: ['JavaScript', 'TypeScript', 'Python', 'React.js', 'Node.js'] }],
  },
};

const companies = ['Northwind Studio', 'Lumen Health', 'FAIR (Football and AI Research)', 'MicroAgility APAC', 'Helios Labs'];
const threePage = {
  candidate_info: candidate,
  resume: {
    summary: 'Software Engineer with production experience building and deploying AI systems, fine-tuned LLMs with RAG, vector databases, and FastAPI inference. Full-stack background delivered at scale to tens of thousands of users.',
    experiences: companies.map((c, i) => ({
      role: 'Associate Software Engineer', company: c,
      location: ['Remote', 'Berlin, Germany', 'London — UK', 'Islamabad, Pakistan', 'Austin, TX'][i],
      startDate: i === 2 ? '2024-11' : ['2025-12', '2025-06', '2024-11', '2025-06', '2023-01'][i],
      endDate: i === 0 ? undefined : (['', '2025-12', '2025-04', '2025-12', '2024-01'][i] || undefined),
      bullets: bullet6,
    })),
    projects: [
      { title: 'SerenityBot - Chatbot', link: { url: 'https://github.com/ABAbdulah/mental-health-companion.git', label: 'github.com/ABAbdulah/mental-health-companion.git' }, bullets: ['Fine-tuned Llama 3 on a HuggingFace mental health dataset with a custom RAG pipeline', 'Built full-stack platform: React, FastAPI inference server, vector database for semantic retrieval'] },
      { title: 'ARCH360 — AR-powered Visualization Platform', link: 'github.com/ABAbdulah/ARch360.git', bullets: ['Built and shipped a cross-platform AR app in Unity (C#) for Android/iOS as a solo final year project at FAST NUCES', 'Integrated an AI-driven real-time customization engine, applying ML concepts to a production-style interactive system'] },
      { title: 'Vector Search Service', link: 'https://github.com/ABAbdulah/vector-search', bullets: ['Designed a low-latency vector search API', 'Served 10,000+ queries/day'] },
    ],
    education: [{ school: 'National University of Computer and Emerging Sciences - FAST', degree: "Bachelor's in Computer Science", field: '', location: 'Islamabad, Pakistan', endDate: '2025' }],
    skills: [{ category: 'Skills', skills: ['JavaScript (ES6+)', 'TypeScript', 'Python', 'SQL', 'Node.js', 'Express.js', 'FastAPI', 'REST APIs', 'BullMQ', 'Sequelize', 'Microservices', 'React.js', 'Next.js', 'Tailwind CSS', 'ShadCN', 'Webpack/Vite', 'HTML5/CSS3', 'PostgreSQL', 'MongoDB', 'Redis', 'MySQL', 'Vector Databases', 'Azure', 'AWS (basic)', 'Docker', 'GitHub Actions', 'Linux', 'RAG', 'Prompt Engineering', 'Fine-tuning (Llama 3)', 'LangChain', 'Pandas', 'Agile/Scrum', 'Jest/Unit Testing'] }],
  },
};

const profiles = { onepage: onePage, threepage: threePage };
for (const [pname, data] of Object.entries(profiles)) {
  writeFileSync(resolve(outDir, `${pname}.input.json`), JSON.stringify(data), 'utf8');
  for (const slug of Object.keys(TEMPLATES)) {
    writeFileSync(resolve(outDir, `${slug}.${pname}.html`), renderTemplate(slug, data), 'utf8');
  }
}
console.log('smoke fixtures written to', outDir);
