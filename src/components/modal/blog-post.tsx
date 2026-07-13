import { useEffect } from "react";
import { Link, Navigate, useLocation, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Clock, RefreshCw } from "lucide-react";
import SiteNavbar from "../layout/site-navbar";
import SiteFooter from "../layout/site-footer";
import { getPost, relatedPosts } from "@/content/blog/posts";
import { renderArt } from "@/content/blog/art";
import {
  formatPostDate,
  renderPostBodyHtml,
  renderPostFaqHtml,
  renderTocHtml,
} from "@/content/blog/render";
import { postSchema } from "@/content/blog/schema";
import type { Post } from "@/content/blog/types";
import { useSeo } from "@/lib/seo";

function Byline({ post }: { post: Post }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[var(--app-fg-soft)]">
      <span className="flex items-center gap-2.5">
        <span
          aria-hidden="true"
          className="grid size-8 place-items-center rounded-full bg-[var(--accent-soft)] text-[11px] font-semibold text-[var(--accent-text)]"
        >
          {post.author.initials}
        </span>
        <span className="text-[var(--app-fg-muted)]">{post.author.name}</span>
      </span>
      <span aria-hidden="true">·</span>
      <time dateTime={post.publishedAt}>{formatPostDate(post.publishedAt)}</time>
      <span aria-hidden="true">·</span>
      <span className="flex items-center gap-1.5">
        <Clock className="size-3.5" />
        {post.readingMinutes} min read
      </span>
      {post.updatedAt !== post.publishedAt && (
        <>
          <span aria-hidden="true">·</span>
          {/* Visible + machine-readable freshness. LLM rerankers demonstrably
              favour recent timestamps, so this is not decoration. */}
          <span className="flex items-center gap-1.5">
            <RefreshCw className="size-3.5" />
            Updated <time dateTime={post.updatedAt}>{formatPostDate(post.updatedAt)}</time>
          </span>
        </>
      )}
    </div>
  );
}

/**
 * The article body is injected as HTML rather than composed from React nodes,
 * because `content/blog/render.ts` is the ONE renderer that also feeds
 * `scripts/prerender-blog.mjs`. Composing the body twice — once in JSX, once in
 * the prerenderer — would guarantee drift between what a crawler reads and what a
 * human sees. The input is our own typed content, never user input, and every
 * string is escaped in `render.ts` before any inline markup is applied.
 */
function ArticleBody({ post }: { post: Post }) {
  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: renderTocHtml(post) }} />
      <div dangerouslySetInnerHTML={{ __html: renderPostBodyHtml(post) }} />
      <div dangerouslySetInnerHTML={{ __html: renderPostFaqHtml(post) }} />
    </>
  );
}

export default function BlogPostScreen() {
  const { slug } = useParams<{ slug: string }>();
  const { hash } = useLocation();
  const post = slug ? getPost(slug) : undefined;

  // The browser's native anchor jump fires against the PRERENDERED markup, then
  // React mounts and replaces it — losing the scroll position. So a deep link to
  // /blog/<slug>#some-heading (a shared TOC link, or a Google "jump to" result)
  // lands at the top of the page. Re-apply the jump after mount. Same fix the
  // landing page already carries for its /#features links.
  useEffect(() => {
    if (!hash || !post) return;
    const target = document.getElementById(decodeURIComponent(hash.slice(1)));
    if (!target) return;
    requestAnimationFrame(() => target.scrollIntoView({ block: "start" }));
  }, [hash, post]);

  // Hooks can't be conditional, so useSeo runs with placeholder values when the
  // slug is unknown; the redirect below unmounts before it can matter.
  useSeo({
    title: post ? `${post.seoTitle} | Jobsynk` : "Not found | Jobsynk",
    description: post?.description ?? "",
    path: post ? `/blog/${post.slug}` : "/blog",
    type: "article",
    publishedAt: post?.publishedAt,
    updatedAt: post?.updatedAt,
    author: post?.author.name,
    tags: post?.tags,
    jsonLd: post ? postSchema(post) : undefined,
  });

  if (!post) return <Navigate to="/blog" replace />;

  const related = relatedPosts(post.slug);

  return (
    <div className="min-h-svh bg-[var(--app-bg)] text-[var(--app-fg)]">
      <SiteNavbar marketingMode />

      <main>
        <article className="mx-auto max-w-3xl px-6 pb-20 pt-10 sm:pt-14">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-xs font-medium text-[var(--app-fg-soft)] transition-colors hover:text-[var(--accent-text)]"
          >
            <ArrowLeft className="size-3.5" />
            All articles
          </Link>

          <header className="mt-8">
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-[var(--accent-soft)] px-2.5 py-1 text-[11px] font-medium text-[var(--accent-text)]"
                >
                  {tag}
                </span>
              ))}
            </div>

            <h1 className="mt-5 font-display text-3xl font-light leading-tight tracking-tight text-[var(--app-fg)] sm:text-[42px] sm:leading-[1.15]">
              {post.title}
            </h1>

            <p className="mt-5 text-base leading-8 text-[var(--app-fg-muted)] sm:text-lg">
              {post.excerpt}
            </p>

            <div className="mt-7 border-t border-[var(--app-border)] pt-6">
              <Byline post={post} />
            </div>
          </header>

          <div className="mt-10 overflow-hidden rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-5 sm:p-8">
            <div
              className="aspect-[5/3] w-full"
              dangerouslySetInnerHTML={{ __html: renderArt(post.hero, post.tone) }}
            />
          </div>

          <div className="mt-12">
            <ArticleBody post={post} />
          </div>

          <aside className="mt-16 overflow-hidden rounded-2xl border border-[var(--app-border)] bg-[var(--accent-soft)] p-7 text-center sm:p-9">
            <h2 className="font-display text-2xl font-light tracking-tight text-[var(--app-fg)]">
              Put this into practice.
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[var(--app-fg-muted)]">
              Build an ATS-friendly resume free, then tailor it to any job description in a
              couple of minutes.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                to="/signup"
                className="inline-flex h-10 items-center rounded-lg bg-[var(--btn-primary-bg)] px-5 text-sm font-medium text-[var(--btn-primary-text)] transition-colors hover:bg-[var(--btn-primary-hover)]"
              >
                Build my resume free
              </Link>
              <Link
                to="/templates"
                className="inline-flex h-10 items-center rounded-lg border border-[var(--btn-secondary-border)] bg-[var(--btn-secondary-bg)] px-5 text-sm font-medium text-[var(--btn-secondary-text)] transition-colors hover:bg-[var(--btn-secondary-hover)]"
              >
                Browse templates
              </Link>
            </div>
          </aside>

          {related.length > 0 && (
            <section className="mt-16 border-t border-[var(--app-border)] pt-10">
              <h2 className="font-display text-xl font-light tracking-tight text-[var(--app-fg)]">
                Keep reading
              </h2>
              <div className="mt-6 space-y-3">
                {related.map((item) => (
                  <Link
                    key={item.slug}
                    to={`/blog/${item.slug}`}
                    className="group flex items-center gap-4 rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--app-border-strong)] hover:shadow-[var(--shadow-soft)]"
                  >
                    <span
                      aria-hidden="true"
                      className="hidden h-16 w-24 shrink-0 overflow-hidden rounded-xl sm:block"
                      dangerouslySetInnerHTML={{ __html: renderArt(item.hero, item.tone) }}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium text-[var(--app-fg)]">
                        {item.title}
                      </span>
                      <span className="mt-1 block text-xs leading-6 text-[var(--app-fg-soft)]">
                        {item.readingMinutes} min read
                      </span>
                    </span>
                    <ArrowRight className="size-4 shrink-0 text-[var(--accent-text)] transition-transform duration-300 group-hover:translate-x-0.5" />
                  </Link>
                ))}
              </div>
            </section>
          )}
        </article>
      </main>

      <SiteFooter />
    </div>
  );
}
