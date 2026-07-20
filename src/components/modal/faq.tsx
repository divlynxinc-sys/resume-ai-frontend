import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, HelpCircle, Mail, MessageCircle, Search } from "lucide-react";
import SiteNavbar from "../layout/site-navbar";
import SiteFooter from "../layout/site-footer";

const FAQ_ITEMS = [
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

function FAQItem({
  question,
  answer,
  open,
  onToggle,
  index,
}: {
  question: string;
  answer: string;
  open: boolean;
  onToggle: () => void;
  index: number;
}) {
  const answerId = `faq-answer-${index}`;

  return (
    <article
      className={`overflow-hidden rounded-2xl border bg-[var(--app-surface)] transition-all duration-300 ${
        open
          ? "border-[var(--accent)]/40 shadow-[var(--shadow-soft)]"
          : "border-[var(--app-border)] hover:border-[var(--app-border-strong)]"
      }`}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls={answerId}
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-5 px-5 py-5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--accent)]/40 sm:px-6"
      >
        <span className="text-sm font-medium text-[var(--app-fg)] sm:text-base">{question}</span>
        <span className={`grid size-8 shrink-0 place-items-center rounded-full bg-[var(--accent-soft)] text-[var(--accent-text)] transition-transform duration-300 ${open ? "rotate-180" : ""}`}>
          <ChevronDown className="size-4" />
        </span>
      </button>

      <div className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
        <div className="overflow-hidden">
          <p id={answerId} className="border-t border-[var(--app-border)] px-5 py-5 text-sm leading-7 text-[var(--app-fg-muted)] sm:px-6">
            {answer}
          </p>
        </div>
      </div>
    </article>
  );
}

export default function FAQScreen() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [query, setQuery] = useState("");

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return FAQ_ITEMS;
    return FAQ_ITEMS.filter(({ question, answer }) =>
      `${question} ${answer}`.toLowerCase().includes(normalizedQuery)
    );
  }, [query]);

  return (
    <div className="min-h-svh bg-[var(--app-bg)] text-[var(--app-fg)]">
      <SiteNavbar />

      <main>
        <section className="relative overflow-hidden px-6 pb-14 pt-16 text-center sm:pt-20">
          <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            <div className="absolute -left-32 -top-40 size-96 rounded-full bg-[var(--pastel-lavender)] opacity-40 blur-3xl" />
            <div className="absolute -right-32 -top-32 size-96 rounded-full bg-[var(--pastel-peach)] opacity-35 blur-3xl" />
          </div>

          <div className="relative mx-auto max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--app-border)] bg-[var(--app-surface)] px-3.5 py-1.5 text-xs font-medium uppercase tracking-[0.16em] text-[var(--accent-text)]">
              <HelpCircle className="size-4" />
              Help &amp; answers
            </div>
            <h1 className="font-display text-4xl font-light tracking-tight text-[var(--app-fg)] sm:text-5xl">
              Questions, <span className="italic">answered.</span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[var(--app-fg-muted)] sm:text-base">
              Find clear answers about building, tailoring, managing, and downloading your Jobsynk AI resume.
            </p>

            <div className="relative mx-auto mt-8 max-w-2xl text-left">
              <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[var(--app-fg-soft)]" />
              <input
                type="search"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setOpenIndex(null);
                }}
                placeholder="Search questions, features, or topics…"
                aria-label="Search frequently asked questions"
                className="h-12 w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] pl-12 pr-4 text-sm text-[var(--app-fg)] shadow-[var(--shadow-soft)] outline-none transition-colors placeholder:text-[var(--app-fg-soft)] focus:border-[var(--accent)]/50 focus:ring-2 focus:ring-[var(--accent)]/10"
              />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-6 pb-20">
          <div className="space-y-3">
            {filteredItems.map((item) => {
              const originalIndex = FAQ_ITEMS.indexOf(item);
              return (
                <FAQItem
                  key={item.question}
                  question={item.question}
                  answer={item.answer}
                  index={originalIndex}
                  open={openIndex === originalIndex}
                  onToggle={() => setOpenIndex((current) => current === originalIndex ? null : originalIndex)}
                />
              );
            })}
          </div>

          {filteredItems.length === 0 && (
            <div className="rounded-2xl border border-dashed border-[var(--app-border)] bg-[var(--app-surface)] px-6 py-12 text-center">
              <Search className="mx-auto size-7 text-[var(--app-fg-soft)]" />
              <h2 className="mt-4 text-base font-medium text-[var(--app-fg)]">No matching questions</h2>
              <p className="mt-2 text-sm text-[var(--app-fg-muted)]">Try a different search, or contact our support team.</p>
            </div>
          )}

          <div className="mt-12 rounded-2xl border border-[var(--app-border)] bg-[var(--accent-soft)] p-6 text-center sm:p-8">
            <MessageCircle className="mx-auto size-7 text-[var(--accent-text)]" />
            <h2 className="mt-4 font-display text-2xl font-light text-[var(--app-fg)]">Still need a hand?</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--app-fg-muted)]">
              Explore detailed guidance or send the Jobsynk AI team a message.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <Link to="/help-center" className="inline-flex h-10 items-center rounded-lg bg-[var(--btn-primary-bg)] px-5 text-sm font-medium text-[var(--btn-primary-text)] transition-colors hover:bg-[var(--btn-primary-hover)]">
                Visit Help Center
              </Link>
              <a href="mailto:info@divlynx.com" className="inline-flex h-10 items-center gap-2 rounded-lg border border-[var(--btn-secondary-border)] bg-[var(--btn-secondary-bg)] px-5 text-sm font-medium text-[var(--btn-secondary-text)] transition-colors hover:bg-[var(--btn-secondary-hover)]">
                <Mail className="size-4" />
                Contact Us
              </a>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
