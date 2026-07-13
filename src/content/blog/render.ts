// Block -> HTML string renderer.
//
// Used by BOTH `components/modal/blog-post.tsx` (via dangerouslySetInnerHTML) and
// `scripts/prerender-blog.mjs` (via esbuild, same as scripts/render-template-preview.mjs).
// One renderer = the static HTML a crawler sees and the DOM a human sees are the
// same markup, so they cannot drift.
//
// Every class string below must appear as a LITERAL here — Tailwind v4 scans source
// files for candidates, and these are the only place these classes exist.

import { renderArt } from "./art";
import type { Block, CalloutTone, Post } from "./types";

const TONE_BG: Record<CalloutTone, string> = {
  accent: "var(--accent-soft)",
  mint: "var(--pastel-mint)",
  butter: "var(--pastel-butter)",
  rose: "var(--pastel-rose)",
  sky: "var(--pastel-sky)",
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Tiny inline markup so post bodies stay readable as plain strings:
 *   **bold**  *italic*  `code`  [label](/href)
 * Everything is escaped FIRST, so post content can never inject markup.
 */
function inline(value: string): string {
  return escapeHtml(value)
    .replace(
      /`([^`]+)`/g,
      '<code class="rounded-md bg-[var(--app-surface-2)] px-1.5 py-0.5 font-mono text-[0.85em] text-[var(--app-fg)]">$1</code>'
    )
    .replace(
      /\[([^\]]+)\]\(([^)\s]+)\)/g,
      '<a href="$2" class="font-medium text-[var(--accent-text)] underline decoration-[var(--accent)]/30 underline-offset-4 transition-colors hover:decoration-[var(--accent)]">$1</a>'
    )
    .replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-[var(--app-fg)]">$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em class="italic">$1</em>');
}

/**
 * The one date formatter. Lives here (not in a component) so `blog.tsx`,
 * `blog-post.tsx` AND `scripts/prerender-blog.mjs` all render the same string —
 * a mismatch between the prerendered byline and the hydrated one is a visible flash.
 * UTC-pinned: a bare `new Date("2026-06-02")` is parsed as UTC midnight but printed
 * in local time, so anyone west of Greenwich would see the previous day.
 */
export function formatPostDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

/** Strips inline markup — for JSON-LD, meta tags and plain-text contexts. */
export function toPlainText(value: string): string {
  return value
    .replace(/\[([^\]]+)\]\([^)\s]+\)/g, "$1")
    .replace(/[`*]/g, "")
    .trim();
}

function renderBlock(block: Block, tone: CalloutTone): string {
  switch (block.type) {
    case "takeaways":
      return `<aside class="my-8 rounded-2xl border border-[var(--app-border)] p-6" style="background-color:${TONE_BG[tone]}">
        <h2 class="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent-text)]">The short answer</h2>
        <ul class="mt-4 space-y-2.5">
          ${block.items
            .map(
              (item) =>
                `<li class="flex gap-3 text-sm leading-7 text-[var(--app-fg)]"><span aria-hidden="true" class="mt-[9px] size-1.5 shrink-0 rounded-full bg-[var(--accent)]"></span><span>${inline(
                  item
                )}</span></li>`
            )
            .join("")}
        </ul>
      </aside>`;

    case "h2":
      return `<h2 id="${escapeHtml(
        block.id
      )}" class="scroll-mt-28 font-display text-2xl font-light tracking-tight text-[var(--app-fg)] mt-14 mb-4 sm:text-[28px]">${inline(
        block.text
      )}</h2>`;

    case "h3":
      return `<h3 class="mt-9 mb-3 text-base font-semibold tracking-tight text-[var(--app-fg)]">${inline(
        block.text
      )}</h3>`;

    case "p":
      return `<p class="my-5 text-[15px] leading-8 text-[var(--app-fg-muted)] sm:text-base">${inline(
        block.text
      )}</p>`;

    case "ul":
      return `<ul class="my-6 space-y-3">
        ${block.items
          .map(
            (item) =>
              `<li class="flex gap-3 text-[15px] leading-8 text-[var(--app-fg-muted)]"><span aria-hidden="true" class="mt-[13px] size-1.5 shrink-0 rounded-full bg-[var(--accent)] opacity-70"></span><span>${inline(
                item
              )}</span></li>`
          )
          .join("")}
      </ul>`;

    case "ol":
      return `<ol class="my-6 space-y-4">
        ${block.items
          .map(
            (item, index) =>
              `<li class="flex gap-4 text-[15px] leading-8 text-[var(--app-fg-muted)]"><span aria-hidden="true" class="mt-1 grid size-6 shrink-0 place-items-center rounded-full bg-[var(--accent-soft)] text-xs font-semibold text-[var(--accent-text)]">${
                index + 1
              }</span><span>${inline(item)}</span></li>`
          )
          .join("")}
      </ol>`;

    case "quote":
      return `<blockquote class="my-8 border-l-2 border-[var(--accent)] pl-5">
        <p class="font-display text-lg font-light italic leading-9 text-[var(--app-fg)]">${inline(
          block.text
        )}</p>
        ${
          block.cite
            ? `<cite class="mt-3 block text-xs not-italic text-[var(--app-fg-soft)]">— ${inline(
                block.cite
              )}</cite>`
            : ""
        }
      </blockquote>`;

    case "callout":
      return `<aside class="my-8 rounded-2xl border border-[var(--app-border)] p-5 sm:p-6" style="background-color:${
        TONE_BG[block.tone ?? "accent"]
      }">
        <h3 class="text-sm font-semibold text-[var(--app-fg)]">${inline(block.title)}</h3>
        <p class="mt-2 text-sm leading-7 text-[var(--app-fg-muted)]">${inline(block.text)}</p>
      </aside>`;

    case "table":
      return `<figure class="my-8">
        <div class="overflow-x-auto rounded-2xl border border-[var(--app-border)]">
          <table class="w-full min-w-[520px] border-collapse text-left text-sm">
            <thead>
              <tr class="bg-[var(--app-surface-2)]">
                ${block.head
                  .map(
                    (cell) =>
                      `<th scope="col" class="border-b border-[var(--app-border)] px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--app-fg-soft)]">${inline(
                        cell
                      )}</th>`
                  )
                  .join("")}
              </tr>
            </thead>
            <tbody>
              ${block.rows
                .map(
                  (row) =>
                    `<tr class="border-b border-[var(--app-border)] last:border-0">${row
                      .map(
                        (cell, index) =>
                          `<td class="px-4 py-3.5 align-top leading-7 ${
                            index === 0
                              ? "font-medium text-[var(--app-fg)]"
                              : "text-[var(--app-fg-muted)]"
                          }">${inline(cell)}</td>`
                      )
                      .join("")}</tr>`
                )
                .join("")}
            </tbody>
          </table>
        </div>
        ${
          block.caption
            ? `<figcaption class="mt-3 text-xs leading-6 text-[var(--app-fg-soft)]">${inline(
                block.caption
              )}</figcaption>`
            : ""
        }
      </figure>`;

    case "figure":
      return `<figure class="my-10">
        <div class="overflow-hidden rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-4">
          <div class="aspect-[5/3] w-full">${renderArt(block.art, tone)}</div>
        </div>
        ${
          block.caption
            ? `<figcaption class="mt-3 text-center text-xs leading-6 text-[var(--app-fg-soft)]">${inline(
                block.caption
              )}</figcaption>`
            : ""
        }
      </figure>`;

    case "sample":
      return `<figure class="my-6 overflow-hidden rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface-2)]">
        ${
          block.label
            ? `<figcaption class="border-b border-[var(--app-border)] px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-[var(--app-fg-soft)]">${inline(
                block.label
              )}</figcaption>`
            : ""
        }
        <pre class="overflow-x-auto whitespace-pre-wrap break-words px-4 py-4 font-mono text-[13px] leading-7 text-[var(--app-fg)]">${escapeHtml(
          block.text
        )}</pre>
      </figure>`;

    default:
      return "";
  }
}

/** The article body only — no header, no FAQ, no CTA. */
export function renderPostBodyHtml(post: Post): string {
  return post.body.map((block) => renderBlock(block, post.tone)).join("\n");
}

/** The on-page FAQ. Mirrors the FAQPage JSON-LD exactly. */
export function renderPostFaqHtml(post: Post): string {
  if (post.faq.length === 0) return "";
  return `<section class="mt-16 border-t border-[var(--app-border)] pt-10">
    <h2 id="faq" class="scroll-mt-28 font-display text-2xl font-light tracking-tight text-[var(--app-fg)]">Frequently asked questions</h2>
    <div class="mt-6 space-y-3">
      ${post.faq
        .map(
          (item) => `<details class="group rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] px-5 py-4 transition-colors hover:border-[var(--app-border-strong)]">
            <summary class="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium text-[var(--app-fg)]">
              <span>${inline(item.q)}</span>
              <span aria-hidden="true" class="grid size-7 shrink-0 place-items-center rounded-full bg-[var(--accent-soft)] text-[var(--accent-text)] transition-transform duration-300 group-open:rotate-45">+</span>
            </summary>
            <p class="mt-3 border-t border-[var(--app-border)] pt-3 text-sm leading-7 text-[var(--app-fg-muted)]">${inline(
              item.a
            )}</p>
          </details>`
        )
        .join("")}
    </div>
  </section>`;
}

/** Table of contents built from the h2s. */
export function renderTocHtml(post: Post): string {
  const headings = post.body.filter(
    (block): block is Extract<Block, { type: "h2" }> => block.type === "h2"
  );
  if (headings.length < 3) return "";
  return `<nav aria-label="On this page" class="mb-10 rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-5">
    <h2 class="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--app-fg-soft)]">On this page</h2>
    <ol class="mt-3 space-y-2">
      ${headings
        .map(
          (heading) =>
            `<li><a href="#${escapeHtml(
              heading.id
            )}" class="text-sm leading-6 text-[var(--app-fg-muted)] transition-colors hover:text-[var(--accent-text)]">${inline(
              heading.text
            )}</a></li>`
        )
        .join("")}
    </ol>
  </nav>`;
}

/** Word count across every text-bearing block — used to sanity-check post length. */
export function countWords(post: Post): number {
  const parts: string[] = [post.title, post.excerpt];
  for (const block of post.body) {
    if (block.type === "p" || block.type === "h2" || block.type === "h3") parts.push(block.text);
    if (block.type === "ul" || block.type === "ol" || block.type === "takeaways")
      parts.push(block.items.join(" "));
    if (block.type === "quote" || block.type === "sample") parts.push(block.text);
    if (block.type === "callout") parts.push(`${block.title} ${block.text}`);
    if (block.type === "table") parts.push([...block.head, ...block.rows.flat()].join(" "));
  }
  for (const item of post.faq) parts.push(`${item.q} ${item.a}`);
  return toPlainText(parts.join(" ")).split(/\s+/).filter(Boolean).length;
}
