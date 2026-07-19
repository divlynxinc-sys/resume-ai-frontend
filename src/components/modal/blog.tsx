import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, PenLine } from "lucide-react";
import SiteNavbar from "../layout/site-navbar";
import SiteFooter from "../layout/site-footer";
import { POSTS_BY_DATE } from "@/content/blog/posts";
import { renderArt } from "@/content/blog/art";
import { blogIndexSchema } from "@/content/blog/schema";
import { formatPostDate } from "@/content/blog/render";
import type { Post } from "@/content/blog/types";
import { useSeo } from "@/lib/seo";

const ALL = "All";

function PostCard({ post, featured = false }: { post: Post; featured?: boolean }) {
  return (
    <article
      className={`group relative overflow-hidden rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--app-border-strong)] hover:shadow-[var(--shadow-soft)] ${
        featured ? "md:col-span-2 md:grid md:grid-cols-2 md:items-center" : ""
      }`}
    >
      <div
        className={featured ? "h-full min-h-[220px] p-5" : "p-4"}
        dangerouslySetInnerHTML={{ __html: renderArt(post.hero, post.tone) }}
      />

      <div className={featured ? "p-6 sm:p-8" : "px-6 pb-6"}>
        <div className="flex flex-wrap items-center gap-2">
          {post.tags.slice(0, featured ? 3 : 2).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-[var(--accent-soft)] px-2.5 py-1 text-[11px] font-medium text-[var(--accent-text)]"
            >
              {tag}
            </span>
          ))}
        </div>

        <h2
          className={`mt-4 font-display font-light tracking-tight text-[var(--app-fg)] ${
            featured ? "text-2xl sm:text-3xl" : "text-lg"
          }`}
        >
          <Link
            to={`/blog/${post.slug}`}
            className="after:absolute after:inset-0 focus:outline-none focus-visible:underline"
          >
            {post.title}
          </Link>
        </h2>

        <p
          className={`mt-3 leading-7 text-[var(--app-fg-muted)] ${
            featured ? "text-sm sm:text-[15px]" : "text-sm"
          }`}
        >
          {post.excerpt}
        </p>

        <div className="mt-5 flex items-center gap-3 text-xs text-[var(--app-fg-soft)]">
          <time dateTime={post.publishedAt}>{formatPostDate(post.publishedAt)}</time>
          <span aria-hidden="true">·</span>
          <span>{post.readingMinutes} min read</span>
          <ArrowRight className="ml-auto size-4 text-[var(--accent-text)] transition-transform duration-300 group-hover:translate-x-0.5" />
        </div>
      </div>
    </article>
  );
}

/**
 * The landing-page strip. Named export, reused by `landing-page.tsx` — same
 * pattern as `PricingSection` (pricing.tsx) and `TailoringSection` (tailoring.tsx).
 *
 * Cards here DO carry `data-landing-reveal`, because on the landing page the
 * IntersectionObserver in `LandingPageScreen` adds the class that reveals them.
 * Never use that attribute outside `.landing-page` — the CSS sets opacity:0 and
 * nothing would ever turn it back on.
 */
export function BlogSection() {
  const posts = POSTS_BY_DATE.slice(0, 3);

  return (
    <section id="blog" className="mx-auto max-w-[1100px] scroll-mt-24 px-6">
      <header className="mx-auto max-w-2xl text-center">
        <div className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-[var(--accent-text)]">
          From the blog
        </div>
        <h2 className="font-display text-3xl font-light leading-tight tracking-tight text-[var(--app-fg)] md:text-4xl">
          Advice that survives contact with a recruiter.
        </h2>
        <p className="mt-3 leading-relaxed text-[var(--app-fg-muted)]">
          No recycled myths, no invented statistics — just what actually happens to your
          resume after you hit apply.
        </p>
      </header>

      <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3">
        {posts.map((post) => (
          <article
            key={post.slug}
            data-landing-reveal
            className="group relative overflow-hidden rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] transition-all duration-300 hover:border-[var(--app-border-strong)] hover:shadow-[var(--shadow-soft)]"
          >
            <div
              className="p-4"
              dangerouslySetInnerHTML={{ __html: renderArt(post.hero, post.tone) }}
            />
            <div className="px-6 pb-6">
              <span className="rounded-full bg-[var(--accent-soft)] px-2.5 py-1 text-[11px] font-medium text-[var(--accent-text)]">
                {post.tags[0]}
              </span>
              <h3 className="mt-4 text-base font-medium leading-snug tracking-tight text-[var(--app-fg)]">
                <Link
                  to={`/blog/${post.slug}`}
                  className="after:absolute after:inset-0 focus:outline-none focus-visible:underline"
                >
                  {post.title}
                </Link>
              </h3>
              <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-[var(--app-fg-muted)]">
                {post.excerpt}
              </p>
              <div className="mt-4 flex items-center gap-2 text-xs text-[var(--app-fg-soft)]">
                <span>{post.readingMinutes} min read</span>
                <ArrowRight className="ml-auto size-4 text-[var(--accent-text)] transition-transform duration-300 group-hover:translate-x-0.5" />
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-10 text-center">
        <Link
          to="/blog"
          className="inline-flex h-11 items-center gap-2 rounded-lg border border-[var(--btn-secondary-border)] bg-[var(--btn-secondary-bg)] px-6 text-sm font-medium text-[var(--btn-secondary-text)] transition-colors hover:bg-[var(--btn-secondary-hover)]"
        >
          Read all articles
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </section>
  );
}

export default function BlogScreen() {
  const [activeTag, setActiveTag] = useState<string>(ALL);

  useSeo({
    title: "The Jobsynk Blog — Resume, ATS & Job Search Guides",
    description:
      "Evidence-led guides on ATS formatting, tailoring your resume to a job description, keywords that actually matter, and using AI without sounding like AI.",
    path: "/blog",
    jsonLd: blogIndexSchema(POSTS_BY_DATE),
  });

  const tags = useMemo(() => {
    const unique = new Set<string>();
    POSTS_BY_DATE.forEach((post) => post.tags.forEach((tag) => unique.add(tag)));
    return [ALL, ...Array.from(unique).sort()];
  }, []);

  const visible = useMemo(
    () =>
      activeTag === ALL
        ? POSTS_BY_DATE
        : POSTS_BY_DATE.filter((post) => post.tags.includes(activeTag)),
    [activeTag]
  );

  const [featured, ...rest] = visible;

  return (
    <div className="landing-page min-h-svh bg-[var(--app-bg)] text-[var(--app-fg)]">
      <SiteNavbar marketingMode />

      <main>
        <section className="relative overflow-hidden px-6 pb-12 pt-14 text-center sm:pt-20">
          <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            <div className="absolute -left-32 -top-40 size-96 rounded-full bg-[var(--pastel-lavender)] opacity-40 blur-3xl" />
            <div className="absolute -right-32 -top-32 size-96 rounded-full bg-[var(--pastel-peach)] opacity-35 blur-3xl" />
          </div>

          <div className="relative mx-auto max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--app-border)] bg-[var(--app-surface)] px-3.5 py-1.5 text-xs font-medium uppercase tracking-[0.16em] text-[var(--accent-text)]">
              <PenLine className="size-4" />
              The Jobsynk blog
            </div>
            <h1 className="font-display text-4xl font-light tracking-tight text-[var(--app-fg)] sm:text-5xl">
              Advice that survives
              <br />
              <span className="italic">contact with a recruiter.</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-[var(--app-fg-muted)] sm:text-base">
              No recycled myths, no invented statistics. Just what actually happens to your
              resume after you hit apply — and what to do about it.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-[1100px] px-6 pb-24">
          <div
            role="tablist"
            aria-label="Filter posts by topic"
            className="mb-10 flex flex-wrap justify-center gap-2"
          >
            {tags.map((tag) => {
              const active = tag === activeTag;
              return (
                <button
                  key={tag}
                  role="tab"
                  aria-selected={active}
                  type="button"
                  onClick={() => setActiveTag(tag)}
                  className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/30 ${
                    active
                      ? "border-transparent bg-[var(--accent)] text-white"
                      : "border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-fg-muted)] hover:border-[var(--app-border-strong)]"
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {featured && <PostCard post={featured} featured />}
            {rest.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>

          {visible.length === 0 && (
            <p className="py-16 text-center text-sm text-[var(--app-fg-muted)]">
              Nothing under that topic yet.
            </p>
          )}
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
