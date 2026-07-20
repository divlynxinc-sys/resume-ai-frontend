// FAQ copy that is rendered on a page AND emitted as FAQPage JSON-LD by the
// prerenderer (scripts/prerender.mjs, via the content bundle). One module for
// both consumers so a crawler and a browser can never see different questions.

/** Shape used by the ATS checker and the blog (`post.faq`). */
export type FaqEntry = { q: string; a: string };

/** /ats-checker — rendered by `ats-checker.tsx`, emitted by its useSeo() AND the prerenderer. */
export const ATS_CHECKER_FAQ: FaqEntry[] = [
  {
    q: "Is this ATS checker really free?",
    a: "Yes, and there's no account. Your resume is analysed in your browser and never leaves your device — nothing is uploaded to a server, so there is nothing for us to store.",
  },
  {
    q: "Does an applicant tracking system give my resume a score?",
    a: "No, and be sceptical of any tool that implies otherwise. An ATS is a database: it parses your resume into fields and stores it so a recruiter can search. There is no official score a hiring team sees. What this tool measures is whether your resume would parse cleanly and read well — which is the part you can actually control.",
  },
  {
    q: "What does this actually check?",
    a: "Ten things: whether your contact details are findable, whether you use standard section headings, how many of your bullets contain a number, whether you lead with duties instead of results, length, resume register, filler phrases, dates, bullet length, and — if you paste a job description — how well your vocabulary matches it.",
  },
  {
    q: "Is my resume uploaded to your servers?",
    a: "No. The file is read and analysed inside your browser and never sent anywhere — there is no upload, no storage, and nothing for us to keep. That is also why the tool is free and needs no account: it costs us nothing to run.",
  },
  {
    q: "What file types can I upload?",
    a: "PDF, DOCX and plain text. If your PDF turns out to contain no selectable text, we'll tell you — that means it's a scanned image, and it is the single most fatal ATS mistake there is, because a parser reads exactly what we read: nothing.",
  },
];

/** /faq — rendered by `faq.tsx`, emitted as FAQPage JSON-LD by the prerenderer only. */
export const FAQ_PAGE_ITEMS = [
  {
    question: "How do I create a resume?",
    answer: "Choose a professionally designed template, add your experience, education, projects, and skills, then use Jobsynk AI suggestions to strengthen your content before downloading your resume.",
  },
  {
    question: "Can I customize my resume template?",
    answer: "Yes. You can choose from available templates and adjust your resume content to suit your experience, industry, and target role while keeping the layout ATS-friendly.",
  },
  {
    question: "How much does Jobsynk AI cost?",
    answer: "Jobsynk AI offers multiple plans for different needs. Visit the pricing section to compare current features and choose the plan that fits your job search.",
  },
  {
    question: "How does AI tailoring work?",
    answer: "Add a target job description and Jobsynk AI analyzes its skills, keywords, and requirements. It then suggests focused improvements that make your resume more relevant to that role.",
  },
  {
    question: "Are Jobsynk AI resumes ATS-friendly?",
    answer: "Our templates and guidance prioritize clear headings, readable structure, relevant keywords, and consistent formatting to improve compatibility with applicant tracking systems.",
  },
  {
    question: "Is my personal data secure?",
    answer: "We use industry-standard safeguards and responsible data practices to protect your information. You can review the Privacy Policy and Security pages for more details.",
  },
  {
    question: "Can I download and update my resume later?",
    answer: "Yes. You can return to your saved resumes, update their content, preview changes, and download the latest version whenever you need it.",
  },
  {
    question: "How do I contact support?",
    answer: "Visit the Help Center or Contact Us page for assistance. You can also email the Jobsynk AI team at support@jobsynk.ai.",
  },
];
