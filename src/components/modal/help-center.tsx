import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CreditCard,
  Edit3,
  HelpCircle,
  LayoutGrid,
  Mail,
  MessageCircle,
  Search,
  User,
  Wrench,
  X,
  Zap,
} from "lucide-react";
import SiteNavbar from "../layout/site-navbar";
import PageWithSidebar from "../layout/page-with-sidebar";

type TopicId = "getting-started" | "account" | "editing" | "templates" | "troubleshooting" | "billing";

type Topic = {
  id: TopicId;
  title: string;
  desc: string;
  icon: ReactNode;
};

type Article = {
  id: string;
  topic: TopicId;
  title: string;
  desc: string;
  readTime: string;
  content: string[];
};

const topics: Topic[] = [
  {
    id: "getting-started",
    title: "Getting Started",
    desc: "Create your first resume and learn the core workflow.",
    icon: <Zap className="size-5" />,
  },
  {
    id: "account",
    title: "Account Management",
    desc: "Manage profile details, login, and preferences.",
    icon: <User className="size-5" />,
  },
  {
    id: "editing",
    title: "Resume Editing",
    desc: "Edit, tailor, and improve your resume content.",
    icon: <Edit3 className="size-5" />,
  },
  {
    id: "templates",
    title: "Templates & Design",
    desc: "Choose layouts that match your target role.",
    icon: <LayoutGrid className="size-5" />,
  },
  {
    id: "troubleshooting",
    title: "Troubleshooting",
    desc: "Fix common issues with uploads and downloads.",
    icon: <Wrench className="size-5" />,
  },
  {
    id: "billing",
    title: "Billing & Subscriptions",
    desc: "Understand plans, upgrades, and account billing.",
    icon: <CreditCard className="size-5" />,
  },
];

const articles: Article[] = [
  {
    id: "standout-resume",
    topic: "getting-started",
    title: "How to create a standout resume",
    desc: "Learn the core structure recruiters expect and how to make each section count.",
    readTime: "4 min read",
    content: [
      "Start with a focused headline, a short summary, and work experience written around outcomes. Recruiters scan quickly, so every section should answer what you did, where you did it, and what changed because of your work.",
      "Use numbers when possible: revenue, time saved, performance gains, users supported, tickets resolved, or projects delivered. If you do not have exact numbers, use clear scope language such as cross-functional team, weekly reporting, or production application.",
      "Before downloading, check that your contact details are correct, bullet formatting is consistent, and the resume is tailored to the job description you care about most.",
    ],
  },
  {
    id: "cover-letter",
    topic: "editing",
    title: "Tips for writing a strong cover letter",
    desc: "Use your cover letter to connect your experience to the job without repeating your resume.",
    readTime: "3 min read",
    content: [
      "A strong cover letter is specific. Mention the role, the company, and one or two experiences that prove you understand the work they need done.",
      "Keep it short: one opening paragraph, one evidence paragraph, and one closing paragraph. The goal is to create context for your resume, not replace it.",
      "Use the Cover Letter tool when you want a first draft, then personalize the opening and closing so it sounds like you.",
    ],
  },
  {
    id: "resume-mistakes",
    topic: "editing",
    title: "Common resume mistakes to avoid",
    desc: "Identify issues that lower ATS scores or make a resume harder to scan.",
    readTime: "5 min read",
    content: [
      "Avoid long paragraphs, vague responsibilities, inconsistent dates, and decorative formatting that hides important text from applicant tracking systems.",
      "Do not use the same resume for every job. Adjust your summary, skills, and top bullets to reflect the role's keywords and requirements.",
      "Check for duplicate bullets, outdated tools, missing links, and file names like final-final-v3.pdf. A clean file name helps too.",
    ],
  },
  {
    id: "download-resume",
    topic: "troubleshooting",
    title: "Downloading your resume as PDF or DOCX",
    desc: "What to do when exports are slow, blocked, or formatted differently.",
    readTime: "2 min read",
    content: [
      "Use PDF when you are applying through portals or emailing a final version. Use DOCX when you need an editable copy for Word or Google Docs.",
      "If a download does not start, make sure your browser allows downloads from this site and that the resume has saved content.",
      "For the best PDF output, wait for the preview to finish loading before downloading.",
    ],
  },
  {
    id: "template-choice",
    topic: "templates",
    title: "Choosing the right resume template",
    desc: "Pick a layout based on role, experience level, and ATS needs.",
    readTime: "3 min read",
    content: [
      "For most applications, choose a clean single-column template with clear headings. It is easier for recruiters and ATS systems to parse.",
      "Use more expressive templates for portfolio-forward roles where visual presentation matters, but keep the content readable and structured.",
      "If your resume is long, try a compact layout before cutting important achievements.",
    ],
  },
  {
    id: "billing-plan",
    topic: "billing",
    title: "Managing your plan",
    desc: "Learn where to review plan status and upgrade options.",
    readTime: "2 min read",
    content: [
      "Open Pro Plans from the sidebar to compare available plans and choose the option that fits your workflow.",
      "Paid tools are marked in the sidebar. If a feature asks you to upgrade, your current account does not include that action yet.",
      "For payment questions or account-specific billing help, contact support so the team can review your account directly.",
    ],
  },
];

function PageTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <header>
      <div className="text-xs font-medium tracking-[0.16em] uppercase text-[var(--accent-text)]">
        Support
      </div>
      <h1 className="mt-2 font-display text-3xl md:text-4xl font-light tracking-tight text-[var(--app-fg)]">
        {title}
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--app-fg-muted)]">
        {subtitle}
      </p>
    </header>
  );
}

function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <h2 className="font-display text-2xl font-light tracking-tight text-[var(--app-fg)]">
      {children}
    </h2>
  );
}

function SearchBar({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="relative mt-5 max-w-2xl">
      <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[var(--app-fg-soft)]" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search articles, topics, or download help..."
        className="w-full rounded-xl border border-[var(--app-border-strong)] bg-[var(--app-surface)] px-11 py-3 text-sm text-[var(--app-fg)] outline-none transition-all placeholder:text-[var(--app-fg-soft)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/15"
      />
    </div>
  );
}

function TopicCard({
  topic,
  active,
  onClick,
}: {
  topic: Topic;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group rounded-2xl border p-5 text-left transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)] ${
        active
          ? "border-[var(--accent)] bg-[var(--accent-soft)]"
          : "border-[var(--app-border)] bg-[var(--app-surface)] hover:border-[var(--app-border-strong)]"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`grid size-10 shrink-0 place-items-center rounded-xl ${
            active ? "bg-white/60 text-[var(--accent-text)]" : "bg-[var(--accent-soft)] text-[var(--accent-text)]"
          }`}
        >
          {topic.icon}
        </div>
        <div>
          <div className="text-sm font-medium text-[var(--app-fg)]">{topic.title}</div>
          <p className="mt-1 text-sm leading-relaxed text-[var(--app-fg-muted)]">{topic.desc}</p>
        </div>
      </div>
    </button>
  );
}

function ArticleRow({ article, onRead }: { article: Article; onRead: () => void }) {
  const topic = topics.find((item) => item.id === article.topic);

  return (
    <article className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--app-border-strong)] hover:shadow-[var(--shadow-soft)]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--accent-text)]">
            {topic?.title ?? "Help"} · {article.readTime}
          </div>
          <h3 className="mt-2 text-base font-medium text-[var(--app-fg)]">{article.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-[var(--app-fg-muted)]">{article.desc}</p>
        </div>
        <button
          type="button"
          onClick={onRead}
          className="inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-[var(--accent-text)] transition-colors hover:bg-[var(--accent-soft)] hover:text-[var(--accent-hover)]"
        >
          Read More
          <ArrowRight className="size-4" />
        </button>
      </div>
    </article>
  );
}

function ArticleDialog({ article, onClose }: { article: Article; onClose: () => void }) {
  const topic = topics.find((item) => item.id === article.topic);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(26,26,26,0.35)] p-4 backdrop-blur-[2px]">
      <article className="max-h-[85svh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-6 shadow-[var(--shadow-pop)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--accent-text)]">
              {topic?.title ?? "Help"} · {article.readTime}
            </div>
            <h3 className="mt-2 font-display text-2xl font-light tracking-tight text-[var(--app-fg)]">
              {article.title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close article"
            className="rounded-lg p-1.5 text-[var(--app-fg-soft)] transition-colors hover:bg-[var(--app-surface-2)] hover:text-[var(--app-fg)]"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="mt-6 space-y-4 text-sm leading-relaxed text-[var(--app-fg-muted)]">
          {article.content.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>

        <div className="mt-7 flex flex-col gap-3 border-t border-[var(--app-border)] pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-[var(--app-fg-soft)]">Need more help with this topic?</p>
          <Link
            to="/contact-us"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--accent-hover)]"
          >
            Contact Support
            <Mail className="size-4" />
          </Link>
        </div>
      </article>
    </div>
  );
}

function HelpCTA() {
  return (
    <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-6 shadow-[var(--shadow-soft)] sm:p-8">
      <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <div className="inline-flex size-11 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent-text)]">
            <HelpCircle className="size-5" />
          </div>
          <h3 className="mt-4 font-display text-2xl font-light tracking-tight text-[var(--app-fg)]">
            Still need help?
          </h3>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-[var(--app-fg-muted)]">
            Our support pages cover the common paths. For account-specific issues, send the team a message.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row md:flex-col">
          <Link
            to="/contact-us"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--accent)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--accent-hover)]"
          >
            Contact Support
            <Mail className="size-4" />
          </Link>
          <Link
            to="/faq"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--app-border-strong)] px-4 py-2.5 text-sm font-medium text-[var(--app-fg-muted)] transition-colors hover:bg-[var(--app-surface-2)] hover:text-[var(--app-fg)]"
          >
            Browse FAQ
            <MessageCircle className="size-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function HelpCenterScreen() {
  const [query, setQuery] = useState("");
  const [activeTopic, setActiveTopic] = useState<TopicId | "all">("all");
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  const filteredArticles = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return articles.filter((article) => {
      const topic = topics.find((item) => item.id === article.topic);
      const matchesTopic = activeTopic === "all" || article.topic === activeTopic;
      const searchableText = [article.title, article.desc, topic?.title, ...article.content]
        .join(" ")
        .toLowerCase();
      const matchesQuery = !normalizedQuery || searchableText.includes(normalizedQuery);
      return matchesTopic && matchesQuery;
    });
  }, [activeTopic, query]);

  return (
    <div className="min-h-svh bg-[var(--app-bg)] text-[var(--app-fg)]">
      <SiteNavbar />
      <PageWithSidebar activeRoute="help-center" mainClassName="mx-auto max-w-[1100px] pb-16">
        <div className="pt-8">
          <PageTitle
            title="Help Center"
            subtitle="Find quick answers for building, editing, downloading, and managing your Jobsynk AI resumes."
          />
          <SearchBar value={query} onChange={setQuery} />
        </div>

        <section className="mt-12">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading>Browse by Topic</SectionHeading>
            <button
              type="button"
              onClick={() => setActiveTopic("all")}
              className={`w-fit rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                activeTopic === "all"
                  ? "bg-[var(--accent)] text-white"
                  : "text-[var(--app-fg-muted)] hover:bg-[var(--app-surface-2)] hover:text-[var(--app-fg)]"
              }`}
            >
              All topics
            </button>
          </div>
          <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {topics.map((topic) => (
              <TopicCard
                key={topic.id}
                topic={topic}
                active={activeTopic === topic.id}
                onClick={() => setActiveTopic(topic.id)}
              />
            ))}
          </div>
        </section>

        <section className="mt-12">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading>Featured Articles</SectionHeading>
            <p className="text-sm text-[var(--app-fg-muted)]">
              {filteredArticles.length} {filteredArticles.length === 1 ? "article" : "articles"}
            </p>
          </div>

          <div className="mt-5 space-y-4">
            {filteredArticles.length > 0 ? (
              filteredArticles.map((article) => (
                <ArticleRow
                  key={article.id}
                  article={article}
                  onRead={() => setSelectedArticle(article)}
                />
              ))
            ) : (
              <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-8 text-center">
                <Search className="mx-auto size-8 text-[var(--app-fg-soft)]" />
                <h3 className="mt-4 text-base font-medium text-[var(--app-fg)]">No articles found</h3>
                <p className="mt-2 text-sm text-[var(--app-fg-muted)]">
                  Try a broader search or clear the selected topic.
                </p>
              </div>
            )}
          </div>
        </section>

        <div className="mt-12">
          <HelpCTA />
        </div>
      </PageWithSidebar>

      {selectedArticle ? (
        <ArticleDialog article={selectedArticle} onClose={() => setSelectedArticle(null)} />
      ) : null}
    </div>
  );
}
